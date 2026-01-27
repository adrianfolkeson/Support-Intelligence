import { query } from '../database/connection';
import { WeeklyReport } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

interface WeeklyInsights {
  totalTickets: number;
  highPriorityIssues: string[];
  churnRiskTickets: number;
  featureRequests: string[];
  topCategories: { category: string; count: number }[];
  avgFrustration: number;
  avgChurnRisk: number;
}

/**
 * Get start and end of the current week (Monday-Sunday)
 */
function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday

  const start = new Date(current.setDate(diff));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get previous week's bounds
 */
function getPreviousWeekBounds(): { start: Date; end: Date } {
  const today = new Date();
  today.setDate(today.getDate() - 7);
  return getWeekBounds(today);
}

/**
 * Aggregate insights for the week
 */
async function aggregateWeeklyInsights(
  organizationId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<WeeklyInsights> {
  // Get total tickets
  const ticketsResult = await query(
    `SELECT COUNT(*) as total
     FROM support_tickets
     WHERE organization_id = $1
       AND ticket_timestamp >= $2
       AND ticket_timestamp <= $3`,
    [organizationId, weekStart, weekEnd]
  );

  const totalTickets = parseInt(ticketsResult.rows[0]?.total || '0');

  // Get high churn risk tickets and their issues
  const churnRiskResult = await query(
    `SELECT ta.churn_risk, ta.key_issues, st.subject
     FROM ticket_analysis ta
     JOIN support_tickets st ON ta.ticket_id = st.id
     WHERE ta.organization_id = $1
       AND st.ticket_timestamp >= $2
       AND st.ticket_timestamp <= $3
       AND ta.churn_risk >= 7
     ORDER BY ta.churn_risk DESC`,
    [organizationId, weekStart, weekEnd]
  );

  const churnRiskTickets = churnRiskResult.rows.length;
  const highPriorityIssues = churnRiskResult.rows
    .flatMap((row) => row.key_issues || [])
    .filter((issue, idx, arr) => arr.indexOf(issue) === idx) // unique
    .slice(0, 10);

  // Get feature requests
  const featureRequestsResult = await query(
    `SELECT ta.feature_requests
     FROM ticket_analysis ta
     JOIN support_tickets st ON ta.ticket_id = st.id
     WHERE ta.organization_id = $1
       AND st.ticket_timestamp >= $2
       AND st.ticket_timestamp <= $3
       AND array_length(ta.feature_requests, 1) > 0`,
    [organizationId, weekStart, weekEnd]
  );

  const featureRequests = featureRequestsResult.rows
    .flatMap((row) => row.feature_requests || [])
    .filter((req, idx, arr) => arr.indexOf(req) === idx) // unique
    .slice(0, 10);

  // Get top categories
  const categoriesResult = await query(
    `SELECT unnest(categories) as category, COUNT(*) as count
     FROM ticket_analysis ta
     JOIN support_tickets st ON ta.ticket_id = st.id
     WHERE ta.organization_id = $1
       AND st.ticket_timestamp >= $2
       AND st.ticket_timestamp <= $3
     GROUP BY category
     ORDER BY count DESC
     LIMIT 5`,
    [organizationId, weekStart, weekEnd]
  );

  const topCategories = categoriesResult.rows.map((row) => ({
    category: row.category,
    count: parseInt(row.count),
  }));

  // Get avg frustration and churn risk
  const avgResult = await query(
    `SELECT AVG(frustration_level) as avg_frustration,
            AVG(churn_risk) as avg_churn_risk
     FROM ticket_analysis ta
     JOIN support_tickets st ON ta.ticket_id = st.id
     WHERE ta.organization_id = $1
       AND st.ticket_timestamp >= $2
       AND st.ticket_timestamp <= $3`,
    [organizationId, weekStart, weekEnd]
  );

  const avgFrustration = parseFloat(avgResult.rows[0]?.avg_frustration || '0');
  const avgChurnRisk = parseFloat(avgResult.rows[0]?.avg_churn_risk || '0');

  return {
    totalTickets,
    highPriorityIssues,
    churnRiskTickets,
    featureRequests,
    topCategories,
    avgFrustration,
    avgChurnRisk,
  };
}

/**
 * Generate executive summary text
 */
function generateExecutiveSummary(insights: WeeklyInsights): string {
  const sections: string[] = [];

  // Overview
  sections.push(`## Weekly Support Overview`);
  sections.push(`Total tickets: ${insights.totalTickets}`);
  sections.push(`Average frustration level: ${insights.avgFrustration.toFixed(1)}/10`);
  sections.push(`Average churn risk: ${insights.avgChurnRisk.toFixed(1)}/10`);
  sections.push('');

  // Critical issues
  if (insights.churnRiskTickets > 0) {
    sections.push(`## ⚠️ Critical: ${insights.churnRiskTickets} High Churn Risk Tickets`);
    sections.push('These customers need immediate attention.');
    sections.push('');
  }

  // What's broken
  if (insights.highPriorityIssues.length > 0) {
    sections.push(`## 🔥 What's Broken`);
    insights.highPriorityIssues.forEach((issue) => {
      sections.push(`- ${issue}`);
    });
    sections.push('');
  }

  // Top categories
  if (insights.topCategories.length > 0) {
    sections.push(`## 📊 Top Issue Categories`);
    insights.topCategories.forEach((cat) => {
      sections.push(`- ${cat.category}: ${cat.count} tickets`);
    });
    sections.push('');
  }

  // Feature requests
  if (insights.featureRequests.length > 0) {
    sections.push(`## 💡 Feature Requests`);
    insights.featureRequests.forEach((req) => {
      sections.push(`- ${req}`);
    });
    sections.push('');
  }

  // Recommendations
  sections.push(`## ✅ Recommended Actions for Next Week`);

  if (insights.churnRiskTickets > 0) {
    sections.push(`1. **Urgent:** Reach out to ${insights.churnRiskTickets} at-risk customers personally`);
  }

  if (insights.highPriorityIssues.length > 0) {
    sections.push(`2. **Fix immediately:** ${insights.highPriorityIssues[0]}`);
  }

  if (insights.topCategories.length > 0 && insights.topCategories[0].count > 3) {
    sections.push(`3. **Address:** ${insights.topCategories[0].category} (${insights.topCategories[0].count} tickets)`);
  }

  if (insights.featureRequests.length > 0) {
    sections.push(`4. **Consider:** Evaluate feasibility of "${insights.featureRequests[0]}"`);
  }

  sections.push('');
  sections.push(`---`);
  sections.push(`Generated by Support Intelligence • ${new Date().toLocaleDateString()}`);

  return sections.join('\n');
}

/**
 * Save weekly report to database
 */
async function saveWeeklyReport(
  organizationId: string,
  weekStart: Date,
  weekEnd: Date,
  insights: WeeklyInsights,
  executiveSummary: string
): Promise<string> {
  const sql = `
    INSERT INTO weekly_reports (
      organization_id,
      week_start,
      week_end,
      total_tickets,
      high_priority_issues,
      churn_risk_tickets,
      feature_requests_summary,
      recommended_actions,
      executive_summary
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (organization_id, week_start) DO UPDATE SET
      total_tickets = EXCLUDED.total_tickets,
      high_priority_issues = EXCLUDED.high_priority_issues,
      churn_risk_tickets = EXCLUDED.churn_risk_tickets,
      feature_requests_summary = EXCLUDED.feature_requests_summary,
      recommended_actions = EXCLUDED.recommended_actions,
      executive_summary = EXCLUDED.executive_summary,
      created_at = NOW()
    RETURNING id
  `;

  const recommendedActions = [];
  if (insights.churnRiskTickets > 0) {
    recommendedActions.push(`Reach out to ${insights.churnRiskTickets} at-risk customers`);
  }
  if (insights.highPriorityIssues.length > 0) {
    recommendedActions.push(`Fix: ${insights.highPriorityIssues[0]}`);
  }

  const result = await query(sql, [
    organizationId,
    weekStart,
    weekEnd,
    insights.totalTickets,
    insights.highPriorityIssues,
    insights.churnRiskTickets,
    insights.featureRequests,
    recommendedActions,
    executiveSummary,
  ]);

  return result.rows[0].id;
}

/**
 * Generate weekly report for an organization
 */
export async function generateWeeklyReport(organizationId: string): Promise<{ reportId: string; summary: string }> {
  try {
    console.log(`Generating weekly report for organization: ${organizationId}`);

    // Use previous week (Monday-Sunday)
    const { start: weekStart, end: weekEnd } = getPreviousWeekBounds();

    console.log(`Report period: ${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`);

    // Aggregate insights
    const insights = await aggregateWeeklyInsights(organizationId, weekStart, weekEnd);

    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(insights);

    // Save to database
    const reportId = await saveWeeklyReport(organizationId, weekStart, weekEnd, insights, executiveSummary);

    console.log(`Weekly report generated: ${reportId}`);
    console.log('\n' + executiveSummary);

    return {
      reportId,
      summary: executiveSummary,
    };
  } catch (error) {
    console.error('Report generation failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const orgId = process.argv[2];

  if (!orgId) {
    console.error('Usage: node report-generator.js <organization_id>');
    process.exit(1);
  }

  generateWeeklyReport(orgId)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
