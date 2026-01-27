-- Support Intelligence Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    external_api_key TEXT,
    external_api_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- Support tickets table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    external_ticket_id VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255) NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    priority VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ticket_timestamp TIMESTAMP NOT NULL,
    UNIQUE(organization_id, external_ticket_id)
);

CREATE INDEX idx_support_tickets_organization_id ON support_tickets(organization_id);
CREATE INDEX idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_timestamp ON support_tickets(ticket_timestamp DESC);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Ticket analysis table
CREATE TABLE ticket_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sentiment VARCHAR(50) NOT NULL,
    frustration_level INTEGER NOT NULL CHECK (frustration_level >= 0 AND frustration_level <= 10),
    churn_risk INTEGER NOT NULL CHECK (churn_risk >= 0 AND churn_risk <= 10),
    categories TEXT[] NOT NULL DEFAULT '{}',
    feature_requests TEXT[] NOT NULL DEFAULT '{}',
    key_issues TEXT[] NOT NULL DEFAULT '{}',
    recommended_action TEXT,
    analyzed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(ticket_id)
);

CREATE INDEX idx_ticket_analysis_organization_id ON ticket_analysis(organization_id);
CREATE INDEX idx_ticket_analysis_ticket_id ON ticket_analysis(ticket_id);
CREATE INDEX idx_ticket_analysis_churn_risk ON ticket_analysis(churn_risk DESC);
CREATE INDEX idx_ticket_analysis_analyzed_at ON ticket_analysis(analyzed_at DESC);

-- Weekly reports table
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_tickets INTEGER NOT NULL DEFAULT 0,
    high_priority_issues TEXT[] NOT NULL DEFAULT '{}',
    churn_risk_tickets INTEGER NOT NULL DEFAULT 0,
    feature_requests_summary TEXT[] NOT NULL DEFAULT '{}',
    recommended_actions TEXT[] NOT NULL DEFAULT '{}',
    executive_summary TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, week_start)
);

CREATE INDEX idx_weekly_reports_organization_id ON weekly_reports(organization_id);
CREATE INDEX idx_weekly_reports_week_start ON weekly_reports(week_start DESC);
CREATE INDEX idx_weekly_reports_created_at ON weekly_reports(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
