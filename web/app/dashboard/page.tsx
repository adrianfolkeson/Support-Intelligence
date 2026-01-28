"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Force dynamic to avoid SSR issues with useSearchParams
export const dynamic = 'force-dynamic';

interface TicketAnalysis {
  id: string;
  ticket_id: string;
  sentiment: string;
  frustration_level: number;
  churn_risk: number;
  confidence: number;
  categories: string[];
  key_issues: string[];
  analyzed_at: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const selectedOrg = searchParams.get("org") || "";
  const [tickets, setTickets] = useState<TicketAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high-risk" | "frustrated">("all");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const mockTickets: TicketAnalysis[] = [
      {
        id: "c817f4ef-cfb3-4806-bdaa-cc07f797853b",
        ticket_id: "ticket-3",
        sentiment: "frustrated",
        frustration_level: 9,
        churn_risk: 8,
        confidence: 0.90,
        categories: ["technical_issue", "complaint"],
        key_issues: ["Login failure with 500 errors", "Inability to access the app"],
        analyzed_at: new Date().toISOString(),
      },
      {
        id: "a174e99a-ae2d-48f2-9360-0d40c05d83f9",
        ticket_id: "ticket-2",
        sentiment: "positive",
        frustration_level: 3,
        churn_risk: 2,
        confidence: 0.80,
        categories: ["feature_request"],
        key_issues: ["Bright UI causing eye strain"],
        analyzed_at: new Date().toISOString(),
      },
      {
        id: "a3e718c3-5a0e-48ff-9b08-d0c475533d78",
        ticket_id: "ticket-1",
        sentiment: "negative",
        frustration_level: 8,
        churn_risk: 6,
        confidence: 0.90,
        categories: ["billing", "complaint"],
        key_issues: ["Double charge on credit card"],
        analyzed_at: new Date().toISOString(),
      },
    ];

    setTickets(mockTickets);
    setLoading(false);
  }, [isClient]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "high-risk") return ticket.churn_risk >= 7;
    if (filter === "frustrated") return ticket.frustration_level >= 7;
    return true;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800";
      case "neutral": return "bg-gray-100 text-gray-800";
      case "negative": return "bg-orange-100 text-orange-800";
      case "frustrated": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 8) return "bg-red-500 text-white";
    if (risk >= 5) return "bg-orange-500 text-white";
    return "bg-green-500 text-white";
  };

  const stats = {
    total: tickets.length,
    highRisk: tickets.filter((t) => t.churn_risk >= 7).length,
    avgConfidence: tickets.length > 0
      ? (tickets.reduce((sum, t) => sum + t.confidence, 0) / tickets.length * 100).toFixed(0)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
            <div className="flex gap-4">
              <Link href="/upload">
                <Button variant="outline">Upload CSV</Button>
              </Link>
              <Link href={`/settings?org=${selectedOrg}`}>
                <Button variant="outline">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Tickets</CardDescription>
              <CardTitle className="text-4xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>High Churn Risk</CardDescription>
              <CardTitle className="text-4xl text-red-600">{stats.highRisk}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Avg AI Confidence</CardDescription>
              <CardTitle className="text-4xl">{stats.avgConfidence}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analyzed Tickets</CardTitle>
            <CardDescription>AI-powered analysis of your support tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
                All ({tickets.length})
              </Button>
              <Button variant={filter === "high-risk" ? "default" : "outline"} onClick={() => setFilter("high-risk")}>
                High Risk ({tickets.filter((t) => t.churn_risk >= 7).length})
              </Button>
              <Button variant={filter === "frustrated" ? "default" : "outline"} onClick={() => setFilter("frustrated")}>
                Frustrated ({tickets.filter((t) => t.frustration_level >= 7).length})
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No tickets found.</p>
                <Link href="/upload">
                  <Button>Upload CSV to Get Started</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/ticket/${ticket.id}`}
                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-gray-600">{ticket.ticket_id}</span>
                          <Badge className={getSentimentColor(ticket.sentiment)}>{ticket.sentiment}</Badge>
                          <Badge className={getChurnRiskColor(ticket.churn_risk)}>Churn Risk: {ticket.churn_risk}/10</Badge>
                          <Badge variant="outline">Frustration: {ticket.frustration_level}/10</Badge>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          <strong>Key Issues:</strong> {ticket.key_issues.join(", ")}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Categories: {ticket.categories.join(", ")}</span>
                          <span>•</span>
                          <span>Confidence: {(ticket.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
