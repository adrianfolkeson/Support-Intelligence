/**
 * Intelligence Definition
 *
 * Human-readable description of what this intelligence does, its purpose,
 * capabilities, and explicit limitations.
 */

import { INTELLIGENCE_VERSION } from './version';
import config from './config.json';

export const INTELLIGENCE_DEFINITION = {
  /**
   * Identity
   */
  name: config.intelligence.name,
  version: INTELLIGENCE_VERSION,
  model: config.intelligence.model,

  /**
   * What this intelligence DOES
   */
  purpose: `
Analyzes customer support tickets to extract sentiment, risk signals, and actionable
insights for support teams. Specifically designed for B2B SaaS companies receiving
support requests via email, chat, or ticketing systems.

The intelligence performs:
1. Sentiment classification (positive, neutral, negative, frustrated)
2. Quantitative risk scoring (frustration level 0-10, churn risk 0-10)
3. Topic categorization (bug, feature request, billing, etc.)
4. Structured data extraction (feature requests, key issues)
5. Support action recommendations (prioritize, escalate, routine, investigate, close)
6. Self-assessment (confidence scoring and evidence justification)
7. Quality validation (critique pass to catch inconsistencies)
  `.trim(),

  /**
   * What this intelligence IS DESIGNED FOR
   */
  designedFor: [
    'B2B SaaS customer support tickets',
    'English language text (subject + message body)',
    'Batch analysis of 1-10 tickets at a time',
    'Tickets from authenticated customers with account context',
    'Identifying high-churn-risk customers requiring immediate attention',
    'Aggregating feature request patterns across customers',
    'Triaging incoming tickets by urgency and category',
    'Providing objective sentiment analysis free from human bias',
  ],

  /**
   * What this intelligence IS NOT DESIGNED FOR
   */
  notDesignedFor: [
    'Real-time conversation analysis (analyzes completed tickets, not live chat)',
    'Multi-turn conversation threading (each ticket analyzed independently)',
    'Non-English languages (prompts and training data are English-only)',
    'B2C consumer support (calibrated for B2B SaaS context and stakes)',
    'Tickets without customer context (requires customer_id for churn risk assessment)',
    'Automated responses (generates insights, not customer-facing replies)',
    'Legal/compliance decisions (provides risk signals, not definitive judgments)',
    'Historical pattern learning (stateless, does not adapt from past analyses)',
  ],

  /**
   * Input Requirements
   */
  inputRequirements: {
    format: 'Array of ticket objects with customer_id, subject (optional), and message',
    batchSize: {
      min: 1,
      max: config.processing.batch_size,
      recommended: config.processing.batch_size,
    },
    fields: {
      customer_id: 'Required: unique identifier for churn risk context',
      subject: 'Optional: ticket subject line (can be null)',
      message: 'Required: main ticket content (non-empty string)',
    },
    constraints: [
      'message must be non-empty',
      'customer_id should be consistent across tickets from same customer',
      'Total batch size should not exceed token limits (~4000 tokens)',
      'English text strongly preferred (other languages may produce degraded results)',
    ],
  },

  /**
   * Output Guarantees
   */
  outputGuarantees: {
    format: 'JSON object with one key per ticket (ticket_1, ticket_2, etc.)',
    fields: 'All fields defined in IntelligenceOutput schema (see schema.ts)',
    validation: 'Runtime validation via isValidIntelligenceOutput() type guard',
    versioning: 'intelligence_version stored with each analysis for auditability',
    consistency: [
      'Sentiment is always one of: positive, neutral, negative, frustrated',
      'frustration_level is always 0-10 integer',
      'churn_risk is always 0-10 integer',
      'confidence is always 0.0-1.0 float',
      'categories is always array of strings from allowed list',
      'evidence is always array of 2-5 justification strings',
      'recommended_action is always one of: prioritize, escalate, routine_response, investigate, close',
    ],
    critique: {
      enabled: config.critique.enabled,
      fields: 'critique_confidence, critique_notes, inconsistencies, missing_evidence, flags',
      purpose: 'Second-pass validation to catch analysis errors or inconsistencies',
    },
  },

  /**
   * Known Limitations
   */
  knownLimitations: {
    contextual: [
      'No access to customer history (e.g., past tickets, account age, contract value)',
      'No access to product context (e.g., which features customer uses, subscription tier)',
      'Cannot follow conversation threads across multiple tickets',
      'Cannot access external systems (CRM, usage analytics, billing) for additional signals',
    ],
    linguistic: [
      'English-only prompts (non-English tickets may produce unreliable results)',
      'No domain-specific terminology tuning (generic SaaS vocabulary)',
      'Cannot understand images, attachments, or formatted content',
      'May misinterpret sarcasm, cultural context, or idiomatic expressions',
    ],
    technical: [
      'Batch size limited to 10 tickets to fit in model context window',
      'Processing time: ~5-10 seconds per batch (includes API latency + critique pass)',
      'No streaming output (must wait for complete batch analysis)',
      'API rate limits: 1000ms delay between calls (configurable)',
    ],
    analytical: [
      'Churn risk scoring is heuristic-based (no ML training on historical churn data)',
      'Cannot predict actual churn probability (provides relative risk signal only)',
      'Confidence scores are model-generated (not calibrated against ground truth)',
      'May over/under-estimate urgency without business context (contract size, renewal date)',
    ],
    operational: [
      'No automatic model updates (intelligence version must be manually updated)',
      'No A/B testing framework (cannot compare prompt variations systematically)',
      'No feedback loop (model does not learn from human corrections)',
      'Cost scales linearly with volume (~$1.50 per 1000 tickets)',
    ],
  },

  /**
   * Assumptions Embedded in This Intelligence
   */
  assumptions: config.assumptions,

  /**
   * Versioning and Auditability
   */
  versioning: {
    strategy: 'Intelligence version stored with each analysis result',
    format: 'support-intel-v<major>.<minor>.<patch>',
    compatibility: 'Breaking changes increment major version',
    auditability: 'VERSION_HISTORY in version.ts documents all changes',
    rationale: `
Versioning enables:
- Comparing analyses across time (did prompt changes improve accuracy?)
- Debugging regressions (which version produced this odd result?)
- A/B testing (run two versions side-by-side on same tickets)
- Compliance auditing (which model/prompt was used for this decision?)
    `.trim(),
  },

  /**
   * Usage Example
   */
  usageExample: `
import { analyzeTickets } from './intelligence';

const tickets = [
  {
    customer_id: 'cust_abc123',
    subject: 'Cannot access dashboard',
    message: 'I have been trying to log in for 2 hours. This is blocking my team.',
  },
];

const results = await analyzeTickets(tickets);
// Returns:
// {
//   ticket_1: {
//     sentiment: 'frustrated',
//     frustration_level: 7,
//     churn_risk: 6,
//     categories: ['technical_issue', 'complaint'],
//     feature_requests: [],
//     key_issues: ['Login authentication failure blocking team access'],
//     recommended_action: 'escalate',
//     confidence: 0.85,
//     evidence: [
//       'Customer used phrase "blocking my team" indicating business impact',
//       'Frustration evident from "2 hours" wait time mention',
//       'No mention of cancellation but high urgency requires escalation'
//     ],
//     critique: {
//       critique_confidence: 0.9,
//       critique_notes: ['Churn risk appropriate for severity', 'Evidence well-supported'],
//       inconsistencies: [],
//       missing_evidence: [],
//       flags: []
//     }
//   }
// }
  `.trim(),
};

