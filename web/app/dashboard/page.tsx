"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Force dynamic rendering - prevent prerendering at build time
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
  const [tickets, setTickets] = useState<TicketAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high-risk" | "frustrated">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const org = params.get("org") || "";
      
      // Mock data for demo
      const mockTickets: TicketAnalysis[] = [
        {
          id: "1",
          ticket_id: "ticket-3",
          sentiment: "frustrated",
          frustration_level: 9,
          churn_risk: 8,
          confidence: 0.90,
          categories: ["technical_issue"],
          key_issues: ["Login failure"],
          analyzed_at: new Date().toISOString(),
        },
        {
          id: "2",
          ticket_id: "ticket-2",
          sentiment: "positive",
          frustration_level: 3,
          churn_risk: 2,
          confidence: 0.80,
          categories: ["feature_request"],
          key_issues: ["Bright UI"],
          analyzed_at: new Date().toISOString(),
        },
        {
          id: "3",
          ticket_id: "ticket-1",
          sentiment: "negative",
          frustration_level: 8,
          churn_risk: 6,
          confidence: 0.90,
          categories: ["billing"],
          key_issues: ["Double charge"],
          analyzed_at: new Date().toISOString(),
        },
      ];

      setTickets(mockTickets);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "high-risk") return ticket.churn_risk >= 7;
    if (filter === "frustrated") return ticket.frustration_level >= 7;
    return true;
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "#dcfce7";
      case "neutral": return "#f3f4f6";
      case "negative": return "#ffedd5";
      case "frustrated": return "#fee2e2";
      default: return "#f3f4f6";
    }
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 8) return "#ef4444";
    if (risk >= 5) return "#f97316";
    return "#22c55e";
  };

  const stats = {
    total: tickets.length,
    highRisk: tickets.filter((t) => t.churn_risk >= 7).length,
    avgConfidence: tickets.length > 0
      ? (tickets.reduce((sum, t) => sum + t.confidence, 0) / tickets.length * 100).toFixed(0)
      : 0,
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "2rem" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", textAlign: "center" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827" }}>
              Support Intelligence
            </Link>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/upload" style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                Upload CSV
              </Link>
              <Link href="/settings" style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Tickets</p>
            <p style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{stats.total}</p>
          </div>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>High Churn Risk</p>
            <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#dc2626" }}>{stats.highRisk}</p>
          </div>
          <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Avg Confidence</p>
            <p style={{ fontSize: "2.25rem", fontWeight: "bold" }}>{stats.avgConfidence}%</p>
          </div>
        </div>

        {/* Tickets */}
        <div style={{ backgroundColor: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Analyzed Tickets</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>AI-powered analysis of your support tickets</p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {["all", "high-risk", "frustrated"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  backgroundColor: filter === f ? "#2563eb" : "white",
                  color: filter === f ? "white" : "#374151",
                  fontSize: "0.875rem",
                }}
              >
                {f === "all" ? `All (${tickets.length})` : f === "high-risk" ? `High Risk (${tickets.filter((t) => t.churn_risk >= 7).length})` : `Frustrated (${tickets.filter((t) => t.frustration_level >= 7).length})`}
              </button>
            ))}
          </div>

          {/* Ticket List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "#6b7280" }}>{ticket.ticket_id}</span>
                      <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", backgroundColor: getSentimentColor(ticket.sentiment) }}>{ticket.sentiment}</span>
                      <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", color: "white", backgroundColor: getChurnRiskColor(ticket.churn_risk) }}>Churn Risk: {ticket.churn_risk}/10</span>
                      <span style={{ padding: "0.125rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", border: "1px solid #d1d5db" }}>Frustration: {ticket.frustration_level}/10</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.5rem" }}>
                      <strong>Key Issues:</strong> {ticket.key_issues.join(", ")}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Categories: {ticket.categories.join(", ")} • Confidence: {(ticket.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
