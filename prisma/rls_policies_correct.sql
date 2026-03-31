-- Row Level Security (RLS) Policies for Supabase
-- Fixed with correct column names (camelCase)

-- Enable RLS on all tables
ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TicketAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrganizationUser" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChurnPrediction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATION POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view organizations they belong to" ON "Organization";
CREATE POLICY "Users can view organizations they belong to"
  ON "Organization" FOR SELECT
  USING (
    id IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert organizations they own" ON "Organization";
CREATE POLICY "Users can insert organizations they own"
  ON "Organization" FOR INSERT
  WITH CHECK ("supabaseUserId" = auth.uid());

DROP POLICY IF EXISTS "Organization owners can update" ON "Organization";
CREATE POLICY "Organization owners can update"
  ON "Organization" FOR UPDATE
  USING ("supabaseUserId" = auth.uid());

DROP POLICY IF EXISTS "Organization owners can delete" ON "Organization";
CREATE POLICY "Organization owners can delete"
  ON "Organization" FOR DELETE
  USING ("supabaseUserId" = auth.uid());

-- ============================================
-- TICKET POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view tickets from their orgs" ON "Ticket";
CREATE POLICY "Users can view tickets from their orgs"
  ON "Ticket" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert tickets to their orgs" ON "Ticket";
CREATE POLICY "Users can insert tickets to their orgs"
  ON "Ticket" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tickets in their orgs" ON "Ticket";
CREATE POLICY "Users can update tickets in their orgs"
  ON "Ticket" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tickets in their orgs" ON "Ticket";
CREATE POLICY "Users can delete tickets in their orgs"
  ON "Ticket" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

-- ============================================
-- TICKET ANALYSIS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view ticket analysis from their orgs" ON "TicketAnalysis";
CREATE POLICY "Users can view ticket analysis from their orgs"
  ON "TicketAnalysis" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert ticket analysis for their orgs" ON "TicketAnalysis";
CREATE POLICY "Users can insert ticket analysis for their orgs"
  ON "TicketAnalysis" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

-- ============================================
-- REPORT POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view reports from their orgs" ON "Report";
CREATE POLICY "Users can view reports from their orgs"
  ON "Report" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert reports for their orgs" ON "Report";
CREATE POLICY "Users can insert reports for their orgs"
  ON "Report" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

-- ============================================
-- WEBHOOK POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view webhooks from their orgs" ON "Webhook";
CREATE POLICY "Users can view webhooks from their orgs"
  ON "Webhook" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert webhooks for their orgs" ON "Webhook";
CREATE POLICY "Users can insert webhooks for their orgs"
  ON "Webhook" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update webhooks in their orgs" ON "Webhook";
CREATE POLICY "Users can update webhooks in their orgs"
  ON "Webhook" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete webhooks in their orgs" ON "Webhook";
CREATE POLICY "Users can delete webhooks in their orgs"
  ON "Webhook" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

-- ============================================
-- ORGANIZATION USER POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view org memberships for their orgs" ON "OrganizationUser";
CREATE POLICY "Users can view org memberships for their orgs"
  ON "OrganizationUser" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert org memberships" ON "OrganizationUser";
CREATE POLICY "Users can insert org memberships"
  ON "OrganizationUser" FOR INSERT
  WITH CHECK (
    "userId" = auth.uid() OR
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update org memberships" ON "OrganizationUser";
CREATE POLICY "Admins can update org memberships"
  ON "OrganizationUser" FOR UPDATE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete org memberships" ON "OrganizationUser";
CREATE POLICY "Admins can delete org memberships"
  ON "OrganizationUser" FOR DELETE
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================
-- USER PROFILE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON "UserProfile";
CREATE POLICY "Users can view own profile"
  ON "UserProfile" FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON "UserProfile";
CREATE POLICY "Users can insert own profile"
  ON "UserProfile" FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON "UserProfile";
CREATE POLICY "Users can update own profile"
  ON "UserProfile" FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- CHURN PREDICTION POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view churn predictions from their orgs" ON "ChurnPrediction";
CREATE POLICY "Users can view churn predictions from their orgs"
  ON "ChurnPrediction" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert churn predictions for their orgs" ON "ChurnPrediction";
CREATE POLICY "Users can insert churn predictions for their orgs"
  ON "ChurnPrediction" FOR INSERT
  WITH CHECK (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );

-- ============================================
-- CUSTOMER POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view customers from their orgs" ON "Customer";
CREATE POLICY "Users can view customers from their orgs"
  ON "Customer" FOR SELECT
  USING (
    "organizationId" IN (
      SELECT "organizationId" FROM "OrganizationUser"
      WHERE "userId" = auth.uid()
    )
  );
