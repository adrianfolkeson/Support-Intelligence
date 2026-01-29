"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

interface TicketDetails {
  id: string;
  ticket_id: string;
  sentiment: string;
  frustration_level: number;
  churn_risk: number;
  confidence: number;
  categories: string[];
  key_issues: string[];
  feature_requests: string[];
  recommended_action: string | null;
  evidence: string[];
  intelligence_version: string;
  analyzed_at: string;
  critique?: {
    critique_confidence: number;
    critique_notes: string[];
    inconsistencies: string[];
    flags: string[];
  };
}

export default function TicketDetailPage() {
  const params = useParams();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Mock data matching your database structure
    const mockTicket: TicketDetails = {
      id: params.id as string,
      ticket_id: "ticket-3",
      sentiment: "frustrated",
      frustration_level: 9,
      churn_risk: 8,
      confidence: 0.90,
      categories: ["technical_issue", "complaint"],
      key_issues: ["Login failure with 500 errors", "Inability to access the app"],
      feature_requests: [],
      recommended_action: "escalate",
      evidence: [
        "Customer reported being unable to log in for 2 hours",
        "Customer is receiving 500 errors throughout the app",
        "Customer explicitly stated they will cancel subscription if not fixed immediately",
        "High frustration and churn risk require urgent escalation to engineering"
      ],
      intelligence_version: "support-intel-v1.0.0",
      analyzed_at: new Date().toISOString(),
      critique: {
        critique_confidence: 0.80,
        critique_notes: [],
        inconsistencies: [],
        flags: []
      }
    };

    setTicket(mockTicket);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      case "negative":
        return "bg-orange-100 text-orange-800";
      case "frustrated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 8) return "text-red-600";
    if (risk >= 5) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-900 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ticket {ticket.ticket_id}
          </h1>
          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(ticket.sentiment)}>
              {ticket.sentiment}
            </Badge>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              Analyzed {new Date(ticket.analyzed_at).toLocaleDateString()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">
              {ticket.intelligence_version}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Churn Risk</span>
                    <span className={`text-2xl font-bold ${getChurnRiskColor(ticket.churn_risk)}`}>
                      {ticket.churn_risk}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ticket.churn_risk >= 8
                          ? "bg-red-600"
                          : ticket.churn_risk >= 5
                          ? "bg-orange-600"
                          : "bg-green-600"
                      }`}
                      style={{ width: `${ticket.churn_risk * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Frustration Level</span>
                    <span className="text-2xl font-bold">{ticket.frustration_level}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${ticket.frustration_level * 10}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">AI Confidence</span>
                    <span className="text-2xl font-bold">{(ticket.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${ticket.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence */}
            <Card>
              <CardHeader>
                <CardTitle>Evidence</CardTitle>
                <CardDescription>
                  Why the AI rated this ticket this way
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ticket.evidence.length > 0 ? (
                  <ul className="space-y-2">
                    {ticket.evidence.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No evidence available</p>
                )}
              </CardContent>
            </Card>

            {/* Critique */}
            {ticket.critique && (
              <Card>
                <CardHeader>
                  <CardTitle>Quality Check</CardTitle>
                  <CardDescription>
                    Second-pass validation by AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium">Critique Confidence:</span>
                      <span className="ml-2 text-lg font-bold">
                        {(ticket.critique.critique_confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    {ticket.critique.flags.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-orange-600">Flags:</span>
                        <ul className="mt-2 space-y-1">
                          {ticket.critique.flags.map((flag, index) => (
                            <li key={index} className="text-sm text-gray-700">• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ticket.critique.inconsistencies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-red-600">Inconsistencies:</span>
                        <ul className="mt-2 space-y-1">
                          {ticket.critique.inconsistencies.map((item, index) => (
                            <li key={index} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ticket.critique.flags.length === 0 && ticket.critique.inconsistencies.length === 0 && (
                      <p className="text-sm text-green-600">✓ No issues found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recommended Action */}
            {ticket.recommended_action && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={
                      ticket.recommended_action === "escalate"
                        ? "bg-red-100 text-red-800 text-base px-4 py-2"
                        : "bg-blue-100 text-blue-800 text-base px-4 py-2"
                    }
                  >
                    {ticket.recommended_action}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ticket.categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Key Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ticket.key_issues.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Feature Requests */}
            {ticket.feature_requests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Feature Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {ticket.feature_requests.map((request, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        • {request}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
