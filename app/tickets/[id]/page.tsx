"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { getRiskColor } from "@/lib/utils";

export const dynamic = 'force-dynamic';

function TicketDetailContent() {
  const router = useRouter();
  const params = useParams();

  // Check if Clerk is properly configured (not placeholder keys)
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx') &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('_test_');

  if (!isClerkConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Not Configured</h1>
          <p className="text-gray-600">Please set up Clerk authentication to access this page.</p>
        </div>
      </div>
    );
  }

  const { useAuth } = require("@clerk/nextjs");
  const { getToken } = useAuth();
  const { showToast } = useToast();

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchTicket(params.id as string);
    }
  }, [params.id]);

  const fetchTicket = async (id: string) => {
    try {
      const token = await getToken();
      const data = await fetchAPI(`/api/tickets/${id}`, {}, token);
      setTicket(data.ticket || data);
    } catch (error: any) {
      console.error("Failed to fetch ticket:", error);
      showToast(error.message || "Failed to load ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-gray-600">Ticket not found</p>
        <Button onClick={() => router.push("/tickets")} className="mt-4">
          Go back to tickets
        </Button>
      </div>
    );
  }

  const riskLevel = ticket.churnRisk || 0;
  const riskColor = getRiskColor(riskLevel);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/tickets")}
          className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to tickets
        </button>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{ticket.subject || "No subject"}</CardTitle>
                <p className="mt-2 text-sm text-gray-600">{ticket.customerEmail || "Unknown customer"}</p>
              </div>
              <RiskBadge risk={riskLevel} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Message</label>
              <div className="mt-1 max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
                {ticket.message || "No message content"}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                Created: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "Unknown"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        {ticket.analysis && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sentiment */}
              <div>
                <label className="text-sm font-medium text-gray-500">Sentiment</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      ticket.analysis.sentiment === "positive"
                        ? "success"
                        : ticket.analysis.sentiment === "negative"
                        ? "danger"
                        : "default"
                    }
                  >
                    {ticket.analysis.sentiment || "Neutral"}
                  </Badge>
                </div>
              </div>

              {/* Frustration Level */}
              <div>
                <label className="text-sm font-medium text-gray-500">Frustration Level</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 rounded-full bg-gray-200 h-2">
                    <div
                      className={`h-2 rounded-full ${
                        riskLevel >= 8
                          ? "bg-red-500"
                          : riskLevel >= 5
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(ticket.analysis.frustrationLevel || 0) * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {ticket.analysis.frustrationLevel || 0}/10
                  </span>
                </div>
              </div>

              {/* Churn Risk */}
              <div>
                <label className="text-sm font-medium text-gray-500">Churn Risk</label>
                <div className="mt-1">
                  <RiskBadge risk={riskLevel} />
                  <span className="ml-2 text-sm text-gray-600">
                    {riskLevel >= 8
                      ? "High - Immediate action recommended"
                      : riskLevel >= 5
                      ? "Medium - Monitor closely"
                      : "Low - No immediate action needed"}
                  </span>
                </div>
              </div>

              {/* Key Issues */}
              {ticket.analysis.keyIssues && ticket.analysis.keyIssues.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Key Issues</label>
                  <ul className="mt-2 space-y-1">
                    {ticket.analysis.keyIssues.map((issue: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 text-gray-400">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommended Action */}
              {ticket.analysis.recommendedAction && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Recommended Action</label>
                  <div className="mt-1 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                    {ticket.analysis.recommendedAction}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {ticket.analysis.evidence && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Supporting Evidence</label>
                  <div className="mt-1 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 italic">
                    &quot;{ticket.analysis.evidence}&quot;
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <ToastProvider>
      <TicketDetailContent />
    </ToastProvider>
  );
}
