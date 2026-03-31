-- Row Level Security (RLS) Policies for Supabase
-- Fixed for PascalCase table names

-- Enable RLS on all tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TicketAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATION POLICIES
-- ============================================

-- Users can view organizations they belong to
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON "Organization";
CREATE POLICY "Users can view organizations they belong to"
  ON "Organization" FOR SELECT
  USING (
    id IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert organizations (they become the owner)
DROP POLICY IF EXISTS "Users can insert organizations they own" ON "Organization";
CREATE POLICY "Users can insert organizations they own"
  ON "Organization" FOR INSERT
  WITH CHECK ("supabaseUserId" = auth.uid());

-- Organization owners can update
DROP POLICY IF EXISTS "Organization owners can update" ON "Organization";
CREATE POLICY "Organization owners can update"
  ON "Organization" FOR UPDATE
  USING ("supabaseUserId" = auth.uid());

-- Organization owners can delete
DROP POLICY IF EXISTS "Organization owners can delete" ON "Organization";
CREATE POLICY "Organization owners can delete"
  ON "Organization" FOR DELETE
  USING ("supabaseUserId" = auth.uid());

-- ============================================
-- TICKET POLICIES
-- ============================================

-- Users can view tickets from their orgs
DROP POLICY IF EXISTS "Users can view tickets from their orgs" ON "Ticket";
CREATE POLICY "Users can view tickets from their orgs"
  ON "Ticket" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert tickets to their orgs
DROP POLICY IF EXISTS "Users can insert tickets to their orgs" ON "Ticket";
CREATE POLICY "Users can insert tickets to their orgs"
  ON "Ticket" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can update tickets in their orgs
DROP POLICY IF EXISTS "Users can update tickets in their orgs" ON "Ticket";
CREATE POLICY "Users can update tickets in their orgs"
  ON "Ticket" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can delete tickets in their orgs
DROP POLICY IF EXISTS "Users can delete tickets in their orgs" ON "Ticket";
CREATE POLICY "Users can delete tickets in their orgs"
  ON "Ticket" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- ============================================
-- TICKET ANALYSIS POLICIES
-- ============================================

-- Users can view ticket analysis from their orgs
DROP POLICY IF EXISTS "Users can view ticket analysis from their orgs" ON "TicketAnalysis";
CREATE POLICY "Users can view ticket analysis from their orgs"
  ON "TicketAnalysis" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert ticket analysis for their orgs
DROP POLICY IF EXISTS "Users can insert ticket analysis for their orgs" ON "TicketAnalysis";
CREATE POLICY "Users can insert ticket analysis for their orgs"
  ON "TicketAnalysis" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- ============================================
-- REPORT POLICIES
-- ============================================

-- Users can view reports from their orgs
DROP POLICY IF EXISTS "Users can view reports from their orgs" ON "Report";
CREATE POLICY "Users can view reports from their orgs"
  ON "Report" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert reports for their orgs
DROP POLICY IF EXISTS "Users can insert reports for their orgs" ON "Report";
CREATE POLICY "Users can insert reports for their orgs"
  ON "Report" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- ============================================
-- WEBHOOK POLICIES
-- ============================================

-- Users can view webhooks from their orgs
DROP POLICY IF EXISTS "Users can view webhooks from their orgs" ON "Webhook";
CREATE POLICY "Users can view webhooks from their orgs"
  ON "Webhook" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert webhooks for their orgs
DROP POLICY IF EXISTS "Users can insert webhooks for their orgs" ON "Webhook";
CREATE POLICY "Users can insert webhooks for their orgs"
  ON "Webhook" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can update webhooks in their orgs
DROP POLICY IF EXISTS "Users can update webhooks in their orgs" ON "Webhook";
CREATE POLICY "Users can update webhooks in their orgs"
  ON "Webhook" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can delete webhooks in their orgs
DROP POLICY IF EXISTS "Users can delete webhooks in their orgs" ON "Webhook";
CREATE POLICY "Users can delete webhooks in their orgs"
  ON "Webhook" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATION USER POLICIES
-- ============================================

-- Users can view org memberships for their orgs
DROP POLICY IF EXISTS "Users can view org memberships for their orgs" ON "OrganizationUser";
CREATE POLICY "Users can view org memberships for their orgs"
  ON "OrganizationUser" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert org memberships (if they're already a member)
DROP POLICY IF EXISTS "Users can insert org memberships" ON "OrganizationUser";
CREATE POLICY "Users can insert org memberships"
  ON "OrganizationUser" FOR INSERT
  WITH CHECK (
    "userProfileId" = auth.uid() OR
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Users can update org memberships in their orgs (owner/admin only)
DROP POLICY IF EXISTS "Admins can update org memberships" ON "OrganizationUser";
CREATE POLICY "Admins can update org memberships"
  ON "OrganizationUser" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Users can delete org memberships in their orgs (owner/admin only)
DROP POLICY IF EXISTS "Admins can delete org memberships" ON "OrganizationUser";
CREATE POLICY "Admins can delete org memberships"
  ON "OrganizationUser" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- USER PROFILE POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
CREATE POLICY "Users can view own profile"
  ON "UserProfile" FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
CREATE POLICY "Users can insert own profile"
  ON "UserProfile" FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
CREATE POLICY "Users can update own profile"
  ON "UserProfile" FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CHURN PREDICTION POLICIES (if table exists)
-- ============================================

-- Users can view churn predictions from their orgs
DROP POLICY IF EXISTS "Users can view churn predictions from their orgs" ON "ChurnPrediction";
CREATE POLICY "Users can view churn predictions from their orgs"
  ON "ChurnPrediction" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );

-- Users can insert churn predictions for their orgs
DROP POLICY IF EXISTS "Users can insert churn predictions for their orgs" ON "ChurnPrediction";
CREATE POLICY "Users can insert churn predictions for their orgs"
  ON "ChurnPrediction" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userProfileId" = auth.uid()
    )
  );
