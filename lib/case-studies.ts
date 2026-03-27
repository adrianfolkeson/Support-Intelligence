export interface CaseStudy {
  company: string;
  industry: string;
  logo: string;
  metrics: {
    label: string;
    value: string;
    improvement: string;
  }[];
  quote: string;
  author: string;
  role: string;
  beforeChurn: number;
  afterChurn: number;
}

export const caseStudies: CaseStudy[] = [
  {
    company: "TechFlow Solutions",
    industry: "B2B SaaS",
    logo: "TF",
    metrics: [
      { label: "Churn Reduction", value: "34%", improvement: "down" },
      { label: "Response Time", value: "80%", improvement: "improvement" },
      { label: "Revenue Saved", value: "$48K/year", improvement: "up" },
    ],
    quote: "Support-Intel transformed our customer success workflow. We now catch at-risk customers before they even ask to cancel, and our churn rate dropped from 7% to 4.6% in just three months.",
    author: "Sarah Chen",
    role: "Head of Customer Success",
    beforeChurn: 7.0,
    afterChurn: 4.6,
  },
  {
    company: "DataSync Pro",
    industry: "Data Management",
    logo: "DS",
    metrics: [
      { label: "Churn Reduction", value: "41%", improvement: "down" },
      { label: "CSAT Score", value: "2.3 points", improvement: "up" },
      { label: "Time Saved", value: "12 hours/week", improvement: "improvement" },
    ],
    quote: "The AI-powered insights are incredible. We discovered that 60% of our churn was coming from a single integration issue. Fixed it, and our churn plummeted.",
    author: "Marcus Johnson",
    role: "CEO & Founder",
    beforeChurn: 8.5,
    afterChurn: 5.0,
  },
  {
    company: "CloudScale Inc",
    industry: "Cloud Infrastructure",
    logo: "CS",
    metrics: [
      { label: "Churn Reduction", value: "28%", improvement: "down" },
      { label: "Customer Lifetime Value", value: "$2.4K", improvement: "up" },
      { label: "Tickets Monitored", value: "100%", improvement: "improvement" },
    ],
    quote: "We went from manually reviewing 20 tickets per week to analyzing 100% of our support queue automatically. The ROI was evident within the first month.",
    author: "Emily Rodriguez",
    role: "VP of Operations",
    beforeChurn: 6.2,
    afterChurn: 4.5,
  },
];

export const testimonials = [
  {
    quote: "Support-Intel paid for itself in the first week. We identified 3 at-risk customers and saved $24,000 in MRR.",
    author: "James Wilson",
    role: "Founder, LaunchPad SaaS",
    company: "LaunchPad SaaS",
  },
  {
    quote: "The weekly reports are gold. Our entire exec team relies on them for strategic decisions about product roadmap.",
    author: "Lisa Park",
    role: "Chief Customer Officer, Meridian Tech",
    company: "Meridian Tech",
  },
  {
    quote: "Finally, a tool that actually prevents churn instead of just reporting it. The AI predictions are scary accurate.",
    author: "David Kim",
    role: "Head of Support, AppStack",
    company: "AppStack",
  },
  {
    quote: "We reduced our support team's review time by 75% while catching more at-risk customers than ever before.",
    author: "Rachel Green",
    role: "Customer Success Manager, FlowState",
    company: "FlowState",
  },
  {
    quote: "The setup took 15 minutes. Within an hour, we had actionable insights about our customers. Impressive.",
    author: "Tom Martinez",
    role: "CTO, Nexus Software",
    company: "Nexus Software",
  },
];
