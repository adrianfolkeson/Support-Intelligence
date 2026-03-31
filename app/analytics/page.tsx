"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { ChurnTrendChart } from "@/components/dashboard/charts/churn-trend-chart";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

interface ChurnTrend {
  date: string;
  avgRiskScore: number;
  highRiskCount: number;
  customerCount: number;
  churnedCustomers: number;
}

interface CohortData {
  cohort: string;
  month0: number;
  month1: number;
  month2: number;
  month3: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<ChurnTrend[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);

  useEffect(() => {
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
    fetchAnalytics(orgIdFromCookie);
  }, [router]);

  const fetchAnalytics = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/analytics/churn-trends?orgId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTrendData(data.trends || []);
        setCohortData(data.cohorts || []);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Calculate improvement
  const latestRisk = trendData[trendData.length - 1]?.avgRiskScore || 0;
  const previousRisk = trendData[0]?.avgRiskScore || 0;
  const improved = latestRisk < previousRisk;
  const improvementPercent = previousRisk > 0 ? ((previousRisk - latestRisk) / previousRisk * 100).toFixed(1) : "0";

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900">Churn Trends Analytics</h1>
            <p className="mt-2 text-neutral-600">Track your churn risk over time and identify patterns</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Current Risk Score</p>
                    <p className="text-2xl font-bold text-neutral-900">{latestRisk.toFixed(1)}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${improved ? "text-success" : "text-error"}`}>
                    {improved ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                    <span>{improvementPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">30-Day Avg</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {(trendData.reduce((acc, t) => acc + t.avgRiskScore, 0) / trendData.length).toFixed(1)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Total Churned (30d)</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      {trendData.reduce((acc, t) => acc + (t.churnedCustomers || 0), 0)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-error" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Churn Risk Trend</CardTitle>
              <CardDescription>90-day historical view of your churn risk</CardDescription>
            </CardHeader>
            <CardContent>
              <ChurnTrendChart data={trendData} />
            </CardContent>
          </Card>

          {/* Cohort Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>Customer retention by signup cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-neutral-600">Cohort</th>
                      <th className="py-3 px-4 text-center font-medium text-neutral-600">Month 0</th>
                      <th className="py-3 px-4 text-center font-medium text-neutral-600">Month 1</th>
                      <th className="py-3 px-4 text-center font-medium text-neutral-600">Month 2</th>
                      <th className="py-3 px-4 text-center font-medium text-neutral-600">Month 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="py-3 px-4 font-medium text-neutral-900">{cohort.cohort}</td>
                        <td className="py-3 px-4 text-center text-success">{cohort.month0}%</td>
                        <td className="py-3 px-4 text-center text-success">{cohort.month1}%</td>
                        <td className="py-3 px-4 text-center text-success">{cohort.month2}%</td>
                        <td className="py-3 px-4 text-center text-success">{cohort.month3}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
