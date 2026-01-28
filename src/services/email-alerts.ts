import { query } from '../database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

// Resend type declaration for when package is installed
declare const Resend: any;

/**
 * Email configuration interface
 */
interface EmailConfig {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email alert using Resend API
 */
async function sendEmail(config: EmailConfig): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  // If no API key, log to console (development mode)
  if (!apiKey) {
    console.log('\n📧 EMAIL ALERT (RESEND_API_KEY not set - logging only)');
    console.log('To:', config.to);
    console.log('Subject:', config.subject);
    console.log('---\n');
    return false;
  }

  try {
    // Use Resend API directly via fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Support Intelligence <alerts@support-intelligence.ai>',
        to: config.to,
        subject: config.subject,
        html: config.html,
      }),
    });

    const data = await response.json() as { id?: string; error?: any };

    if (!response.ok) {
      console.error('Resend API error:', data);
      return false;
    }

    console.log(`✓ Email sent successfully: ${data.id}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Generate HTML email for high churn risk ticket
 */
function generateChurnAlertEmail(ticket: any, analysis: any, orgName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #dc2626; }
        .ticket-info { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; }
        .footer { margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; font-size: 12px; color: #6b7280; }
        .action-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🚨 High Churn Risk Alert</h1>
          <p style="margin: 5px 0 0 0;">Immediate attention required</p>
        </div>

        <div class="content">
          <p><strong>Organization:</strong> ${orgName}</p>

          <div class="metric">
            <div class="metric-label">Churn Risk</div>
            <div class="metric-value">${analysis.churn_risk}/10</div>
          </div>

          <div class="metric">
            <div class="metric-label">Frustration</div>
            <div class="metric-value">${analysis.frustration_level}/10</div>
          </div>

          <div class="metric">
            <div class="metric-label">Sentiment</div>
            <div class="metric-value" style="text-transform: capitalize;">${analysis.sentiment}</div>
          </div>

          <div class="ticket-info">
            <h3 style="margin-top: 0;">Ticket Details</h3>
            <p><strong>Customer:</strong> ${ticket.customer_id}</p>
            <p><strong>Subject:</strong> ${ticket.subject || '(No Subject)'}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: #f9fafb; padding: 10px; border-radius: 3px;">${ticket.message.substring(0, 300)}${ticket.message.length > 300 ? '...' : ''}</p>

            ${analysis.key_issues && analysis.key_issues.length > 0 ? `
              <p><strong>Key Issues:</strong></p>
              <ul>
                ${analysis.key_issues.map((issue: string) => `<li>${issue}</li>`).join('')}
              </ul>
            ` : ''}

            ${analysis.recommended_action ? `
              <p><strong>Recommended Action:</strong></p>
              <p style="background-color: #fef3c7; padding: 10px; border-left: 3px solid #f59e0b; border-radius: 3px;">${analysis.recommended_action}</p>
            ` : ''}
          </div>

          <a href="#" class="action-button">View Full Analysis</a>
        </div>

        <div class="footer">
          <p>This is an automated alert from Support Intelligence AI.</p>
          <p>You're receiving this because a ticket was flagged with a churn risk score of ${analysis.churn_risk}/10.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Check for high churn risk tickets and send alerts
 */
export async function checkAndSendChurnAlerts(organizationId: string, threshold: number = 8): Promise<{ alertsSent: number }> {
  try {
    // Get organization info
    const orgResult = await query(
      'SELECT name, external_api_key FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      throw new Error('Organization not found');
    }

    const orgName = orgResult.rows[0].name;

    // Find tickets with high churn risk that haven't been alerted yet
    // We'll use a simple check: only alert on recently analyzed tickets (within last hour)
    const result = await query(
      `SELECT
        st.*,
        ta.sentiment,
        ta.frustration_level,
        ta.churn_risk,
        ta.key_issues,
        ta.recommended_action,
        ta.analyzed_at
       FROM support_tickets st
       JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
         AND ta.churn_risk >= $2
         AND ta.analyzed_at > NOW() - INTERVAL '1 hour'
       ORDER BY ta.churn_risk DESC, ta.analyzed_at DESC`,
      [organizationId, threshold]
    );

    const highRiskTickets = result.rows;

    if (highRiskTickets.length === 0) {
      console.log(`No high churn risk tickets found for org ${organizationId}`);
      return { alertsSent: 0 };
    }

    console.log(`Found ${highRiskTickets.length} high churn risk ticket(s) for org ${organizationId}`);

    // For MVP, we'll send one email per ticket
    // In production, you might batch multiple tickets into one email
    let alertsSent = 0;

    for (const ticket of highRiskTickets) {
      const emailHtml = generateChurnAlertEmail(ticket, ticket, orgName);

      await sendEmail({
        to: process.env.ALERT_EMAIL || 'admin@yourdomain.com', // TODO: Get from org settings
        subject: `🚨 High Churn Risk Alert - ${ticket.customer_id}`,
        html: emailHtml,
      });

      alertsSent++;
    }

    console.log(`✓ Sent ${alertsSent} churn risk alert(s) for org ${organizationId}`);

    return { alertsSent };

  } catch (error) {
    console.error('Error sending churn alerts:', error);
    throw error;
  }
}

/**
 * Send a summary email with all high-risk tickets
 */
export async function sendDailySummary(organizationId: string): Promise<void> {
  try {
    const orgResult = await query(
      'SELECT name FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      throw new Error('Organization not found');
    }

    const orgName = orgResult.rows[0].name;

    // Get summary stats for last 24 hours
    const statsResult = await query(
      `SELECT
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN ta.churn_risk >= 8 THEN 1 END) as high_risk_count,
        AVG(ta.churn_risk) as avg_churn_risk,
        AVG(ta.frustration_level) as avg_frustration
       FROM support_tickets st
       LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
         AND st.created_at > NOW() - INTERVAL '24 hours'`,
      [organizationId]
    );

    const stats = statsResult.rows[0];

    // Get high-risk tickets
    const highRiskResult = await query(
      `SELECT
        st.customer_id,
        st.subject,
        ta.churn_risk,
        ta.frustration_level,
        ta.sentiment
       FROM support_tickets st
       JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
         AND ta.churn_risk >= 7
         AND st.created_at > NOW() - INTERVAL '24 hours'
       ORDER BY ta.churn_risk DESC
       LIMIT 10`,
      [organizationId]
    );

    const highRiskTickets = highRiskResult.rows;

    const summaryHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .stats { display: flex; justify-content: space-around; background-color: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .stat { text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #2563eb; }
          .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
          .ticket-list { list-style: none; padding: 0; }
          .ticket-item { background-color: white; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 Daily Support Summary</h1>
            <p style="margin: 5px 0 0 0;">${orgName}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${stats.total_tickets}</div>
              <div class="stat-label">Total Tickets</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color: #dc2626;">${stats.high_risk_count}</div>
              <div class="stat-label">High Risk</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.avg_churn_risk ? parseFloat(stats.avg_churn_risk).toFixed(1) : '0'}</div>
              <div class="stat-label">Avg Churn Risk</div>
            </div>
          </div>

          ${highRiskTickets.length > 0 ? `
            <h2>High Risk Tickets</h2>
            <ul class="ticket-list">
              ${highRiskTickets.map(ticket => `
                <li class="ticket-item">
                  <strong>${ticket.customer_id}</strong> - ${ticket.subject || '(No Subject)'}
                  <br>
                  <small>Churn Risk: ${ticket.churn_risk}/10 | Frustration: ${ticket.frustration_level}/10 | ${ticket.sentiment}</small>
                </li>
              `).join('')}
            </ul>
          ` : '<p>No high-risk tickets in the last 24 hours. Great job!</p>'}

          <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; font-size: 12px; color: #6b7280;">
            <p>This is your automated daily summary from Support Intelligence AI.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: process.env.ALERT_EMAIL || 'admin@yourdomain.com',
      subject: `📊 Daily Support Summary - ${orgName}`,
      html: summaryHtml,
    });

    console.log(`✓ Sent daily summary for org ${organizationId}`);

  } catch (error) {
    console.error('Error sending daily summary:', error);
    throw error;
  }
}
