# Support Ticket Analyzer Intelligence

**Version:** support-intel-v1.0.0
**Model:** claude-3-5-sonnet-20241022
**Released:** 2026-01-27

## What This Intelligence Does

The Support Ticket Analyzer intelligence extracts actionable insights from customer support tickets for B2B SaaS companies. It performs:

1. **Sentiment Classification** - Categorizes tickets as positive, neutral, negative, or frustrated
2. **Quantitative Risk Scoring** - Rates frustration level (0-10) and churn risk (0-10)
3. **Topic Categorization** - Classifies tickets (bug, feature request, billing, etc.)
4. **Structured Data Extraction** - Identifies feature requests and key issues
5. **Action Recommendations** - Suggests prioritize, escalate, routine response, investigate, or close
6. **Confidence Scoring** - Self-assesses analysis confidence (0.0-1.0)
7. **Evidence Justification** - Provides 2-5 reasons for each rating
8. **Quality Validation** - Second-pass critique to catch inconsistencies

## What This Intelligence Is

✅ **A batch analysis tool** - Processes 1-10 tickets per API call for high throughput

✅ **A risk signal generator** - Identifies high-churn-risk customers requiring immediate attention

✅ **A pattern aggregator** - Extracts feature requests across tickets for product prioritization

✅ **A triaging assistant** - Categorizes and recommends actions for support teams

✅ **An objective analyzer** - Provides bias-free sentiment analysis at scale

✅ **A versioned system** - Tracks which intelligence version produced each analysis for auditability

## What This Intelligence Is NOT

❌ **NOT a real-time chat analyzer** - Analyzes completed tickets, not live conversations

❌ **NOT conversation-aware** - Each ticket analyzed independently without threading context

❌ **NOT multilingual** - English-only prompts; other languages produce degraded results

❌ **NOT a response generator** - Generates insights, not customer-facing replies

❌ **NOT a learning system** - Stateless; does not adapt from past analyses or human feedback

❌ **NOT a definitive decision-maker** - Provides risk signals, not legal/compliance judgments

❌ **NOT historical context-aware** - No access to customer history, account age, or contract value

## Input Requirements

### Format
```typescript
{
  customer_id: string;    // Required: unique customer identifier
  subject: string | null; // Optional: ticket subject line
  message: string;        // Required: main ticket content
}
```

### Constraints
- **Batch size:** 1-10 tickets (recommended: 10 for efficiency)
- **Language:** English strongly preferred
- **Token limit:** ~4000 tokens per batch
- **Message:** Must be non-empty
- **Customer ID:** Should be consistent across tickets from same customer

### Example Input
```typescript
const tickets = [
  {
    customer_id: "cust_abc123",
    subject: "Cannot access dashboard",
    message: "I have been trying to log in for 2 hours. This is blocking my team."
  }
];
```

## Output Guarantees

### Format
```json
{
  "ticket_1": {
    "sentiment": "frustrated",
    "frustration_level": 7,
    "churn_risk": 6,
    "categories": ["technical_issue", "complaint"],
    "feature_requests": [],
    "key_issues": ["Login authentication failure blocking team access"],
    "recommended_action": "escalate",
    "confidence": 0.85,
    "evidence": [
      "Customer used phrase 'blocking my team' indicating business impact",
      "Frustration evident from '2 hours' wait time mention",
      "No mention of cancellation but high urgency requires escalation"
    ]
  }
}
```

### Field Guarantees
- **sentiment:** Always one of: `positive`, `neutral`, `negative`, `frustrated`
- **frustration_level:** Always integer 0-10
- **churn_risk:** Always integer 0-10
- **categories:** Always array of strings from predefined list
- **feature_requests:** Always array (empty if none mentioned)
- **key_issues:** Always array (maximum 3 issues)
- **recommended_action:** Always one of: `prioritize`, `escalate`, `routine_response`, `investigate`, `close`
- **confidence:** Always float 0.0-1.0
- **evidence:** Always array of 2-5 justification strings

### Critique Pass
When enabled (default: true), a second Claude call validates:
- Internal consistency (does churn_risk align with sentiment?)
- Evidence quality (are justifications specific and ticket-referencing?)
- Confidence calibration (should confidence be higher/lower?)
- Missing information (implied feature requests not extracted?)
- Edge cases (requires human review?)

## Known Limitations

### Contextual Limitations
- **No customer history** - Cannot access past tickets, account age, or contract value
- **No product context** - Cannot see which features customer uses or subscription tier
- **No conversation threading** - Cannot follow multi-ticket conversations
- **No external system access** - Cannot query CRM, usage analytics, or billing systems

