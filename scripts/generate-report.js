#!/usr/bin/env node

/**
 * Generate customer report from analyzed tickets
 *
 * Usage:
 *   node scripts/generate-report.js <organization-id>
 *
 * Generates a text report you can copy-paste into email or PDF
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function generateReport(orgId) {
  try {
    // Get organization
    const orgResult = await pool.query('SELECT * FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rows.length === 0) {
      throw new Error(`Organization not found: ${orgId}`);
    }
    const org = orgResult.rows[0];

    // Get all analyzed tickets
    const result = await pool.query(
      `SELECT
        st.customer_id,
        st.subject,
        st.message,
        ta.sentiment,
        ta.frustration_level,
        ta.churn_risk,
        ta.confidence,
        ta.categories,
        ta.key_issues,
        ta.evidence,
        ta.recommended_action,
        ta.analyzed_at
       FROM support_tickets st
       JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
       ORDER BY ta.churn_risk DESC, ta.frustration_level DESC`,
      [orgId]
    );

    const tickets = result.rows;

    if (tickets.length === 0) {
      console.error('No analyzed tickets found. Run: npm run analyze -- ' + orgId);
      process.exit(1);
    }

    // Calculate stats
    const highRisk = tickets.filter(t => t.churn_risk >= 7).length;
    const frustrated = tickets.filter(t => t.frustration_level >= 7).length;
    const avgConfidence = (tickets.reduce((sum, t) => sum + parseFloat(t.confidence), 0) / tickets.length * 100).toFixed(0);
    const avgChurnRisk = (tickets.reduce((sum, t) => sum + t.churn_risk, 0) / tickets.length).toFixed(1);

    const sentimentBreakdown = {
      positive: tickets.filter(t => t.sentiment === 'positive').length,
      neutral: tickets.filter(t => t.sentiment === 'neutral').length,
      negative: tickets.filter(t => t.sentiment === 'negative').length,
      frustrated: tickets.filter(t => t.sentiment === 'frustrated').length,
    };

    // Generate report
    console.log(`
========================================
SUPPORT INTELLIGENCE REPORT
========================================

Customer: ${org.name}
Generated: ${new Date().toLocaleDateString()}
Tickets Analyzed: ${tickets.length}

========================================
EXECUTIVE SUMMARY
========================================

🚨 HIGH-RISK CUSTOMERS: ${highRisk} (${(highRisk / tickets.length * 100).toFixed(0)}%)
   - These customers are at serious risk of churning
   - Immediate action recommended

😤 FRUSTRATED CUSTOMERS: ${frustrated} (${(frustrated / tickets.length * 100).toFixed(0)}%)
   - High frustration levels detected
   - Proactive outreach suggested

📊 AVERAGE CHURN RISK: ${avgChurnRisk}/10
📈 AI CONFIDENCE: ${avgConfidence}%

========================================
SENTIMENT BREAKDOWN
========================================

Positive:    ${sentimentBreakdown.positive} (${(sentimentBreakdown.positive / tickets.length * 100).toFixed(0)}%)
Neutral:     ${sentimentBreakdown.neutral} (${(sentimentBreakdown.neutral / tickets.length * 100).toFixed(0)}%)
Negative:    ${sentimentBreakdown.negative} (${(sentimentBreakdown.negative / tickets.length * 100).toFixed(0)}%)
Frustrated:  ${sentimentBreakdown.frustrated} (${(sentimentBreakdown.frustrated / tickets.length * 100).toFixed(0)}%)

========================================
TOP 10 HIGHEST-RISK TICKETS
========================================
`);

    tickets.slice(0, 10).forEach((ticket, index) => {
      console.log(`
${index + 1}. Customer: ${ticket.customer_id}
   Subject: ${ticket.subject || 'No subject'}
   Churn Risk: ${ticket.churn_risk}/10 | Frustration: ${ticket.frustration_level}/10 | Sentiment: ${ticket.sentiment}

   Key Issues:
   ${ticket.key_issues.map(issue => `   • ${issue}`).join('\n')}

   Why This Rating:
   ${ticket.evidence.map(evidence => `   • ${evidence}`).join('\n')}

   Recommended Action: ${ticket.recommended_action || 'monitor'}
   ---
`);
    });

    console.log(`
========================================
CATEGORY BREAKDOWN
========================================
`);

    // Count categories
    const categoryCount = {};
    tickets.forEach(ticket => {
      ticket.categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });

    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`${category.replace('_', ' ')}: ${count} tickets (${(count / tickets.length * 100).toFixed(0)}%)`);
      });

    console.log(`
========================================
RECOMMENDATIONS
========================================

1. IMMEDIATE ACTIONS (Next 24 hours)
   - Contact ${highRisk} high-risk customers directly
   - Escalate technical issues to engineering
   - Review billing problems

2. SHORT-TERM (This week)
   - Analyze ${frustrated} frustrated customer patterns
   - Improve response time for critical issues
   - Update documentation for common problems

3. LONG-TERM (This month)
   - Address top feature requests
   - Review support team training
   - Implement proactive monitoring

========================================

📧 Questions? Reply to this report
🔄 Want weekly updates? Let's set up automation

Powered by Support Intelligence
========================================
`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Main
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: node scripts/generate-report.js <organization-id>');
  process.exit(1);
}

generateReport(args[0]);