/**
 * Export as human-readable string for documentation
 */
export function getIntelligenceDefinitionText(): string {
  return `
# ${INTELLIGENCE_DEFINITION.name} (${INTELLIGENCE_DEFINITION.version})

## Purpose
${INTELLIGENCE_DEFINITION.purpose}

## Designed For
${INTELLIGENCE_DEFINITION.designedFor.map((item) => `- ${item}`).join('\n')}

## NOT Designed For
${INTELLIGENCE_DEFINITION.notDesignedFor.map((item) => `- ${item}`).join('\n')}

## Input Requirements
- Format: ${INTELLIGENCE_DEFINITION.inputRequirements.format}
- Batch size: ${INTELLIGENCE_DEFINITION.inputRequirements.batchSize.min}-${INTELLIGENCE_DEFINITION.inputRequirements.batchSize.max} tickets (recommended: ${INTELLIGENCE_DEFINITION.inputRequirements.batchSize.recommended})
- Required fields: ${Object.entries(INTELLIGENCE_DEFINITION.inputRequirements.fields).map(([k, v]) => `${k} (${v})`).join(', ')}

## Output Guarantees
- Format: ${INTELLIGENCE_DEFINITION.outputGuarantees.format}
- Validation: ${INTELLIGENCE_DEFINITION.outputGuarantees.validation}
- Critique pass: ${INTELLIGENCE_DEFINITION.outputGuarantees.critique.enabled ? 'Enabled' : 'Disabled'}

## Known Limitations
### Contextual
${INTELLIGENCE_DEFINITION.knownLimitations.contextual.map((item) => `- ${item}`).join('\n')}

### Linguistic
${INTELLIGENCE_DEFINITION.knownLimitations.linguistic.map((item) => `- ${item}`).join('\n')}

### Technical
${INTELLIGENCE_DEFINITION.knownLimitations.technical.map((item) => `- ${item}`).join('\n')}

### Analytical
${INTELLIGENCE_DEFINITION.knownLimitations.analytical.map((item) => `- ${item}`).join('\n')}

### Operational
${INTELLIGENCE_DEFINITION.knownLimitations.operational.map((item) => `- ${item}`).join('\n')}

## Version History
See version.ts for full changelog.

## Usage Example
\`\`\`typescript
${INTELLIGENCE_DEFINITION.usageExample}
\`\`\`
  `.trim();
}