### Linguistic Limitations
- **English-only** - Prompts are English; non-English tickets may produce unreliable results
- **No domain tuning** - Uses generic SaaS vocabulary, not company-specific terminology
- **No visual understanding** - Cannot process images, attachments, or formatted content
- **Cultural blindness** - May misinterpret sarcasm, cultural context, or idioms

### Technical Limitations
- **Batch size cap** - Maximum 10 tickets per call to fit in context window
- **Processing latency** - 5-10 seconds per batch including API calls and critique pass
- **No streaming** - Must wait for complete batch analysis
- **Rate limiting** - 1000ms delay between calls (configurable)

### Analytical Limitations
- **Heuristic-based scoring** - Churn risk not trained on historical churn data
- **Relative risk only** - Cannot predict actual churn probability
- **Uncalibrated confidence** - Confidence scores not validated against ground truth
- **Limited business context** - Cannot factor contract size or renewal dates into urgency

### Operational Limitations
- **No automatic updates** - Intelligence version must be manually incremented
- **No A/B testing** - Cannot systematically compare prompt variations
- **No feedback loop** - Model does not learn from human corrections
- **Linear cost scaling** - ~$1.50 per 1000 tickets analyzed

## Assumptions Embedded in This Intelligence

### Volume Assumptions
- **Expected daily volume:** 100 tickets
- **Max burst:** 1000 tickets
- **Throughput:** 600 tickets per 10 minutes at batch size 10 with 1s delay

### Cost Assumptions
- **Cost:** ~$1.50 per 1000 tickets (includes analysis + critique pass)
- **Based on:** Claude 3.5 Sonnet pricing as of January 2026
- **Excludes:** Infrastructure costs (database, server, monitoring)

### Data Assumptions
- **Retention:** Indefinite (no automatic cleanup)
- **Growth:** Database grows unbounded without manual archival
- **Timezone:** All timestamps stored in UTC (no timezone-aware handling)

### Multi-Tenancy Assumptions
- **Isolation:** Application-level via `organization_id` foreign key
- **No RLS:** No row-level security in database
- **Trust-based:** `organization_id` in URL = trusted, no additional checks

### Language Assumptions
- **Supported:** English only
- **No multilingual support:** Non-English tickets may produce degraded results

## Versioning and Auditability

### Version Format
`support-intel-v<major>.<minor>.<patch>`

### Versioning Strategy
- **Stored with each analysis:** `intelligence_version` column in `ticket_analysis` table
- **Breaking changes:** Increment major version (changes to output schema or interpretation)
- **Prompt improvements:** Increment minor version (backwards compatible)
- **Bug fixes:** Increment patch version (no behavior change)

### Why Versioning Matters
1. **Compare across time** - Did prompt changes improve accuracy?
2. **Debug regressions** - Which version produced this odd result?
3. **A/B testing** - Run two versions side-by-side on same tickets
4. **Compliance auditing** - Which model/prompt was used for this decision?

## Usage Example

```typescript
import { analyzeTickets } from './services/analysis';

// Analyze tickets for an organization
const result = await analyzeTickets('org_123');

console.log(`Analyzed ${result.tickets_analyzed} tickets`);
console.log(`Errors: ${result.errors?.length || 0}`);
```

### Database Query Examples

```sql
-- Find high-churn-risk tickets analyzed by v1.0.0
SELECT st.subject, ta.churn_risk, ta.evidence, ta.confidence
FROM ticket_analysis ta
JOIN support_tickets st ON ta.ticket_id = st.id
WHERE ta.intelligence_version = 'support-intel-v1.0.0'
  AND ta.churn_risk >= 7
ORDER BY ta.churn_risk DESC, ta.analyzed_at DESC;

-- Find low-confidence analyses requiring human review
SELECT st.customer_id, st.subject, ta.confidence, tac.flags
FROM ticket_analysis ta
JOIN support_tickets st ON ta.ticket_id = st.id
LEFT JOIN ticket_analysis_critique tac ON ta.id = tac.ticket_analysis_id
WHERE ta.confidence < 0.5
  OR tac.critique_confidence < 0.5
  OR array_length(tac.flags, 1) > 0
ORDER BY ta.analyzed_at DESC;

-- Compare sentiment distribution across intelligence versions
SELECT intelligence_version, sentiment, COUNT(*) as count
FROM ticket_analysis
GROUP BY intelligence_version, sentiment
ORDER BY intelligence_version, sentiment;

-- Aggregate feature requests analyzed today
SELECT
  unnest(feature_requests) as feature,
  COUNT(*) as mentions
FROM ticket_analysis
WHERE analyzed_at >= CURRENT_DATE
GROUP BY feature
ORDER BY mentions DESC
LIMIT 20;
```

