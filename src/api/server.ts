import express, { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { query } from '../database/connection';
import { ingestTickets } from '../services/ingestion';
import { analyzeTickets } from '../services/analysis';
import { generateWeeklyReport } from '../services/report-generator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Middleware: Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all organizations
app.get('/api/organizations', async (req, res, next) => {
  try {
    const result = await query('SELECT id, name, created_at FROM organizations ORDER BY created_at DESC');
    res.json({ organizations: result.rows });
  } catch (error) {
    next(error);
  }
});

// Create organization
app.post('/api/organizations', async (req, res, next) => {
  try {
    const { name, external_api_key, external_api_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const result = await query(
      'INSERT INTO organizations (name, external_api_key, external_api_url) VALUES ($1, $2, $3) RETURNING *',
      [name, external_api_key, external_api_url]
    );

    res.status(201).json({ organization: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get organization by ID
app.get('/api/organizations/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get tickets for organization
app.get('/api/organizations/:id/tickets', async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT st.*, ta.sentiment, ta.churn_risk, ta.frustration_level
       FROM support_tickets st
       LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
       ORDER BY st.ticket_timestamp DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM support_tickets WHERE organization_id = $1',
      [id]
    );

    res.json({
      tickets: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

// Get high churn risk tickets
app.get('/api/organizations/:id/churn-risk', async (req, res, next) => {
  try {
    const { id } = req.params;
    const threshold = parseInt(req.query.threshold as string) || 7;

    const result = await query(
      `SELECT st.*, ta.churn_risk, ta.frustration_level, ta.key_issues, ta.recommended_action
       FROM support_tickets st
       JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1 AND ta.churn_risk >= $2
       ORDER BY ta.churn_risk DESC, st.ticket_timestamp DESC`,
      [id, threshold]
    );

    res.json({ churn_risk_tickets: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get weekly reports
app.get('/api/organizations/:id/reports', async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(
      'SELECT * FROM weekly_reports WHERE organization_id = $1 ORDER BY week_start DESC LIMIT $2',
      [id, limit]
    );

    res.json({ reports: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get specific weekly report
app.get('/api/reports/:reportId', async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const result = await query('SELECT * FROM weekly_reports WHERE id = $1', [reportId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Trigger ticket ingestion manually
app.post('/api/organizations/:id/ingest', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Manual ingestion triggered for organization: ${id}`);

    // Run ingestion asynchronously
    ingestTickets(id)
      .then((result) => {
        console.log('Ingestion complete:', result);
      })
      .catch((error) => {
        console.error('Ingestion error:', error);
      });

    res.json({ message: 'Ingestion started', organization_id: id });
  } catch (error) {
    next(error);
  }
});

// Trigger analysis manually
app.post('/api/organizations/:id/analyze', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Manual analysis triggered for organization: ${id}`);

    // Run analysis asynchronously
    analyzeTickets(id)
      .then((result) => {
        console.log('Analysis complete:', result);
      })
      .catch((error) => {
        console.error('Analysis error:', error);
      });

    res.json({ message: 'Analysis started', organization_id: id });
  } catch (error) {
    next(error);
  }
});

// Trigger report generation manually
app.post('/api/organizations/:id/generate-report', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Manual report generation triggered for organization: ${id}`);

    const result = await generateWeeklyReport(id);

    res.json({ message: 'Report generated', report_id: result.reportId });
  } catch (error) {
    next(error);
  }
});

// Analytics dashboard data
app.get('/api/organizations/:id/dashboard', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get ticket counts
    const ticketCountResult = await query(
      'SELECT COUNT(*) as total FROM support_tickets WHERE organization_id = $1',
      [id]
    );

    const analyzedCountResult = await query(
      'SELECT COUNT(*) as total FROM ticket_analysis WHERE organization_id = $1',
      [id]
    );

    // Get average metrics
    const avgMetricsResult = await query(
      `SELECT
        AVG(frustration_level) as avg_frustration,
        AVG(churn_risk) as avg_churn_risk
       FROM ticket_analysis
       WHERE organization_id = $1`,
      [id]
    );

    // Get churn risk count
    const churnRiskResult = await query(
      'SELECT COUNT(*) as count FROM ticket_analysis WHERE organization_id = $1 AND churn_risk >= 7',
      [id]
    );

    // Get recent tickets
    const recentTickets = await query(
      `SELECT st.*, ta.churn_risk, ta.sentiment
       FROM support_tickets st
       LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
       ORDER BY st.ticket_timestamp DESC
       LIMIT 5`,
      [id]
    );

    res.json({
      total_tickets: parseInt(ticketCountResult.rows[0].total),
      analyzed_tickets: parseInt(analyzedCountResult.rows[0].total),
      avg_frustration: parseFloat(avgMetricsResult.rows[0]?.avg_frustration || '0'),
      avg_churn_risk: parseFloat(avgMetricsResult.rows[0]?.avg_churn_risk || '0'),
      high_churn_risk_count: parseInt(churnRiskResult.rows[0].count),
      recent_tickets: recentTickets.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
