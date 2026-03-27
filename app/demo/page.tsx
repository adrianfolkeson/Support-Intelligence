"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, CheckCircle2, TrendingUp, BarChart3, FileText, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { demoTickets, demoMetrics, demoWeeklyReport, getDemoTicketsByRisk } from "@/lib/demo-data";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState } from "react";

export default function DemoPage() {
  const [activeView, setActiveView] = useState<"dashboard" | "tickets" | "reports">("dashboard");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const highRiskTickets = getDemoTicketsByRisk("high");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-medium">
              Demo Mode - Exploring with Sample Data
            </span>
          </div>
          <Link href="/pricing">
            <Button size="sm" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* View Selector */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveView("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("tickets")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "tickets"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setActiveView("reports")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === "reports"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Weekly Reports
            </button>
          </div>

          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <div className="space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Monitor your churn risk and support ticket insights
                </p>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {demoMetrics.totalTickets}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Analyzed</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {demoMetrics.analyzedTickets}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">High Risk</p>
                        <p className="mt-2 text-3xl font-bold text-red-600">
                          {demoMetrics.highRiskCount}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">
                          {demoMetrics.averageRiskScore.toFixed(1)}
                          <span className="text-lg text-gray-500">/10</span>
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* High Risk Tickets Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>High Churn Risk Tickets</CardTitle>
                      <CardDescription>
                        Tickets that need immediate attention
                      </CardDescription>
                    </div>
                    <Link href="/demo" onClick={() => setActiveView("tickets")}>
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Subject</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Customer</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Risk</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {highRiskTickets.slice(0, 5).map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSelectedTicket(ticket.id);
                              setActiveView("tickets");
                            }}
                          >
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {ticket.subject}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {ticket.customer}
                            </td>
                            <td className="py-3 px-4">
                              <RiskBadge risk={ticket.churn_risk} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {ticket.category}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                <CardContent className="pt-8 pb-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">
                    Ready to analyze your real data?
                  </h2>
                  <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
                    Start your 30-day free trial and connect your support platform in minutes.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/pricing">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tickets View */}
          {activeView === "tickets" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
                <p className="mt-2 text-gray-600">
                  All analyzed support tickets with churn risk scores
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">ID</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Subject</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Customer</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Risk</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Category</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demoTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedTicket(ticket.id)}
                          >
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {ticket.id}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {ticket.subject}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {ticket.customer}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  ticket.status === "open"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {ticket.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <RiskBadge risk={ticket.churn_risk} />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {ticket.category}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Detail Modal */}
              {selectedTicket && (
                <div
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedTicket(null)}
                >
                  <Card
                    className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>
                            {demoTickets.find((t) => t.id === selectedTicket)?.subject}
                          </CardTitle>
                          <CardDescription>
                            {demoTickets.find((t) => t.id === selectedTicket)?.customer} •{" "}
                            {demoTickets.find((t) => t.id === selectedTicket)?.id}
                          </CardDescription>
                        </div>
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Description</h4>
                        <p className="text-sm text-gray-900">
                          {demoTickets.find((t) => t.id === selectedTicket)?.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Churn Risk</h4>
                          <RiskBadge risk={demoTickets.find((t) => t.id === selectedTicket)?.churn_risk || 0} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">Sentiment</h4>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              demoTickets.find((t) => t.id === selectedTicket)?.sentiment === "positive"
                                ? "bg-green-100 text-green-800"
                                : demoTickets.find((t) => t.id === selectedTicket)?.sentiment === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {demoTickets.find((t) => t.id === selectedTicket)?.sentiment}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Reports View */}
          {activeView === "reports" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
                <p className="mt-2 text-gray-600">
                  Executive summaries of your support queue insights
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Support Overview</CardTitle>
                  <CardDescription>{demoWeeklyReport.week}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">{demoWeeklyReport.totalTickets}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Frustration</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {demoWeeklyReport.averageFrustration}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Churn Risk</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {demoWeeklyReport.averageChurnRisk}/10
                      </p>
                    </div>
                  </div>

                  {/* Critical Issues */}
                  <div>
                    <h4 className="text-lg font-semibold text-red-600 mb-3">
                      ⚠️ Critical: {demoWeeklyReport.highRiskTickets} High Churn Risk Tickets
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">These customers need immediate attention.</p>
                    <ul className="space-y-2">
                      {demoWeeklyReport.criticalIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What's Broken */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">🔥 What's Broken</h4>
                    <ul className="space-y-2">
                      {demoWeeklyReport.criticalIssues.map((issue, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-orange-500 mr-2">•</span>
                          <span className="text-gray-700">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Top Issue Categories */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Top Issue Categories</h4>
                    <div className="space-y-2">
                      {demoWeeklyReport.topIssueCategories.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 capitalize">{cat.category.replace("_", " ")}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{cat.count} tickets</span>
                            <span
                              className={`text-xs ${
                                cat.trend === "up"
                                  ? "text-red-600"
                                  : cat.trend === "down"
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {cat.trend === "up" ? "↑" : cat.trend === "down" ? "↓" : "→"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature Requests */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">💡 Feature Requests</h4>
                    <ul className="space-y-2">
                      {demoWeeklyReport.featureRequests.map((req, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">✅ Recommended Actions for Next Week</h4>
                    <div className="space-y-3">
                      {demoWeeklyReport.recommendedActions.map((action, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            action.priority === "urgent"
                              ? "bg-red-50 border border-red-200"
                              : action.priority === "immediate"
                              ? "bg-orange-50 border border-orange-200"
                              : "bg-blue-50 border border-blue-200"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {idx + 1}. {action.action}
                              </p>
                              {action.impact && (
                                <p className="text-xs text-gray-600 mt-1">{action.impact}</p>
                              )}
                              {action.customers && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Customers: {action.customers.join(", ")}
                                </p>
                              )}
                            </div>
                            <span
                              className={`text-xs font-medium uppercase ml-3 ${
                                action.priority === "urgent"
                                  ? "text-red-600"
                                  : action.priority === "immediate"
                                  ? "text-orange-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {action.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Breakdown */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Sentiment Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Positive</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-green-500 h-full"
                            style={{
                              width: `${(demoWeeklyReport.sentimentBreakdown.positive / demoWeeklyReport.totalTickets) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-600">{demoWeeklyReport.sentimentBreakdown.positive}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Neutral</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gray-500 h-full"
                            style={{
                              width: `${(demoWeeklyReport.sentimentBreakdown.neutral / demoWeeklyReport.totalTickets) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-600">{demoWeeklyReport.sentimentBreakdown.neutral}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-red-700">Negative</span>
                        <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-red-500 h-full"
                            style={{
                              width: `${(demoWeeklyReport.sentimentBreakdown.negative / demoWeeklyReport.totalTickets) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-gray-600">{demoWeeklyReport.sentimentBreakdown.negative}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
