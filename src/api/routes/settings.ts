import { Router, Request, Response } from 'express';
import { query } from '../../database/connection';
import { syncZendeskTickets } from '../../services/zendesk';

const router = Router();

/**
 * GET /api/organizations/:id/settings
 * Get organization settings (without exposing API token)
 */
router.get('/organizations/:id/settings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        zendesk_subdomain,
        zendesk_email,
        last_sync_at
       FROM organizations
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const org = result.rows[0];

    res.json({
      settings: {
        zendesk_subdomain: org.zendesk_subdomain,
        zendesk_email: org.zendesk_email,
        last_sync_at: org.last_sync_at,
        has_zendesk_credentials: !!(org.zendesk_subdomain && org.zendesk_email),
      },
    });

  } catch (error: any) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message || 'Failed to get settings' });
  }
});

/**
 * POST /api/organizations/:id/settings
 * Update organization settings (save Zendesk credentials)
 */
router.post('/organizations/:id/settings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { zendesk_subdomain, zendesk_email, zendesk_api_token } = req.body;

    // Validate required fields
    if (!zendesk_subdomain || !zendesk_email) {
      return res.status(400).json({ error: 'Subdomain and email are required' });
    }

    // Check if organization exists
    const orgResult = await query(
      'SELECT id FROM organizations WHERE id = $1',
      [id]
    );

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Update organization settings
    // If token is provided, update it; otherwise keep existing
    let updateQuery: string;
    let updateParams: any[];

    if (zendesk_api_token) {
      updateQuery = `
        UPDATE organizations
        SET zendesk_subdomain = $1,
            zendesk_email = $2,
            zendesk_api_token = $3,
            updated_at = NOW()
        WHERE id = $4
      `;
      updateParams = [zendesk_subdomain, zendesk_email, zendesk_api_token, id];
    } else {
      updateQuery = `
        UPDATE organizations
        SET zendesk_subdomain = $1,
            zendesk_email = $2,
            updated_at = NOW()
        WHERE id = $3
      `;
      updateParams = [zendesk_subdomain, zendesk_email, id];
    }

    await query(updateQuery, updateParams);

    console.log(`✓ Updated Zendesk settings for organization: ${id}`);

    res.json({
      success: true,
      message: 'Settings saved successfully',
    });

  } catch (error: any) {
    console.error('Save settings error:', error);
    res.status(500).json({ error: error.message || 'Failed to save settings' });
  }
});

/**
 * POST /api/organizations/:id/sync-zendesk
 * Manually trigger Zendesk ticket sync
 */
router.post('/organizations/:id/sync-zendesk', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`Manual Zendesk sync triggered for organization: ${id}`);

    // Run sync
    const result = await syncZendeskTickets(id);

    res.json({
      success: true,
      ticketsSynced: result.ticketsSynced,
      message: `Successfully synced ${result.ticketsSynced} tickets from Zendesk`,
    });

  } catch (error: any) {
    console.error('Zendesk sync error:', error);
    res.status(500).json({
      error: error.message || 'Zendesk sync failed',
      details: error.message,
    });
  }
});

export default router;
