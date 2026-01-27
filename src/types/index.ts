// Database entity types

export interface User {
  id: string;
  email: string;
  name: string;
  organization_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: string;
  name: string;
  external_api_key?: string;
  external_api_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SupportTicket {
  id: string;
  organization_id: string;
  external_ticket_id: string;
  customer_id: string;
  subject?: string;
  message: string;
  status: 'open' | 'closed' | 'pending';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_at: Date;
  ticket_timestamp: Date;
}

export interface TicketAnalysis {
  id: string;
  ticket_id: string;
  organization_id: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  frustration_level: number; // 0-10
  churn_risk: number; // 0-10
  categories: string[]; // ["bug", "feature_request", "billing", etc.]
  feature_requests: string[];
  key_issues: string[];
  recommended_action?: string;
  analyzed_at: Date;
}

export interface WeeklyReport {
  id: string;
  organization_id: string;
  week_start: Date;
  week_end: Date;
  total_tickets: number;
  high_priority_issues: string[];
  churn_risk_tickets: number;
  feature_requests_summary: string[];
  recommended_actions: string[];
  executive_summary: string;
  created_at: Date;
}

// API types
export interface IngestionResult {
  success: boolean;
  tickets_ingested: number;
  tickets_skipped: number;
  errors?: string[];
}

export interface AnalysisResult {
  success: boolean;
  tickets_analyzed: number;
  errors?: string[];
}

export interface ClaudeAnalysisOutput {
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
  frustration_level: number;
  churn_risk: number;
  categories: string[];
  feature_requests: string[];
  key_issues: string[];
  recommended_action?: string;
}
