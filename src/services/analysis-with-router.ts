/**
 * Analysis Service med AI Router
 *
 * Använder AI Router för att automatiskt välja rätt provider:
 * - text → Claude (för supportärendeanalys)
 * - planning/reasoning → z.ai (framtida användning)
 */

import { query } from '../database/connection';
import { SupportTicket, AnalysisResult } from '../types';
import * as dotenv from 'dotenv';

// Import intelligence module (v1.0.0)
import { INTELLIGENCE_VERSION } from '../intelligence/version';
import { buildAnalysisPrompt, buildCritiquePrompt, TicketInput } from '../intelligence/prompt';
import { isValidIntelligenceOutput, IntelligenceOutput, IntelligenceCritique } from '../intelligence/schema';
import config from '../intelligence/config.json';
import { checkAndSendChurnAlerts } from './email-alerts';

// Import AI Router
import { getAIRouter, TaskType } from '../ai';

dotenv.config();

const BATCH_SIZE = config.processing.batch_size;
const RATE_LIMIT_DELAY = config.processing.rate_limit_delay_ms;

/**
 * Convert SupportTicket to TicketInput format expected by intelligence module
 */
function toTicketInput(ticket: SupportTicket): TicketInput {
  return {
    customer_id: ticket.customer_id,
    subject: ticket.subject || null,
    message: ticket.message,
  };
}

/**
 * Parse and validate AI response using intelligence schema
 */
function parseIntelligenceResponse(
  response: string,
  ticketCount: number
): Record<string, IntelligenceOutput> {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Handle multiple JSON objects (models sometimes return separate objects per ticket)
    let parsed: Record<string, any>;
    if (cleaned.includes('}\n\n{') || cleaned.includes('}\n{')) {
      // Multiple JSON objects - merge them
      parsed = {};
      const jsonObjects = cleaned.split(/\n\n(?={)/);
      for (const jsonStr of jsonObjects) {
        const obj = JSON.parse(jsonStr.trim());
        Object.assign(parsed, obj);
      }
    } else {
      // Single JSON object
      parsed = JSON.parse(cleaned);
    }

    const validated: Record<string, IntelligenceOutput> = {};

    for (let i = 0; i < ticketCount; i++) {
      const key = `ticket_${i + 1}`;
      const analysis = parsed[key];

      if (!analysis) {
        console.warn(`Missing analysis for ${key}`);
        continue;
      }

      // Validate using intelligence schema
      if (!isValidIntelligenceOutput(analysis)) {
        console.error(`Invalid intelligence output for ${key}:`, analysis);
        throw new Error(`Intelligence output failed validation for ${key}`);
      }

      validated[key] = analysis;
    }

    return validated;
  } catch (error) {
    console.error('Error parsing intelligence response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse intelligence output');
  }
}

/**
 * Analyze tickets using AI Router
 * Routes to Claude for 'text' task type
 */
async function analyzeBatchWithRouter(
  tickets: SupportTicket[]
): Promise<Record<string, IntelligenceOutput>> {
  // Convert to intelligence input format
  const ticketInputs = tickets.map(toTicketInput);

  // Build prompt using intelligence module
  const prompt = buildAnalysisPrompt(ticketInputs);

  try {
    // Get AI router instance
    const router = getAIRouter();

    console.log('AI Router: Routing ticket analysis to Claude (text task)');

    // Use router to get analysis (text task → Claude)
    const response = await router.route({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      taskType: 'text' as TaskType, // Support ticket analysis = text task
      maxTokens: config.processing.max_tokens,
    });

    console.log(`AI Router: Used ${response.provider} (${response.model})`);

    // Parse and validate response
    const analyses = parseIntelligenceResponse(response.content, tickets.length);

    return analyses;
  } catch (error) {
    console.error('AI Router analysis error:', error);
    throw error;
  }
}

/**
 * Run critique pass using AI Router
 * Uses Claude for critique/quality assurance
 */
async function critiqueAnalyses(
  tickets: SupportTicket[],
  analyses: Record<string, IntelligenceOutput>
): Promise<Record<string, IntelligenceCritique>> {
  if (!config.critique.enabled) {
    // Return empty critiques if disabled
    const emptyCritiques: Record<string, IntelligenceCritique> = {};
    Object.keys(analyses).forEach((key) => {
      emptyCritiques[key] = {
        critique_confidence: 1.0,
        critique_notes: [],
        inconsistencies: [],
        missing_evidence: [],
        flags: [],
      };
    });
    return emptyCritiques;
  }

  const ticketInputs = tickets.map(toTicketInput);
  const critiquePrompt = buildCritiquePrompt(ticketInputs, analyses);

  try {
    const router = getAIRouter();

    console.log('AI Router: Routing critique to Claude (reasoning task)');

    // Use router for critique (reasoning task → could be z.ai in future)
    const response = await router.route({
      messages: [
        {
          role: 'user',
          content: critiquePrompt,
        },
      ],
      taskType: 'reasoning' as TaskType,
      maxTokens: config.critique.max_tokens,
    });

    console.log(`AI Router: Used ${response.provider} (${response.model})`);

    // Parse critique response
    const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return parsed;
  } catch (error) {
    console.error('Critique pass error:', error);
    // Don't fail the entire batch if critique fails, just log it
    const fallbackCritiques: Record<string, IntelligenceCritique> = {};
    Object.keys(analyses).forEach((key) => {
      fallbackCritiques[key] = {
        critique_confidence: 0.5,
        critique_notes: ['Critique pass failed'],
        inconsistencies: [],
        missing_evidence: [],
        flags: ['critique_error'],
      };
    });
    return fallbackCritiques;
  }
}