## When to Use This Intelligence

✅ **Good use cases:**
- Triaging incoming support tickets by urgency
- Identifying at-risk customers for proactive outreach
- Aggregating feature request patterns for product roadmap
- Generating weekly support insights reports
- Reducing bias in sentiment analysis at scale

❌ **Poor use cases:**
- Real-time customer conversation analysis (not designed for streaming)
- Generating automated responses to customers (insights only, not replies)
- Non-English support tickets (English-only prompts)
- Legal/compliance decisions (provides signals, not definitive judgments)
- Sub-second latency requirements (5-10 second processing time per batch)

## Interpreting Results

### Churn Risk Thresholds
- **0-3 (Low):** No immediate action required
- **4-6 (Medium):** Monitor, routine follow-up
- **7-8 (High):** Priority escalation, same-day response
- **9-10 (Critical):** Immediate escalation, executive involvement

### Confidence Thresholds
- **0.9-1.0:** Very confident, safe to automate actions
- **0.7-0.9:** Clear signal, suitable for automated triaging
- **0.5-0.7:** Moderate confidence, human review recommended for high-stakes decisions
- **0.0-0.5:** Low confidence, requires human review before action

### Critique Flags
If critique pass identifies flags, always review before acting:
- **"requires human review"** - Ambiguous ticket needing domain knowledge
- **"critique_error"** - Critique pass failed, confidence score may be unreliable
- **Custom flags** - Model identified edge cases or sensitive content

## File Structure

```
src/intelligence/
├── definition.ts    # Human-readable description (this document as code)
├── schema.ts        # TypeScript + JSON Schema output contracts
├── prompt.ts        # All prompt construction logic
├── config.json      # Thresholds, scales, assumptions
└── version.ts       # Intelligence version string and history
```

## Migration Path

### Upgrading from Pre-1.0.0
If you have existing analyses without versioning:

```sql
-- Backfill intelligence version for old analyses
UPDATE ticket_analysis
SET intelligence_version = 'support-intel-v0.0.0'
WHERE intelligence_version IS NULL;

-- Add default confidence for old analyses
UPDATE ticket_analysis
SET confidence = 0.5
WHERE confidence IS NULL;

-- Add empty evidence arrays for old analyses
UPDATE ticket_analysis
SET evidence = '{}'
WHERE evidence IS NULL;
```

### Comparing v1.0.0 to Future Versions
When v1.1.0 is released, compare results:

```sql
-- Compare churn risk scoring between versions on same tickets
SELECT
  ta1.churn_risk as v1_0_churn_risk,
  ta2.churn_risk as v1_1_churn_risk,
  st.subject,
  st.message
FROM ticket_analysis ta1
JOIN ticket_analysis ta2 ON ta1.ticket_id = ta2.ticket_id
JOIN support_tickets st ON ta1.ticket_id = st.id
WHERE ta1.intelligence_version = 'support-intel-v1.0.0'
  AND ta2.intelligence_version = 'support-intel-v1.1.0'
  AND ABS(ta1.churn_risk - ta2.churn_risk) >= 3  -- Significant difference
ORDER BY ABS(ta1.churn_risk - ta2.churn_risk) DESC;
```

## Support and Maintenance

### Monitoring Recommendations
- Track average confidence scores per batch
- Alert on batches with >30% low-confidence analyses
- Monitor critique flags for recurring patterns
- Track processing latency (should be <10s per batch)
- Monitor API costs (should be ~$1.50 per 1000 tickets)

### Quality Assurance
- Periodically sample analyses for human review
- Compare intelligence recommendations to actual support team actions
- Track false positive/negative rates for churn risk predictions
- Validate evidence quality (are justifications specific or generic?)

### When to Increment Version
- **Major (2.0.0):** Output schema changes, new required fields, breaking interpretations
- **Minor (1.1.0):** Prompt improvements, new optional fields, better instructions
- **Patch (1.0.1):** Bug fixes, clarifications, no behavior change

---

**See also:**
- [PROMPT_RATIONALE.md](./PROMPT_RATIONALE.md) - Why prompts are structured this way
- [src/intelligence/definition.ts](./src/intelligence/definition.ts) - Programmatic version of this document
- [src/intelligence/schema.ts](./src/intelligence/schema.ts) - Output schema definitions
