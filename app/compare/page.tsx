import Link from "next/link";
import { ArrowRight, ArrowDown, CheckCircle2, X, TrendingDown, Clock, Zap, Shield, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const comparisons = [
  {
    feature: "Ticket Analysis Coverage",
    supportIntel: "100% of tickets",
    manual: "10-20% randomly selected",
    improvement: "10x more coverage",
  },
  {
    feature: "Time Required",
    supportIntel: "0 hours (automated)",
    manual: "4-8 hours/week",
    improvement: "Save 200+ hours/year",
  },
  {
    feature: "Response Time",
    supportIntel: "Real-time alerts",
    manual: "Weekly reviews",
    improvement: "7x faster response",
  },
  {
    feature: "Churn Prediction Accuracy",
    supportIntel: "85% with AI",
    manual: "40-50% gut feel",
    improvement: "2x better accuracy",
  },
  {
    feature: "Sentiment Analysis",
    supportIntel: "AI-powered, nuanced",
    manual: "Subjective, inconsistent",
    improvement: "Consistent scoring",
  },
  {
    feature: "Feature Request Extraction",
    supportIntel: "Automatically categorized",
    manual: "Manual tracking",
    improvement: "Never miss insights",
  },
  {
    feature: "Trend Detection",
    supportIntel: "Pattern recognition",
    manual: "Spot checks only",
    improvement: "Catch emerging issues",
  },
  {
    feature: "Executive Reports",
    supportIntel: "Auto-generated weekly",
    manual: "Manual spreadsheet work",
    improvement: "Ready every Monday",
  },
];

const beforeAfterData = [
  {
    scenario: "Critical Bug Detected",
    before: {
      time: "3-5 days",
      impact: "15 customers affected before action",
      outcome: "3 customers churned",
    },
    after: {
      time: "Same day",
      impact: "Alerted after 3rd ticket",
      outcome: "0 customers churned",
    },
  },
  {
    scenario: "Payment Issues",
    before: {
      time: "2 weeks",
      impact: "Lost $8,000 in MRR",
      outcome: "Discovered in monthly review",
    },
    after: {
      time: "2 hours",
      impact: "Notified immediately",
      outcome: "Saved $7,200 in MRR",
    },
  },
  {
    scenario: "Feature Request",
    before: {
      time: "Never tracked",
      impact: "Lost in email threads",
      outcome: "Not prioritized",
    },
    after: {
      time: "Auto-categorized",
      impact: "Added to roadmap",
      outcome: "Launched, increased retention",
    },
  },
];

const roiCalculation = {
  timeWasted: {
    hoursPerWeek: 6,
    weeksPerYear: 52,
    totalHours: 312,
    hourlyRate: 75,
    annualCost: 23400,
  },
  churnLost: {
    monthlyChurn: 10000,
    customersLost: 5,
    recoverable: 0.4,
    annualSavings: 24000,
  },
  toolCost: {
    monthly: 149,
    annual: 1788,
  },
};

export default function ComparePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
              Support-Intel vs Manual Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See why leading SaaS companies are switching from manual ticket reviews to AI-powered churn prevention
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-8 mb-16 md:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">200+ hours</h3>
                <p className="text-gray-600 mt-2">Saved per year</p>
                <p className="text-sm text-gray-500 mt-1">vs manual review</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">10x</h3>
                <p className="text-gray-600 mt-2">More tickets analyzed</p>
                <p className="text-sm text-gray-500 mt-1">100% vs 10% coverage</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 mx-auto mb-4">
                  <TrendingDown className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">34%</h3>
                <p className="text-gray-600 mt-2">Avg. churn reduction</p>
                <p className="text-sm text-gray-500 mt-1">Across all customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison Table */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle>Feature Comparison</CardTitle>
              <CardDescription>
                Head-to-head comparison of capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="py-4 px-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-blue-600">Support-Intel</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600">Manual Analysis</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-green-600">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((comp, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{comp.feature}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            {comp.supportIntel}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-gray-400" />
                            {comp.manual}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-green-600">{comp.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Before/After Scenarios */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Real-World Before & After
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {beforeAfterData.map((scenario, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="text-lg">{scenario.scenario}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Before */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <h4 className="font-semibold text-gray-700">Before</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time to detect:</span>
                            <span className="font-medium text-red-600">{scenario.before.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Impact:</span>
                            <span className="font-medium text-gray-900">{scenario.before.impact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Outcome:</span>
                            <span className="font-medium text-red-600">{scenario.before.outcome}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowDown className="h-6 w-6 text-green-600" />
                      </div>

                      {/* After */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <h4 className="font-semibold text-gray-700">After</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time to detect:</span>
                            <span className="font-medium text-green-600">{scenario.after.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Impact:</span>
                            <span className="font-medium text-gray-900">{scenario.after.impact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Outcome:</span>
                            <span className="font-medium text-green-600">{scenario.after.outcome}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ROI Calculator */}
          <Card className="mb-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="text-2xl font-bold mb-6">ROI Breakdown</h2>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-blue-100">Time Saved (Manual Review)</p>
                      <p className="text-2xl font-bold">
                        {roiCalculation.timeWasted.totalHours} hours × ${roiCalculation.timeWasted.hourlyRate}/hr
                      </p>
                      <p className="text-lg text-green-300">= ${roiCalculation.timeWasted.annualCost.toLocaleString()}/year saved</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-blue-100">Churn Revenue Recovered</p>
                      <p className="text-2xl font-bold">
                        ${roiCalculation.churnLost.monthlyChurn.toLocaleString()}/mo × {roiCalculation.churnLost.recoverable * 100}% recoverable
                      </p>
                      <p className="text-lg text-green-300">= ${roiCalculation.churnLost.annualSavings.toLocaleString()}/year saved</p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-sm text-blue-100">Support-Intel Cost</p>
                      <p className="text-2xl font-bold">
                        ${roiCalculation.toolCost.monthly}/mo × 12 months
                      </p>
                      <p className="text-lg text-blue-200">= ${roiCalculation.toolCost.annual.toLocaleString()}/year</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <p className="text-sm text-blue-100 mb-2">Total Annual Savings</p>
                    <p className="text-5xl font-bold mb-4">
                      ${(roiCalculation.timeWasted.annualCost + roiCalculation.churnLost.annualSavings - roiCalculation.toolCost.annual).toLocaleString()}
                    </p>
                    <p className="text-lg text-blue-100">
                      {((roiCalculation.timeWasted.annualCost + roiCalculation.churnLost.annualSavings - roiCalculation.toolCost.annual) / roiCalculation.toolCost.annual).toFixed(1)}x ROI
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="text-sm">Payback period: 2 weeks</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="text-sm">No setup fees</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="text-sm">30-day free trial</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gray-900 text-white border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Stop Wasting Time on Manual Reviews
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Join 50+ SaaS companies using AI to prevent churn and save time. Start your free trial today.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    Start 30-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
