// Sample demo data for the sandbox mode

export interface DemoTicket {
  id: string;
  subject: string;
  customer: string;
  status: string;
  created_at: string;
  churn_risk: number;
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  description: string;
}

export interface DemoMetrics {
  totalTickets: number;
  analyzedTickets: number;
  highRiskCount: number;
  averageRiskScore: number;
  riskTrend: "up" | "down" | "stable";
}

// Demo tickets with realistic data
export const demoTickets: DemoTicket[] = [
  {
    id: "T1001",
    subject: "Payment failing repeatedly",
    customer: "Acme Corp",
    status: "open",
    created_at: "2025-03-27T10:30:00Z",
    churn_risk: 9,
    sentiment: "negative",
    category: "billing",
    description: "Our payment processor keeps timing out during checkout. We've lost 3 sales today and our customers are frustrated. This is unacceptable for a production system."
  },
  {
    id: "T1002",
    subject: "Dashboard data not updating",
    customer: "TechStart Inc",
    status: "open",
    created_at: "2025-03-27T09:15:00Z",
    churn_risk: 8,
    sentiment: "negative",
    category: "bug",
    description: "The analytics dashboard hasn't updated since yesterday. Our team relies on this data for daily decisions. This is the third time this month."
  },
  {
    id: "T1003",
    subject: "Export feature request",
    customer: "DataFlow Analytics",
    status: "closed",
    created_at: "2025-03-26T16:45:00Z",
    churn_risk: 2,
    sentiment: "neutral",
    category: "feature_request",
    description: "It would be great to have a CSV export option for the reports. Currently we have to manually copy-paste data into Excel."
  },
  {
    id: "T1004",
    subject: "Slow API response times",
    customer: "ScaleUp Enterprises",
    status: "open",
    created_at: "2025-03-26T14:20:00Z",
    churn_risk: 7,
    sentiment: "negative",
    category: "performance",
    description: "API calls are taking 3-5 seconds to respond, making our application feel sluggish. Our users are complaining about the performance."
  },
  {
    id: "T1005",
    subject: "Love the new update!",
    customer: "Happy Customer Co",
    status: "closed",
    created_at: "2025-03-26T11:00:00Z",
    churn_risk: 1,
    sentiment: "positive",
    category: "feedback",
    description: "The new dashboard layout is fantastic. Our team's productivity has increased by 30% since the update. Thank you!"
  },
  {
    id: "T1006",
    subject: "Integration documentation unclear",
    customer: "DevShop Solutions",
    status: "open",
    created_at: "2025-03-25T15:30:00Z",
    churn_risk: 5,
    sentiment: "neutral",
    category: "documentation",
    description: "We're trying to integrate with our existing systems but the documentation is missing some key steps. Spent 2 hours debugging the API connection."
  },
  {
    id: "T1007",
    subject: "Mobile app crashes on login",
    customer: "MobileFirst Inc",
    status: "open",
    created_at: "2025-03-25T13:45:00Z",
    churn_risk: 8,
    sentiment: "negative",
    category: "bug",
    description: "Our field team can't access the system because the mobile app crashes every time they try to log in. This is blocking our operations."
  },
  {
    id: "T1008",
    subject: "Need dark mode support",
    customer: "NightShift Technologies",
    status: "closed",
    created_at: "2025-03-25T10:00:00Z",
    churn_risk: 2,
    sentiment: "neutral",
    category: "feature_request",
    description: "Our team works late hours and the bright white interface is causing eye strain. Dark mode would be very helpful."
  },
  {
    id: "T1009",
    subject: "Incorrect billing amount",
    customer: "BudgetWatch Corp",
    status: "open",
    created_at: "2025-03-24T16:20:00Z",
    churn_risk: 9,
    sentiment: "negative",
    category: "billing",
    description: "We were charged $1,250 instead of our agreed $99/month rate. This is the second billing error in three months. We need this resolved immediately."
  },
  {
    id: "T1010",
    subject: "Feature request: SSO integration",
    customer: "Enterprise Solutions Ltd",
    status: "closed",
    created_at: "2025-03-24T14:00:00Z",
    churn_risk: 3,
    sentiment: "neutral",
    category: "feature_request",
    description: "We need SAML SSO integration to comply with our enterprise security requirements. When will this be available?"
  },
  {
    id: "T1011",
    subject: "Weekly reports delayed",
    customer: "Analytics Pro",
    status: "open",
    created_at: "2025-03-24T11:30:00Z",
    churn_risk: 6,
    sentiment: "neutral",
    category: "reliability",
    description: "We haven't received our weekly report for the past two weeks. Our management team uses these for planning. What's going on?"
  },
  {
    id: "T1012",
    subject: "Great customer support!",
    customer: "Startup Hub",
    status: "closed",
    created_at: "2025-03-23T15:45:00Z",
    churn_risk: 0,
    sentiment: "positive",
    category: "feedback",
    description: "Sarah from your support team was incredibly helpful. She resolved our issue in minutes and even showed us a better way to use the platform."
  },
  {
    id: "T1013",
    subject: "Data export limit too low",
    customer: "Big Data Inc",
    status: "open",
    created_at: "2025-03-23T13:15:00Z",
    churn_risk: 6,
    sentiment: "neutral",
    category: "limitation",
    description: "The 10,000 record export limit is too restrictive for our use case. We need to export 50,000+ records monthly for our analytics."
  },
  {
    id: "T1014",
    subject: "Login page broken on Safari",
    customer: "MacUser Solutions",
    status: "open",
    created_at: "2025-03-23T10:00:00Z",
    churn_risk: 7,
    sentiment: "negative",
    category: "bug",
    description: "The login button doesn't respond on Safari browser. None of our Mac-using team members can access the system."
  },
  {
    id: "T1015",
    subject: "Request for API documentation",
    customer: "Developer Tools Co",
    status: "closed",
    created_at: "2025-03-22T16:30:00Z",
    churn_risk: 2,
    sentiment: "neutral",
    category: "documentation",
    description: "We'd like to build custom integrations. Are there API docs available? We couldn't find them in the help section."
  },
];

