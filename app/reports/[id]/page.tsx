"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function ReportDetailContent() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const { showToast } = useToast();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string);
    }
  }, [params.id]);

  const fetchReport = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const data = await fetchAPI(`/api/reports/${id}`, {}, token);
      setReport(data.report || data);
    } catch (error: any) {
      console.error("Failed to fetch report:", error);
      showToast(error.message || "Failed to load report", "error");
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

  if (!report) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <p className="text-gray-600">Report not found</p>
        <Button onClick={() => router.push("/reports")} className="mt-4">
          Go back to reports
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.push("/reports")}
          className="mb-6 flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to reports
        </button>

        {/* Report Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
          <p className="mt-2 text-gray-600">
            {report.weekRange || formatDate(report.startDate)} - {formatDate(report.endDate)}
          </p>
          <p className="text-sm text-gray-500">
            Generated {formatDate(report.createdAt)}
          </p>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{report.summary || "No summary available."}</p>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Total Tickets</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {report.totalTickets || 0}
                </p>
                {report.ticketsChange !== undefined && (
                  <p className={`mt-1 flex items-center text-sm ${
                    report.ticketsChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {report.ticketsChange >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(report.ticketsChange).toFixed(0)}% vs last week
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {report.highRiskCount || 0}
                </p>
                {report.highRiskChange !== undefined && (
                  <p className={`mt-1 flex items-center text-sm ${
                    report.highRiskChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {report.highRiskChange >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(report.highRiskChange).toFixed(0)}% vs last week
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Risk Score</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {(report.avgRiskScore || 0).toFixed(1)}/10
                </p>
                {report.avgRiskChange !== undefined && (
                  <p className={`mt-1 flex items-center text-sm ${
                    report.avgRiskChange >= 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {report.avgRiskChange >= 0 ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {Math.abs(report.avgRiskChange).toFixed(1)} vs last week
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Sentiment</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 capitalize">
                  {report.dominantSentiment || "Neutral"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {report.positivePercent || 0}% positive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Issues */}
        {report.topIssues && report.topIssues.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Top Issues This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.topIssues.map((issue: any, index: number) => (
                  <li key={index} className="flex items-start justify-between">
                    <span className="text-gray-700">
                      <span className="mr-2 text-gray-400">{index + 1}.</span>
                      {issue.issue || issue}
                    </span>
                    <span className="text-sm text-gray-500">
                      {issue.count} {issue.count === 1 ? "ticket" : "tickets"}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* High Risk Customers */}
        {report.highRiskCustomers && report.highRiskCustomers.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                High-Risk Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.highRiskCustomers.map((customer: any, index: number) => (
                  <li key={index} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                    <span className="text-gray-700">{customer.email || customer}</span>
                    <RiskBadge risk={customer.riskScore || customer.risk || 8} />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Trends */}
        {report.trends && report.trends.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trends & Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.trends.map((trend: string, index: number) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <CheckCircle className="mr-2 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    {trend}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="rounded-lg bg-blue-50 p-3 text-blue-800">
                    <span className="font-medium">{index + 1}.</span> {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ReportDetailPage() {
  return (
    <ToastProvider>
      <ReportDetailContent />
    </ToastProvider>
  );
}
