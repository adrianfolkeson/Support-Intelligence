import { Router, Request, Response } from 'express';
import { query } from '../../database/connection';
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent,
  hasActiveSubscription,
} from '../../services/stripe-service';

const router = Router();

/**
 * POST /api/organizations/:id/create-checkout
 * Create a Stripe checkout session
 */
router.post('/organizations/:id/create-checkout', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    // Get organization name
    const orgResult = await query('SELECT name FROM organizations WHERE id = $1', [orgId]);

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const orgName = orgResult.rows[0].name;

    // Get frontend URL from header or use fallback
    const frontendUrl = (req.headers['x-frontend-url'] as string) || process.env.FRONTEND_URL || 'https://supportintelligence.vercel.app';

    // Create checkout session - go directly to dashboard
    const successUrl = `${frontendUrl}/dashboard-connected?org=${orgId}&checkout=success`;
    const cancelUrl = `${frontendUrl}/pricing?canceled=true`;

    const result = await createCheckoutSession(orgId, orgName, successUrl, cancelUrl);

    res.json({ checkoutUrl: result.sessionUrl });

  } catch (error: any) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

/**
 * POST /api/organizations/:id/create-portal
 * Create a Stripe billing portal session
 */
router.post('/organizations/:id/create-portal', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    const frontendUrl = (req.headers['x-frontend-url'] as string) || process.env.FRONTEND_URL || 'https://supportintelligence.vercel.app';

    const returnUrl = `${frontendUrl}/settings?org=${orgId}`;

    const result = await createBillingPortalSession(orgId, returnUrl);

    res.json({ portalUrl: result.portalUrl });

  } catch (error: any) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: error.message || 'Failed to create billing portal session' });
  }
});

/**
 * GET /api/organizations/:id/subscription
 * Get subscription status
 */
router.get('/organizations/:id/subscription', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = Array.isArray(id) ? id[0] : id;

    const result = await query(
      `SELECT
        subscription_status,
        subscription_plan,
        trial_ends_at,
        subscription_current_period_end
       FROM organizations
       WHERE id = $1`,
      [orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const org = result.rows[0];
    const isActive = await hasActiveSubscription(orgId);

    res.json({
      status: org.subscription_status,
      plan: org.subscription_plan,
      trialEndsAt: org.trial_ends_at,
      currentPeriodEnd: org.subscription_current_period_end,
      isActive,
    });

  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to get subscription' });
  }
});

/**
 * GET /api/stripe/session/:sessionId/organization
 * Get organization ID from Stripe session
 */
router.get('/stripe/session/:sessionId/organization', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get organization_id from metadata
    const organizationId = session.metadata?.organization_id;

    if (!organizationId) {
      return res.status(404).json({ error: 'Organization not found in session' });
    }

    res.json({ organization_id: organizationId });
  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve session' });
  }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 *
 * IMPORTANT: This route must use raw body (not JSON parsed)
 */
router.post('/stripe/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Get raw body (must be configured in server.ts)
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      return res.status(400).json({ error: 'Missing raw body' });
    }

    await handleWebhookEvent(rawBody, signature as string);

    res.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message || 'Webhook failed' });
  }
});

export default router;
