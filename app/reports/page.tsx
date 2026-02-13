"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

function ReportsContent() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { showToast } = useToast();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

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
    fetchReports(orgIdFromCookie);
  }, [router]);

  const fetchReports = async (id: string) => {
    try {
      const token = await getToken();
      const data = await fetchAPI(`/api/organizations/${id}/reports`, {}, token);
      setReports(data.reports || data || []);
    } catch (error: any) {
      console.error("Failed to fetch reports:", error);
      showToast(error.message || "Failed to load reports", "error");
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

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Weekly Reports</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive weekly analysis of your customer support trends
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No reports yet</h3>
              <p className="mt-2 text-gray-600">
                Reports are generated weekly once you have ticket data.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-4 text-blue-600 hover:underline"
              >
                Go to dashboard
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/reports/${report.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {report.weekRange || formatDate(report.startDate)}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Generated {formatDate(report.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tickets Analyzed</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {report.totalTickets || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">High Risk</p>
                      <p className="mt-1 text-lg font-semibold text-red-600">
                        {report.highRiskCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Risk Score</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {(report.avgRiskScore || 0).toFixed(1)}/10
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ToastProvider>
      <ReportsContent />
    </ToastProvider>
  );
}
