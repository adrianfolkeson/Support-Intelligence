-- Add subscription fields to organizations table

ALTER TABLE organizations
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN stripe_subscription_id VARCHAR(255),
ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trial',
ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'pro',
ADD COLUMN trial_ends_at TIMESTAMP,
ADD COLUMN subscription_current_period_end TIMESTAMP;

-- Index for subscription lookups
CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);

-- Add comments for clarity
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN organizations.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN organizations.subscription_status IS 'Subscription status: trial, active, canceled, past_due';
COMMENT ON COLUMN organizations.subscription_plan IS 'Subscription plan: pro (only plan for MVP)';
COMMENT ON COLUMN organizations.trial_ends_at IS 'When the 7-day trial ends';
COMMENT ON COLUMN organizations.subscription_current_period_end IS 'Current billing period end date';
