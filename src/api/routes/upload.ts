import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import { query } from '../../database/connection';

const router = Router();

interface UploadRequest {
  organizationName: string;
  csvData: string;
}

/**
 * POST /api/upload
 * Upload and parse CSV tickets
 */
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const { organizationName, csvData }: UploadRequest = req.body;

    if (!organizationName || !csvData) {
      return res.status(400).json({ error: 'Missing organizationName or csvData' });
    }

    // Create organization
    const orgId = uuidv4();
    await query(
      'INSERT INTO organizations (id, name, created_at) VALUES ($1, $2, NOW())',
      [orgId, organizationName]
    );

    // Parse CSV with papaparse (handles quoted fields, commas in values, etc.)
    const parsed = Papa.parse<{ customer_id: string; subject: string; message: string }>(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parsed.data.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty or invalid' });
    }

    let imported = 0;
    const errors: string[] = [];

    for (const row of parsed.data) {
      const customer_id = row.customer_id?.trim();
      const subject = row.subject?.trim();
      const message = row.message?.trim();

      if (!customer_id || !message) {
        errors.push(`Skipping row with missing customer_id or message`);
        continue;
      }

      try {
        await query(
          `INSERT INTO support_tickets (id, organization_id, customer_id, subject, message, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [uuidv4(), orgId, customer_id, subject || null, message]
        );
        imported++;
      } catch (err) {
        console.error('Error inserting ticket:', err);
        errors.push(`Failed to insert ticket for customer ${customer_id}`);
      }
    }

    if (parsed.errors.length > 0) {
      for (const err of parsed.errors) {
        errors.push(`CSV parse error on row ${err.row}: ${err.message}`);
      }
    }

    // Link the authenticated user to this organization
    const userId = (req as any).userId;
    if (userId) {
      await query(
        'INSERT INTO user_organizations (user_id, organization_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [userId, orgId, 'owner']
      );
    }

    console.log(`✓ Imported ${imported} tickets for ${organizationName} (${orgId})`);

    res.json({
      success: true,
      organizationId: orgId,
      ticketCount: imported,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload tickets' });
  }
});

/**
 * POST /api/analyze
 * Trigger analysis for an organization
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { organizationId } = req.body;

    if (!organizationId) {
      return res.status(400).json({ error: 'Missing organizationId' });
    }

    // Check organization exists
    const orgResult = await query(
      'SELECT * FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Import and run analysis (this will import the compiled JS)
    const { analyzeTickets } = require('../../services/analysis');

    console.log(`Starting analysis for organization: ${organizationId}`);

    const result = await analyzeTickets(organizationId);

    res.json({
      success: true,
      ticketsAnalyzed: result.tickets_analyzed,
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

export default router;
