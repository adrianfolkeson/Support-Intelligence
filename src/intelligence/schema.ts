/**
 * Intelligence Output Schema
 * 
 * Defines the strict contract for intelligence output.
 * All fields are required unless explicitly marked optional.
 */

export type Sentiment = 'positive' | 'neutral' | 'negative' | 'frustrated';

export interface IntelligenceOutput {
  // Core sentiment analysis
  sentiment: Sentiment;
  
  // Quantitative risk metrics (0-10 scale)
  frustration_level: number; // 0 = calm, 10 = extremely frustrated
  churn_risk: number;        // 0 = no risk, 10 = immediate cancellation risk
  
  // Classification
  categories: string[];      // Multiple allowed: bug, feature_request, billing, etc.
  
  // Extracted structured data
  feature_requests: string[]; // Specific features mentioned
  key_issues: string[];       // Core problems identified
  
  // Recommendation
  recommended_action: string | null; // What support team should do
  
  // NEW in v1.0.0: Confidence and evidence
  confidence: number;         // 0.0-1.0: Model's confidence in analysis
  evidence: string[];         // Short textual reasons for ratings
}

export interface IntelligenceCritique {
  // Overall critique assessment
  critique_confidence: number;  // 0.0-1.0: Confidence in the original analysis
  critique_notes: string[];     // Issues found or validation confirmations
  
  // Specific field validations
  inconsistencies: string[];    // e.g., "churn_risk=9 but sentiment=positive"
  missing_evidence: string[];   // Fields lacking justification
  flags: string[];              // Warnings for human review
}

export interface AnalysisWithCritique extends IntelligenceOutput {
  critique: IntelligenceCritique;
}

/**
 * JSON Schema for validation
 * 
 * Use this for runtime validation of Claude output before saving to database.
 */
export const INTELLIGENCE_OUTPUT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: [
    'sentiment',
    'frustration_level',
    'churn_risk',
    'categories',
    'feature_requests',
    'key_issues',
    'confidence',
    'evidence',
  ],
  properties: {
    sentiment: {
      type: 'string',
      enum: ['positive', 'neutral', 'negative', 'frustrated'],
    },
    frustration_level: {
      type: 'number',
      minimum: 0,
      maximum: 10,
    },
    churn_risk: {
      type: 'number',
      minimum: 0,
      maximum: 10,
    },
    categories: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
    feature_requests: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
    key_issues: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
    recommended_action: {
      type: ['string', 'null'],
    },
    confidence: {
      type: 'number',
      minimum: 0.0,
      maximum: 1.0,
    },
    evidence: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
    },
  },
  additionalProperties: false,
};

export const CRITIQUE_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['critique_confidence', 'critique_notes', 'inconsistencies', 'missing_evidence', 'flags'],
  properties: {
    critique_confidence: {
      type: 'number',
      minimum: 0.0,
      maximum: 1.0,
    },
    critique_notes: {
      type: 'array',
      items: { type: 'string' },
    },
    inconsistencies: {
      type: 'array',
      items: { type: 'string' },
    },
    missing_evidence: {
      type: 'array',
      items: { type: 'string' },
    },
    flags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};

/**
 * Type guards for runtime validation
 */
export function isValidSentiment(value: any): value is Sentiment {
  return ['positive', 'neutral', 'negative', 'frustrated'].includes(value);
}

export function isValidIntelligenceOutput(value: any): value is IntelligenceOutput {
  return (
    value &&
    typeof value === 'object' &&
    isValidSentiment(value.sentiment) &&
    typeof value.frustration_level === 'number' &&
    value.frustration_level >= 0 &&
    value.frustration_level <= 10 &&
    typeof value.churn_risk === 'number' &&
    value.churn_risk >= 0 &&
    value.churn_risk <= 10 &&
    Array.isArray(value.categories) &&
    Array.isArray(value.feature_requests) &&
    Array.isArray(value.key_issues) &&
    (value.recommended_action === null || typeof value.recommended_action === 'string') &&
    typeof value.confidence === 'number' &&
    value.confidence >= 0.0 &&
    value.confidence <= 1.0 &&
    Array.isArray(value.evidence)
  );
}
