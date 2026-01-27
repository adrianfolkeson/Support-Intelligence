/**
 * Intelligence Prompts
 * 
 * All prompt construction logic for the Support Ticket Analyzer intelligence.
 * Prompts are versioned alongside the intelligence and should not be modified
 * without incrementing the intelligence version.
 */

import config from './config.json';

export interface TicketInput {
  customer_id: string;
  subject: string | null;
  message: string;
}

/**
 * Build the main analysis prompt for a batch of tickets
 * 
 * This prompt defines:
 * - The AI's role and context
 * - The exact output format expected
 * - Scoring guidelines and scales
 * - Quality standards
 */
export function buildAnalysisPrompt(tickets: TicketInput[]): string {
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

  const allowedCategories = config.categories.allowed.join(', ');
  const allowedSentiments = config.sentiment.allowed.join('|');

  return `You are an AI analyst for a SaaS company. Analyze the following support tickets and extract actionable insights.

${ticketsList}

For EACH ticket, provide a JSON object with this structure:
{
  "ticket_1": {
    "sentiment": "${allowedSentiments}",
    "frustration_level": 0-10,
    "churn_risk": 0-10,
    "categories": ["${allowedCategories}"],
    "feature_requests": ["specific feature mentioned"],
    "key_issues": ["main problem described"],
    "recommended_action": "what the support team should do",
    "confidence": 0.0-1.0,
    "evidence": ["reason 1", "reason 2", "reason 3"]
  }
}

Guidelines:

**Scoring Scales:**
- frustration_level: ${config.scales.frustration_level.description}
- churn_risk: ${config.scales.churn_risk.description}
- confidence: ${config.scales.confidence.description}

**Sentiment Categories:**
${config.sentiment.rationale}

**Categories:**
- Choose from: ${allowedCategories}
- Multiple categories allowed
- Use "other" for edge cases

**Feature Requests:**
- Extract SPECIFIC features the customer mentions wanting
- Be concrete: "dark mode" not "UI improvements"
- Empty array if none mentioned

**Key Issues:**
- Identify the CORE problem, not symptoms
- "Login fails with 500 error" not "Can't access app"
- Maximum 3 issues per ticket

**Recommended Action:**
- Choose from: "prioritize", "escalate", "routine_response", "investigate", "close"
- One action per ticket

**Confidence:**
- 1.0 = Very clear signal, unambiguous intent
- 0.7-0.9 = Clear signal with some interpretation needed
- 0.4-0.6 = Moderate ambiguity or missing context
- 0.0-0.3 = High ambiguity, needs human review

**Evidence:**
- Provide 2-5 short reasons for your ratings
- Reference specific phrases from the ticket
- Explain churn_risk and frustration_level scores
- Example: "Customer used word 'cancel' twice", "Reported issue blocking core workflow"

Return ONLY valid JSON. No markdown, no other text.`;
}

/**
 * Build the critique prompt for validating analysis results
 * 
 * This second-pass prompt reviews the initial analysis for:
 * - Internal consistency
 * - Evidence quality
 * - Missing information
 * - Edge cases requiring human review
 */
export function buildCritiquePrompt(
  tickets: TicketInput[],
  analyses: Record<string, any>
): string {
  const ticketsAndAnalyses = tickets
    .map((t, idx) => {
      const key = `ticket_${idx + 1}`;
      const analysis = analyses[key];

      return `
**Ticket ${idx + 1}**
Subject: ${t.subject || 'No subject'}
Message: ${t.message}

**Analysis:**
${JSON.stringify(analysis, null, 2)}
---
`;
    })
    .join('\n');

  return `You are a quality assurance analyst reviewing support ticket analyses for consistency and validity.

${ticketsAndAnalyses}

For EACH ticket, review the analysis and provide a critique:

{
  "ticket_1": {
    "critique_confidence": 0.0-1.0,
    "critique_notes": ["observation 1", "observation 2"],
    "inconsistencies": ["field X contradicts field Y"],
    "missing_evidence": ["churn_risk lacks justification"],
    "flags": ["requires human review because..."]
  }
}

**Check for:**

1. **Internal Consistency:**
   - Does churn_risk align with sentiment? (e.g., churn_risk=9 + sentiment=positive is suspicious)
   - Does frustration_level match the ticket tone?
   - Are categories relevant to the described issue?

2. **Evidence Quality:**
   - Does the evidence array actually support the ratings?
   - Are evidence items specific and referencing the ticket?
   - Is evidence vague or generic?

3. **Confidence Calibration:**
   - Is the confidence score justified?
   - Should it be lower due to ambiguity?
   - Should it be higher due to clear signals?

4. **Missing Information:**
   - Are there feature requests implied but not extracted?
   - Are there issues mentioned but not captured in key_issues?
   - Is recommended_action appropriate for the situation?

5. **Edge Cases:**
   - Does this ticket need human review?
   - Is it unclear or requiring domain knowledge?
   - Does it contain sensitive information?

**Critique Confidence:**
- 1.0 = Analysis is clearly correct and well-justified
- 0.7-0.9 = Analysis is mostly correct with minor issues
- 0.4-0.6 = Analysis has moderate issues or questionable ratings
- 0.0-0.3 = Analysis has major problems, should be re-analyzed

**Inconsistencies:**
- List any contradictions between fields
- Empty array if none found

**Missing Evidence:**
- List fields that lack proper justification
- Empty array if all fields well-supported

**Flags:**
- Use sparingly for cases requiring human attention
- Empty array if analysis seems sound

Return ONLY valid JSON. No markdown, no other text.`;
}

/**
 * Prompt Design Rationale (embedded for auditability)
 * 
 * Why these prompts work:
 * 
 * 1. **Explicit structure**: JSON schema in prompt reduces parsing failures
 * 2. **Concrete examples**: "dark mode" vs "UI improvements" guides specificity
 * 3. **Scale definitions**: In-line descriptions prevent misinterpretation
 * 4. **Evidence requirement**: Forces model to justify ratings, reduces hallucination
 * 5. **Critique pass**: Catches inconsistencies model wouldn't self-correct in single pass
 * 6. **Confidence scoring**: Enables filtering for human review, adapts to model uncertainty
 * 
 * Known limitations:
 * 
 * 1. **No conversation context**: Each ticket analyzed independently
 * 2. **English only**: Prompts assume English input
 * 3. **Domain agnostic**: No SaaS-specific domain knowledge injected
 * 4. **No historical patterns**: Doesn't learn from past analyses
 * 5. **Batch size constraint**: 10 tickets max to fit in context window
 */

export const PROMPT_METADATA = {
  version: config.intelligence.version,
  model: config.intelligence.model,
  max_tokens: config.processing.max_tokens,
  temperature: undefined, // Uses model default
  techniques: [
    'structured_output',
    'in-context_examples',
    'scale_definitions',
    'evidence_requirements',
    'two-pass_validation',
  ],
  limitations: [
    'no_conversation_threading',
    'english_only',
    'no_domain_knowledge',
    'no_historical_learning',
    'batch_size_limited',
  ],
};
