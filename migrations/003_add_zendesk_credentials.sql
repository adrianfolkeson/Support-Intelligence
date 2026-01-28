-- Add Zendesk integration fields to organizations table

ALTER TABLE organizations
ADD COLUMN zendesk_subdomain VARCHAR(255),
ADD COLUMN zendesk_email VARCHAR(255),
ADD COLUMN zendesk_api_token TEXT,
ADD COLUMN last_sync_at TIMESTAMP;

-- Index for last sync time (useful for scheduled jobs)
CREATE INDEX idx_organizations_last_sync_at ON organizations(last_sync_at);

-- Add a comment for clarity
COMMENT ON COLUMN organizations.zendesk_subdomain IS 'Zendesk subdomain (e.g., "yourcompany" from yourcompany.zendesk.com)';
COMMENT ON COLUMN organizations.zendesk_email IS 'Email address for Zendesk API authentication';
COMMENT ON COLUMN organizations.zendesk_api_token IS 'Encrypted Zendesk API token for authentication';
COMMENT ON COLUMN organizations.last_sync_at IS 'Timestamp of last successful ticket sync from Zendesk';
