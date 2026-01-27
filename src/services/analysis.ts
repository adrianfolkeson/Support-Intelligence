import Anthropic from '@anthropic-ai/sdk';
import { query } from '../database/connection';
import { SupportTicket, ClaudeAnalysisOutput, AnalysisResult } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BATCH_SIZE = 10; // Analyze 10 tickets per API call
const RATE_LIMIT_DELAY = 1000; // 1 second between calls

/**
 * Build the analysis prompt for a batch of tickets
 */
function buildAnalysisPrompt(tickets: SupportTicket[]): string {
  const ticketsList = tickets
    .map(
      (t, idx) => `
**Ticket ${idx + 1}**
Customer: ${t.customer_id}
Subject: ${t.subject || 'No subject'}
Message: ${t.message}
---
`
    )
    .join('\n');

  return `You are an AI analyst for a SaaS company. Analyze the following support tickets and extract actionable insights.

${ticketsList}

For EACH ticket, provide a JSON object with this structure:
{
  "ticket_${idx}": {
    "sentiment": "positive|neutral|negative|frustrated",
    "frustration_level": 0-10,
    "churn_risk": 0-10,
    "categories": ["bug", "feature_request", "billing", "technical_issue", "question", etc.],
    "feature_requests": ["specific feature mentioned"],
    "key_issues": ["main problem described"],
    "recommended_action": "what the support team should do"
  }
}

Guidelines:
- frustration_level: 0=calm, 10=extremely frustrated
- churn_risk: 0=no risk, 10=immediate churn risk
- categories: can include multiple
- feature_requests: extract specific features the customer wants
- key_issues: identify the core problem
- recommended_action: prioritize, escalate, or routine response

Return ONLY valid JSON. No other text.`;
}

/**
 * Parse Claude's response into structured analysis
 */
function parseClaudeResponse(response: string, tickets: SupportTicket[]): ClaudeAnalysisOutput[] {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const results: ClaudeAnalysisOutput[] = [];

    for (let i = 0; i < tickets.length; i++) {
      const key = `ticket_${i + 1}`;
      const analysis = parsed[key];

      if (!analysis) {
        console.warn(`Missing analysis for ticket ${i + 1}`);
        continue;
      }

      results.push({
        sentiment: analysis.sentiment || 'neutral',
        frustration_level: Math.min(10, Math.max(0, analysis.frustration_level || 0)),
        churn_risk: Math.min(10, Math.max(0, analysis.churn_risk || 0)),
        categories: Array.isArray(analysis.categories) ? analysis.categories : [],
        feature_requests: Array.isArray(analysis.feature_requests) ? analysis.feature_requests : [],
        key_issues: Array.isArray(analysis.key_issues) ? analysis.key_issues : [],
        recommended_action: analysis.recommended_action || null,
      });
    }

    return results;
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    console.error('Raw response:', response);
    throw new Error('Failed to parse AI analysis');
  }
}

/**
 * Call Claude API to analyze a batch of tickets
 */
async function analyzeBatchWithClaude(tickets: SupportTicket[]): Promise<ClaudeAnalysisOutput[]> {
  const prompt = buildAnalysisPrompt(tickets);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    return parseClaudeResponse(responseText, tickets);
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Save analysis to database
 */
async function saveAnalysis(ticketId: string, organizationId: string, analysis: ClaudeAnalysisOutput) {
  const sql = `
    INSERT INTO ticket_analysis (
      ticket_id,
      organization_id,
      sentiment,
      frustration_level,
      churn_risk,
      categories,
      feature_requests,
      key_issues,
      recommended_action
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (ticket_id) DO UPDATE SET
      sentiment = EXCLUDED.sentiment,
      frustration_level = EXCLUDED.frustration_level,
      churn_risk = EXCLUDED.churn_risk,
      categories = EXCLUDED.categories,
      feature_requests = EXCLUDED.feature_requests,
      key_issues = EXCLUDED.key_issues,
      recommended_action = EXCLUDED.recommended_action,
      analyzed_at = NOW()
  `;

  await query(sql, [
    ticketId,
    organizationId,
    analysis.sentiment,
    analysis.frustration_level,
    analysis.churn_risk,
    analysis.categories,
    analysis.feature_requests,
    analysis.key_issues,
    analysis.recommended_action,
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
 * Main analysis function
 */
export async function analyzeTickets(organizationId: string): Promise<AnalysisResult> {
  try {
    console.log(`Starting ticket analysis for organization: ${organizationId}`);

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
        const analyses = await analyzeBatchWithClaude(tickets);

        // Save each analysis
        for (let i = 0; i < tickets.length; i++) {
          if (analyses[i]) {
            await saveAnalysis(tickets[i].id, organizationId, analyses[i]);
            totalAnalyzed++;
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
    console.error('Usage: node analysis.js <organization_id>');
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