/**
 * Save analysis to database with intelligence version and new v1.0.0 fields
 */
async function saveAnalysis(
  ticketId: string,
  organizationId: string,
  analysis: IntelligenceOutput,
  critique: IntelligenceCritique
) {
  // Insert or update main analysis
  const analysisSql = `
    INSERT INTO ticket_analysis (
      ticket_id,
      organization_id,
      sentiment,
      frustration_level,
      churn_risk,
      categories,
      feature_requests,
      key_issues,
      recommended_action,
      intelligence_version,
      confidence,
      evidence
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (ticket_id) DO UPDATE SET
      sentiment = EXCLUDED.sentiment,
      frustration_level = EXCLUDED.frustration_level,
      churn_risk = EXCLUDED.churn_risk,
      categories = EXCLUDED.categories,
      feature_requests = EXCLUDED.feature_requests,
      key_issues = EXCLUDED.key_issues,
      recommended_action = EXCLUDED.recommended_action,
      intelligence_version = EXCLUDED.intelligence_version,
      confidence = EXCLUDED.confidence,
      evidence = EXCLUDED.evidence,
      analyzed_at = NOW()
    RETURNING id
  `;

  const analysisResult = await query(analysisSql, [
    ticketId,
    organizationId,
    analysis.sentiment,
    analysis.frustration_level,
    analysis.churn_risk,
    analysis.categories,
    analysis.feature_requests,
    analysis.key_issues,
    analysis.recommended_action,
    INTELLIGENCE_VERSION,
    analysis.confidence,
    analysis.evidence,
  ]);

  const analysisId = analysisResult.rows[0].id;

  // Insert or update critique
  const critiqueSql = `
    INSERT INTO ticket_analysis_critique (
      ticket_analysis_id,
      critique_confidence,
      critique_notes,
      inconsistencies,
      missing_evidence,
      flags
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (ticket_analysis_id) DO UPDATE SET
      critique_confidence = EXCLUDED.critique_confidence,
      critique_notes = EXCLUDED.critique_notes,
      inconsistencies = EXCLUDED.inconsistencies,
      missing_evidence = EXCLUDED.missing_evidence,
      flags = EXCLUDED.flags,
      created_at = NOW()
  `;

  await query(critiqueSql, [
    analysisId,
    critique.critique_confidence,
    critique.critique_notes,
    critique.inconsistencies,
    critique.missing_evidence,
    critique.flags,
  ]);
}

/**
 * Get unanalyzed tickets for an organization
 */
async function getUnanalyzedTickets(organizationId: string, limit: number): Promise<SupportTicket[]> {
  const sql = `
    SELECT st.*
    FROM support_tickets st
    LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
    WHERE st.organization_id = $1
      AND ta.id IS NULL
    ORDER BY st.ticket_timestamp DESC
    LIMIT $2
  `;

  const result = await query(sql, [organizationId, limit]);
  return result.rows;
}

/**
 * Main analysis function with AI Router
 */
export async function analyzeTickets(organizationId: string): Promise<AnalysisResult> {
  try {
    console.log(`Starting ticket analysis for organization: ${organizationId}`);
    console.log(`Using AI Router for provider selection`);

    let totalAnalyzed = 0;
    const errors: string[] = [];

    while (true) {
      // Get next batch of unanalyzed tickets
      const tickets = await getUnanalyzedTickets(organizationId, BATCH_SIZE);

      if (tickets.length === 0) {
        console.log('No more tickets to analyze');
        break;
      }

      console.log(`Analyzing batch of ${tickets.length} tickets...`);

      try {
        // Primary analysis pass (using AI Router → Claude)
        const analyses = await analyzeBatchWithRouter(tickets);

        // Critique pass (using AI Router → z.ai or Claude)
        const critiques = await critiqueAnalyses(tickets, analyses);

        // Save each analysis with critique
        for (let i = 0; i < tickets.length; i++) {
          const key = `ticket_${i + 1}`;
          const analysis = analyses[key];
          const critique = critiques[key];

          if (analysis && critique) {
            await saveAnalysis(tickets[i].id, organizationId, analysis, critique);
            totalAnalyzed++;
          } else {
            console.warn(`Missing analysis or critique for ticket ${i + 1}`);
          }
        }

        console.log(`Batch complete. Total analyzed: ${totalAnalyzed}`);
      } catch (error) {
        console.error('Batch analysis failed:', error);
        errors.push(`Batch failed: ${error}`);

        // Continue with next batch despite errors
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
    }

    console.log(`Analysis complete. Total tickets analyzed: ${totalAnalyzed}`);

    // Check for high churn risk and send alerts
    if (totalAnalyzed > 0) {
      try {
        console.log('Checking for high churn risk tickets...');
        const alertResult = await checkAndSendChurnAlerts(organizationId);
        console.log(`Email alerts sent: ${alertResult.alertsSent}`);
      } catch (alertError) {
        console.error('Error sending churn alerts:', alertError);
        // Don't fail the analysis if alerts fail
      }
    }

    return {
      success: true,
      tickets_analyzed: totalAnalyzed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Analysis failed:', error);
    return {
      success: false,
      tickets_analyzed: 0,
      errors: [String(error)],
    };
  }
}

// Run if called directly
if (require.main === module) {
  const orgId = process.argv[2];

  if (!orgId) {
    console.error('Usage: node analysis-with-router.js <organization_id>');
    process.exit(1);
  }

  analyzeTickets(orgId)
    .then((result) => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
