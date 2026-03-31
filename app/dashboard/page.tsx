"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Link as LinkIcon, RefreshCw, Download, AlertTriangle, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/stats-card";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { ChurnTrendChart } from "@/components/dashboard/charts/churn-trend-chart";
import { RiskDistributionChart } from "@/components/dashboard/charts/risk-distribution-chart";
import { SentimentChart } from "@/components/dashboard/charts/sentiment-chart";
import { CategoryBreakdownChart } from "@/components/dashboard/charts/category-breakdown-chart";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function DashboardContent() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Dashboard data
  const [stats, setStats] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    // Get orgId from cookie
    const getOrgId = () => {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "orgId") return value;
      }
      return null;
    };

    const orgIdFromCookie = getOrgId();
    if (!orgIdFromCookie) {
      router.push("/welcome");
      return;
    }

    setOrgId(orgIdFromCookie);
    fetchData(orgIdFromCookie);
  }, [router]);

  const fetchData = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      // Fetch dashboard stats
      const statsData = await fetchAPI(`/api/organizations/${id}/dashboard`, {}, token);
      setStats(statsData);

      // Fetch recent tickets
      const ticketsData = await fetchAPI(`/api/organizations/${id}/tickets?limit=10`, {}, token);
      setTickets(ticketsData.tickets || ticketsData || []);

      // Fetch chart data
      try {
        const chartsResponse = await fetch(`/api/dashboard/charts?orgId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (chartsResponse.ok) {
          const chartsJson = await chartsResponse.json();
          setChartData(chartsJson);
        }
      } catch (chartError) {
        console.error("Failed to fetch chart data:", chartError);
        // Don't show toast for chart errors, just log it
      } finally {
        setLoadingCharts(false);
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      showToast(error.message || "Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!orgId) return;
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await fetchAPI(`/api/organizations/${orgId}/sync-zendesk`, { method: "POST" }, token);
      showToast("Sync started successfully", "success");
      // Refresh data after a delay
      setTimeout(() => fetchData(orgId), 2000);
    } catch (error: any) {
      showToast(error.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!orgId) return;
    setAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await fetchAPI(`/api/organizations/${orgId}/analyze`, { method: "POST" }, token);
      showToast("Analysis started", "success");
      setTimeout(() => fetchData(orgId), 3000);
    } catch (error: any) {
      showToast(error.message || "Analysis failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (!orgId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const data = await fetchAPI(`/api/organizations/${orgId}/export`, {}, token);
      // Create download link
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      showToast("Export successful", "success");
    } catch (error: any) {
      showToast(error.message || "Export failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Empty State - No tickets yet
  if (!stats || stats.totalTickets === 0) {
    return (
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900">Let&apos;s get you set up</h1>
            <p className="mt-4 text-lg text-neutral-600">
              Connect your data source to start analyzing customer churn risk
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Connect Zendesk */}
            <div className="rounded-2xl bg-white p-8 shadow-card border border-neutral-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <LinkIcon className="h-6 w-6 text-neutral-700" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900">Connect Zendesk</h2>
              <p className="mt-2 text-neutral-600">
                Automatically import and analyze your support tickets from Zendesk
              </p>
              <div className="mt-6">
                <Button onClick={() => router.push("/settings")}>
                  Connect Zendesk
                </Button>
              </div>
            </div>

            {/* Upload CSV */}
            <div className="rounded-2xl bg-white p-8 shadow-card border border-neutral-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                <Download className="h-6 w-6 text-neutral-700" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900">Upload CSV</h2>
              <p className="mt-2 text-neutral-600">
                Upload a CSV file of your support tickets for manual import
              </p>
              <div className="mt-6">
                <Button variant="secondary" onClick={() => router.push("/upload")}>
                  Upload CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Setup Progress */}
          <div className="mt-12 rounded-2xl bg-white p-6 shadow-card border border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Setup Progress</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Account created</span>
                <Badge variant="success">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Connect data source</span>
                <Badge variant="warning">Pending</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">AI analysis</span>
                <Badge variant="default">Waiting for data</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected State - Has tickets
  const highRiskCount = stats.highRiskCount || 0;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
            <p className="mt-2 text-neutral-600">
              Monitor your customer churn risk and take action
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              Sync
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
              Analyze
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Alert for high-risk customers */}
        {highRiskCount > 0 && (
          <div className="mt-6 rounded-lg bg-error/10 p-4 flex items-start gap-3 border border-error/20">
            <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-error">
                {highRiskCount} customer{highRiskCount > 1 ? "s" : ""} need attention
              </p>
              <p className="text-sm text-neutral-700">
                High churn risk detected. Review these tickets immediately.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total Tickets"
            value={stats.totalTickets || 0}
          />
          <StatsCard
            label="Analyzed"
            value={stats.analyzedTickets || 0}
          />
          <StatsCard
            label="High Risk"
            value={highRiskCount}
            trend={highRiskCount > 0 ? "Requires attention" : "All good"}
          />
          <StatsCard
            label="Avg Risk Score"
            value={`${(stats.averageRiskScore || 0).toFixed(1)}/10`}
          />
        </div>

        {/* Charts Section */}
        {chartData && !loadingCharts && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Churn Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Trend (30 Days)</CardTitle>
                <CardDescription>
                  Average risk score and high-risk ticket count over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChurnTrendChart data={chartData.churnTrend} />
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Current breakdown of ticket risk levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskDistributionChart data={chartData.riskDistribution} />
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>
                  Weekly sentiment breakdown of support tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentChart data={chartData.sentiment} />
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Category</CardTitle>
                <CardDescription>
                  Issue categories with trend indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart data={chartData.categories} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Tickets */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Tickets</h2>
            <Link
              href="/tickets"
              className="text-sm text-neutral-700 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-card border border-neutral-200">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                No tickets yet. Sync your data to get started.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-neutral-50"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-900">
                        {ticket.customerEmail || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {ticket.subject?.length > 50
                          ? ticket.subject.substring(0, 50) + "..."
                          : ticket.subject || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <RiskBadge risk={ticket.churnRisk || 0} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-neutral-500">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="cursor-pointer rounded-2xl bg-white p-6 shadow-card border border-neutral-200 transition-colors hover:bg-neutral-50"
            onClick={() => router.push("/reports")}
          >
            <FileText className="h-8 w-8 text-neutral-700" />
            <h3 className="mt-3 font-semibold text-neutral-900">Weekly Reports</h3>
            <p className="mt-1 text-sm text-neutral-600">
              View comprehensive weekly analysis
            </p>
          </div>
          <div
            className="cursor-pointer rounded-2xl bg-white p-6 shadow-card border border-neutral-200 transition-colors hover:bg-neutral-50"
            onClick={() => router.push("/settings")}
          >
            <Settings className="h-8 w-8 text-neutral-700" />
            <h3 className="mt-3 font-semibold text-neutral-900">Settings</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Manage integrations and preferences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
