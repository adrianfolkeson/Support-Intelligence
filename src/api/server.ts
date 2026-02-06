import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { query, checkHealth } from '../database/connection';
import { apiRateLimit, strictRateLimit } from './middleware/rateLimit';
import { requireAuth, requireOrgAccess } from './middleware/auth';
import { ingestTickets } from '../services/ingestion';
import { analyzeTickets } from '../services/analysis';
import { generateWeeklyReport } from '../services/report-generator';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';
import billingRoutes from './routes/billing';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Input validation utilities
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function sanitizeString(str: string, maxLength: number = 1000): string {
  return str.slice(0, maxLength).replace(/[<>"'&]/g, '');
}

// Validation middleware for organization IDs
function validateOrgId(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }
  
  const orgId = Array.isArray(id) ? id[0] : id;
  
  if (orgId.length > 100) {
    return res.status(400).json({ error: 'Organization ID is too long' });
  }
  
  // Allow both UUIDs and simple alphanumeric IDs
  if (!isValidUUID(orgId) && !/^[a-zA-Z0-9_-]+$/.test(orgId)) {
    return res.status(400).json({ error: 'Invalid organization ID format' });
  }
  
  next();
}

// Sanitize query parameters
function sanitizeQueryParams(req: Request, res: Response, next: NextFunction) {
  if (req.query.limit) {
    const limit = parseInt(req.query.limit as string, 10);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      req.query.limit = '50';
    }
  }
  
  if (req.query.offset) {
    const offset = parseInt(req.query.offset as string, 10);
    if (isNaN(offset) || offset < 0) {
      req.query.offset = '0';
    }
  }
  
  next();
}

// Enable CORS for frontend
const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));

// Special handling for Stripe webhooks (needs raw body)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  (req as any).rawBody = req.body;
  next();
});

app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiRateLimit);

// Apply auth to organization-specific routes
app.use('/api/organizations/:id', requireAuth, requireOrgAccess);

// Upload routes
app.use('/api', uploadRoutes);

// Settings routes
app.use('/api', settingsRoutes);

// Billing routes
app.use('/api', billingRoutes);

// Admin endpoint to run migrations
app.post('/admin/migrate', async (req, res) => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS user_organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
    `;

    await query(sql);
    console.log('Migration completed: user_organizations table created');

    res.json({ success: true, message: 'Migration completed successfully' });
  } catch (error: any) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message || 'Migration failed' });
  }
});

// Middleware: Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Health check (includes database health)
app.get('/health', async (req, res) => {
  const dbHealth = await checkHealth();
  const status = dbHealth.healthy ? 'ok' : 'degraded';
  
  res.status(dbHealth.healthy ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'ok' },
      database: {
        status: dbHealth.healthy ? 'ok' : 'error',
        latency: dbHealth.latency,
        error: dbHealth.error
      }
    }
  });
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
    const { name, external_api_key, external_api_url, userId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const result = await query(
      'INSERT INTO organizations (name, external_api_key, external_api_url) VALUES ($1, $2, $3) RETURNING *',
      [name, external_api_key, external_api_url]
    );

    const org = result.rows[0];

    // Link user to the organization if userId was provided
    if (userId) {
      await query(
        'INSERT INTO user_organizations (user_id, organization_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [userId, org.id, 'owner']
      );
    }

    res.status(201).json({ organization: org });
  } catch (error) {
    next(error);
  }
});

// Get organization by ID
app.get('/api/organizations/:id', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    const result = await query('SELECT * FROM organizations WHERE id = $1', [orgId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Update organization
app.patch('/api/organizations/:id', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;
    const { trial_ends_at, subscription_status } = req.body;

    const result = await query(
      'UPDATE organizations SET trial_ends_at = $1, subscription_status = $2 WHERE id = $3 RETURNING *',
      [trial_ends_at, subscription_status, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ organization: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// Get tickets for organization
app.get('/api/organizations/:id/tickets', validateOrgId, sanitizeQueryParams, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT st.*, ta.sentiment, ta.churn_risk, ta.frustration_level
       FROM support_tickets st
       LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
       ORDER BY st.ticket_timestamp DESC
       LIMIT $2 OFFSET $3`,
      [orgId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM support_tickets WHERE organization_id = $1',
      [orgId]
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
app.get('/api/organizations/:id/churn-risk', validateOrgId, sanitizeQueryParams, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;
    const threshold = parseInt(req.query.threshold as string) || 7;

    const result = await query(
      `SELECT st.*, ta.churn_risk, ta.frustration_level, ta.key_issues, ta.recommended_action
       FROM support_tickets st
       JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1 AND ta.churn_risk >= $2
       ORDER BY ta.churn_risk DESC, st.ticket_timestamp DESC`,
      [orgId, threshold]
    );

    res.json({ churn_risk_tickets: result.rows });
  } catch (error) {
    next(error);
  }
});

// Get weekly reports
app.get('/api/organizations/:id/reports', validateOrgId, sanitizeQueryParams, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await query(
      'SELECT * FROM weekly_reports WHERE organization_id = $1 ORDER BY week_start DESC LIMIT $2',
      [orgId, limit]
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
app.post('/api/organizations/:id/ingest', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    console.log(`Manual ingestion triggered for organization: ${orgId}`);

    // Run ingestion asynchronously
    ingestTickets(orgId)
      .then((result) => {
        console.log('Ingestion complete:', result);
      })
      .catch((error) => {
        console.error('Ingestion error:', error);
      });

    res.json({ message: 'Ingestion started', organization_id: orgId });
  } catch (error) {
    next(error);
  }
});

// Trigger analysis manually
app.post('/api/organizations/:id/analyze', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    console.log(`Manual analysis triggered for organization: ${orgId}`);

    // Run analysis asynchronously
    analyzeTickets(orgId)
      .then((result) => {
        console.log('Analysis complete:', result);
      })
      .catch((error) => {
        console.error('Analysis error:', error);
      });

    res.json({ message: 'Analysis started', organization_id: orgId });
  } catch (error) {
    next(error);
  }
});

// Trigger report generation manually
app.post('/api/organizations/:id/generate-report', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    console.log(`Manual report generation triggered for organization: ${orgId}`);

    const result = await generateWeeklyReport(orgId);

    res.json({ message: 'Report generated', report_id: result.reportId });
  } catch (error) {
    next(error);
  }
});

// Analytics dashboard data
app.get('/api/organizations/:id/dashboard', validateOrgId, async (req, res, next) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    // Get ticket counts
    const ticketCountResult = await query(
      'SELECT COUNT(*) as total FROM support_tickets WHERE organization_id = $1',
      [orgId]
    );

    const analyzedCountResult = await query(
      'SELECT COUNT(*) as total FROM ticket_analysis WHERE organization_id = $1',
      [orgId]
    );

    // Get average metrics
    const avgMetricsResult = await query(
      `SELECT
        AVG(frustration_level) as avg_frustration,
        AVG(churn_risk) as avg_churn_risk
       FROM ticket_analysis
       WHERE organization_id = $1`,
      [orgId]
    );

    // Get churn risk count
    const churnRiskResult = await query(
      'SELECT COUNT(*) as count FROM ticket_analysis WHERE organization_id = $1 AND churn_risk >= 7',
      [orgId]
    );

    // Get recent tickets
    const recentTickets = await query(
      `SELECT st.*, ta.churn_risk, ta.sentiment
       FROM support_tickets st
       LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
       WHERE st.organization_id = $1
       ORDER BY st.ticket_timestamp DESC
       LIMIT 5`,
      [orgId]
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