// Demo dashboard metrics
export const demoMetrics: DemoMetrics = {
  totalTickets: 127,
  analyzedTickets: 127,
  highRiskCount: 18,
  averageRiskScore: 4.8,
  riskTrend: "up",
};

// Demo weekly report
export const demoWeeklyReport = {
  week: "March 17-23, 2025",
  totalTickets: 127,
  averageFrustration: 4.2,
  averageChurnRisk: 4.8,
  highRiskTickets: 18,
  topIssueCategories: [
    { category: "bug", count: 45, trend: "up" },
    { category: "feature_request", count: 32, trend: "stable" },
    { category: "billing", count: 18, trend: "down" },
    { category: "performance", count: 15, trend: "up" },
    { category: "documentation", count: 12, trend: "stable" },
  ],
  featureRequests: [
    "Dark mode for dashboard",
    "CSV export for reports",
    "SAML SSO integration",
    "Mobile app improvements",
    "API rate limit increase",
  ],
  criticalIssues: [
    "Login page not loading on Safari",
    "Payment processor timing out",
    "Mobile app crashes on login",
    "Dashboard shows wrong data after timezone change",
  ],
  recommendedActions: [
    {
      priority: "urgent",
      action: "Reach out to 18 at-risk customers personally",
      customers: ["Acme Corp", "BudgetWatch Corp", "MobileFirst Inc"],
    },
    {
      priority: "immediate",
      action: "Fix login page not loading on Safari",
      impact: "Affects 15% of user base",
    },
    {
      priority: "address",
      action: "Address bug reports (45 tickets this week)",
      impact: "Top issue category, trending up",
    },
    {
      priority: "consider",
      action: "Evaluate feasibility of 'Dark mode for dashboard'",
      impact: "Most requested feature",
    },
  ],
  sentimentBreakdown: {
    positive: 28,
    neutral: 64,
    negative: 35,
  },
};

// Helper function to get demo tickets by risk level
export function getDemoTicketsByRisk(level: "high" | "medium" | "low"): DemoTicket[] {
  const thresholds = {
    high: 7,
    medium: 4,
    low: 0,
  };

  return demoTickets.filter(ticket => {
    if (level === "high") return ticket.churn_risk >= thresholds.high;
    if (level === "medium") return ticket.churn_risk >= thresholds.medium && ticket.churn_risk < thresholds.high;
    return ticket.churn_risk < thresholds.medium;
  });
}

// Helper function to get demo ticket by ID
export function getDemoTicketById(id: string): DemoTicket | undefined {
  return demoTickets.find(ticket => ticket.id === id);
}
