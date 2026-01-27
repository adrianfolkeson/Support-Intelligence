/**
 * Intelligence Version
 * 
 * This version string identifies the specific intelligence implementation,
 * including prompt structure, output schema, and interpretation logic.
 * 
 * Version format: <product>-<major>.<minor>.<patch>
 * - major: Breaking changes to output schema or interpretation
 * - minor: Prompt improvements, added fields (backwards compatible)
 * - patch: Bug fixes, clarifications (no behavior change)
 */

export const INTELLIGENCE_VERSION = 'support-intel-v1.0.0';

/**
 * Version changelog:
 * 
 * 1.0.0 (2026-01-27):
 *   - Initial formalized version
 *   - 0-10 scales for frustration_level and churn_risk
 *   - Categorical sentiment (positive|neutral|negative|frustrated)
 *   - Array outputs for categories, feature_requests, key_issues
 *   - Single recommended_action string
 *   - Added confidence scoring (0.0-1.0)
 *   - Added evidence arrays
 *   - Added self-critique validation pass
 */

export interface IntelligenceVersion {
  version: string;
  released: string;
  compatibleWith: string[];
  breaking: boolean;
}

export const VERSION_HISTORY: IntelligenceVersion[] = [
  {
    version: 'support-intel-v1.0.0',
    released: '2026-01-27',
    compatibleWith: [],
    breaking: true, // First version
  },
];
