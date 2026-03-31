"use client";

/* eslint-disable react-hooks/rules-of-hooks */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RiskBadge } from "@/components/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";

export const dynamic = 'force-dynamic';

function TicketsContent() {
  const router = useRouter();

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

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

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
    fetchTickets(orgIdFromCookie, page, filter);
  }, [router, page, filter]);

  const fetchTickets = async (id: string, pageNum: number, riskFilter: string) => {
    try {
      const token = await getToken();
      const offset = (pageNum - 1) * limit;

      let url = `/api/organizations/${id}/tickets?limit=${limit}&offset=${offset}`;
      if (riskFilter !== "all") {
        const riskMin = riskFilter === "low" ? 0 : riskFilter === "medium" ? 5 : 8;
        const riskMax = riskFilter === "low" ? 5 : riskFilter === "medium" ? 8 : 10;
        url += `&riskMin=${riskMin}&riskMax=${riskMax}`;
      }

      const data = await fetchAPI(url, {}, token);
      setTickets(data.tickets || data || []);
      setTotalCount(data.total || data.length || 0);
    } catch (error: any) {
      console.error("Failed to fetch tickets:", error);
      showToast(error.message || "Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.customerEmail?.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalCount / limit);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
            <p className="mt-2 text-gray-600">
              View and analyze all customer support tickets
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by customer email or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as any);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk (1-4)</option>
            <option value="medium">Medium Risk (5-7)</option>
            <option value="high">High Risk (8-10)</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No tickets found</p>
              {searchQuery || filter !== "all" ? (
                <p className="mt-2 text-sm text-gray-400">
                  Try adjusting your search or filters
                </p>
              ) : (
                <button
                  onClick={() => router.push("/upload")}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Upload tickets to get started
                </button>
              )}
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Risk Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Frustration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/tickets/${ticket.id}`)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {ticket.customerEmail || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ticket.subject?.length > 60
                          ? ticket.subject.substring(0, 60) + "..."
                          : ticket.subject || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <RiskBadge risk={ticket.churnRisk || 0} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {ticket.frustrationLevel || 0}/10
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                  <p className="text-sm text-gray-500">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} tickets
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-3 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <ToastProvider>
      <TicketsContent />
    </ToastProvider>
  );
}
