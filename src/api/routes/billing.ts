import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../database/connection';
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent,
  hasActiveSubscription,
} from '../../services/stripe-service';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/organizations
 * Create a new organization
 */
router.post('/organizations', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, userId } = req.body;

    // Generate unique organization ID
    const orgId = uuidv4();

    // Insert organization with trial status
    const result = await query(
      `INSERT INTO organizations (id, name, created_at, subscription_status, subscription_plan, trial_ends_at)
       VALUES ($1, $2, NOW(), 'trial', 'pro', NOW() + INTERVAL '30 days')
       RETURNING id, name, subscription_status, subscription_plan, trial_ends_at`,
      [orgId, name]
    );

    const organization = result.rows[0];

    // Link user to organization
    await query(
      `INSERT INTO user_organizations (user_id, organization_id, role)
       VALUES ($1, $2, 'owner')`,
      [userId, orgId]
    );

    res.status(201).json({ organization });

  } catch (error: any) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: error.message || 'Failed to create organization' });
  }
});

/**
 * POST /api/organizations/:id/create-checkout
 * Create a Stripe checkout session
 */
router.post('/organizations/:id/create-checkout', requireAuth, async (req: Request, res: Response) => {
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

    // Create checkout session - go to welcome page
    const successUrl = `${frontendUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`;
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
router.post('/organizations/:id/create-portal', requireAuth, async (req: Request, res: Response) => {
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
router.get('/organizations/:id/subscription', requireAuth, async (req: Request, res: Response) => {
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
 * Get organization ID from Stripe session and verify payment
 */
router.get('/stripe/session/:sessionId/organization', requireAuth, async (req: Request, res: Response) => {
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

    // Verify payment status - must be paid for checkout to be valid
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return res.status(402).json({
        error: 'Payment not completed',
        paymentStatus: session.payment_status,
        message: 'Please complete your payment to continue'
      });
    }

    // Return organizationId with success status
    res.json({
      success: true,
      organizationId: organizationId,
      paymentStatus: session.payment_status,
      subscriptionStatus: session.subscription
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({ error: 'Invalid session ID' });
    }
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
