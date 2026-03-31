-- Row Level Security (RLS) Policies for Supabase
-- This file should be run in your Supabase SQL Editor after setting up your project

-- Enable RLS on all tables
ALTER TABLE organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE report ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATION POLICIES
-- ============================================

-- Users can view organizations they belong to
CREATE POLICY "Users can view organizations they belong to"
  ON organization FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert organizations (they become the owner)
CREATE POLICY "Users can insert organizations they own"
  ON organization FOR INSERT
  WITH CHECK (supabaseUserId = auth.uid());

-- Organization owners can update
CREATE POLICY "Organization owners can update"
  ON organization FOR UPDATE
  USING (supabaseUserId = auth.uid());

-- Organization owners can delete
CREATE POLICY "Organization owners can delete"
  ON organization FOR DELETE
  USING (supabaseUserId = auth.uid());

-- ============================================
-- TICKET POLICIES
-- ============================================

-- Users can view tickets from their orgs
CREATE POLICY "Users can view tickets from their orgs"
  ON ticket FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert tickets to their orgs
CREATE POLICY "Users can insert tickets to their orgs"
  ON ticket FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can update tickets in their orgs
CREATE POLICY "Users can update tickets in their orgs"
  ON ticket FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can delete tickets in their orgs
CREATE POLICY "Users can delete tickets in their orgs"
  ON ticket FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- ============================================
-- TICKET ANALYSIS POLICIES
-- ============================================

-- Users can view ticket analysis from their orgs
CREATE POLICY "Users can view ticket analysis from their orgs"
  ON ticket_analysis FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert ticket analysis for their orgs
CREATE POLICY "Users can insert ticket analysis for their orgs"
  ON ticket_analysis FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can update ticket analysis in their orgs
CREATE POLICY "Users can update ticket analysis in their orgs"
  ON ticket_analysis FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- ============================================
-- REPORT POLICIES
-- ============================================

-- Users can view reports from their orgs
CREATE POLICY "Users can view reports from their orgs"
  ON report FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert reports for their orgs
CREATE POLICY "Users can insert reports for their orgs"
  ON report FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- ============================================
-- WEBHOOK POLICIES
-- ============================================

-- Users can view webhooks from their orgs
CREATE POLICY "Users can view webhooks from their orgs"
  ON webhook FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert webhooks for their orgs
CREATE POLICY "Users can insert webhooks for their orgs"
  ON webhook FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can update webhooks in their orgs
CREATE POLICY "Users can update webhooks in their orgs"
  ON webhook FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can delete webhooks in their orgs
CREATE POLICY "Users can delete webhooks in their orgs"
  ON webhook FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATION USER POLICIES
-- ============================================

-- Users can view org memberships for their orgs
CREATE POLICY "Users can view org memberships for their orgs"
  ON organization_user FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert org memberships (if they're already a member)
CREATE POLICY "Users can insert org memberships"
  ON organization_user FOR INSERT
  WITH CHECK (
    user_profile_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Users can update org memberships in their orgs (owner/admin only)
CREATE POLICY "Admins can update org memberships"
  ON organization_user FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Users can delete org memberships in their orgs (owner/admin only)
CREATE POLICY "Admins can delete org memberships"
  ON organization_user FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- USER PROFILE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profile FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON user_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profile FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CHURN PREDICTION POLICIES (if table exists)
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view churn predictions from their orgs" ON churn_prediction;
DROP POLICY IF EXISTS "Users can insert churn predictions for their orgs" ON churn_prediction;

-- Users can view churn predictions from their orgs
CREATE POLICY "Users can view churn predictions from their orgs"
  ON churn_prediction FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );

-- Users can insert churn predictions for their orgs
CREATE POLICY "Users can insert churn predictions for their orgs"
  ON churn_prediction FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_user
      WHERE user_profile_id = auth.uid()
    )
  );
