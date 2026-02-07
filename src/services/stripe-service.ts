import Stripe from 'stripe';
import { query } from '../database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const PRICE_ID = process.env.STRIPE_PRICE_ID || '';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set - Stripe functionality will be disabled');
}

if (!PRICE_ID) {
  console.warn('⚠️  STRIPE_PRICE_ID not set - checkout sessions cannot be created');
}

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
  organizationId: string,
  organizationName: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionUrl: string }> {
  try {
    // Check if organization already has a Stripe customer
    const orgResult = await query(
      'SELECT stripe_customer_id FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      throw new Error('Organization not found');
    }

    let customerId = orgResult.rows[0].stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          organization_id: organizationId,
          organization_name: organizationName,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await query(
        'UPDATE organizations SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, organizationId]
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organization_id: organizationId,
      },
      subscription_data: {
        metadata: {
          organization_id: organizationId,
        },
        trial_period_days: 30,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    return { sessionUrl: session.url };

  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  organizationId: string,
  returnUrl: string
): Promise<{ portalUrl: string }> {
  try {
    const orgResult = await query(
      'SELECT stripe_customer_id FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0 || !orgResult.rows[0].stripe_customer_id) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: orgResult.rows[0].stripe_customer_id,
      return_url: returnUrl,
    });

    return { portalUrl: session.url };

  } catch (error) {
    console.error('Billing portal error:', error);
    throw error;
  }
}

/**
 * Handle webhook events from Stripe
 */
export async function handleWebhookEvent(
  rawBody: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    console.log(`Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

/**
 * Handle successful checkout
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in checkout session metadata');
    return;
  }

  await query(
    `UPDATE organizations
     SET subscription_status = 'active',
         stripe_subscription_id = $1
     WHERE id = $2`,
    [session.subscription, organizationId]
  );

  console.log(`Checkout completed for org ${organizationId}`);
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in subscription metadata');
    return;
  }

  const status = subscription.status;
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  await query(
    `UPDATE organizations
     SET subscription_status = $1,
         stripe_subscription_id = $2,
         subscription_current_period_end = $3,
         trial_ends_at = $4
     WHERE id = $5`,
    [status, subscription.id, currentPeriodEnd, trialEnd, organizationId]
  );

  console.log(`Subscription updated for org ${organizationId}: ${status}`);
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in subscription metadata');
    return;
  }

  await query(
    `UPDATE organizations
     SET subscription_status = 'canceled'
     WHERE id = $1`,
    [organizationId]
  );

  console.log(`Subscription canceled for org ${organizationId}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for customer ${invoice.customer}`);

  // Update subscription status to active if it was past_due
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const organizationId = subscription.metadata?.organization_id;

    if (organizationId) {
      await query(
        `UPDATE organizations
         SET subscription_status = 'active'
         WHERE id = $1 AND subscription_status = 'past_due'`,
        [organizationId]
      );
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for customer ${invoice.customer}`);

  // Update subscription status to past_due
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    const organizationId = subscription.metadata?.organization_id;

    if (organizationId) {
      await query(
        `UPDATE organizations
         SET subscription_status = 'past_due'
         WHERE id = $1`,
        [organizationId]
      );

      // TODO: Send email alert to customer
      console.log(`⚠️  Payment failed for org ${organizationId} - send email alert`);
    }
  }
}

/**
 * Check if organization has active subscription
 */
export async function hasActiveSubscription(organizationId: string): Promise<boolean> {
  const result = await query(
    `SELECT subscription_status, trial_ends_at
     FROM organizations
     WHERE id = $1`,
    [organizationId]
  );

  if (result.rows.length === 0) {
    return false;
  }

  const { subscription_status, trial_ends_at } = result.rows[0];

  // Active subscription
  if (subscription_status === 'active' || subscription_status === 'trialing') {
    return true;
  }

  // Trial period
  if (subscription_status === 'trial' && trial_ends_at) {
    const trialEnd = new Date(trial_ends_at);
    return trialEnd > new Date();
  }

  return false;
}
