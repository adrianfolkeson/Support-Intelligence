"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Users, DollarSign, AlertTriangle, TrendingUp, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

interface AdminStats {
  totalOrganizations: number;
  totalUsers: number;
  totalTickets: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  ticketsCount: number;
  status: "active" | "trial" | "churned";
}

export default function AdminPage() {
  const { userId, getToken } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = await getToken();
      const [statsRes, orgsRes] = await Promise.all([
        fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/organizations", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData.organizations || []);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      const token = await getToken();
      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      }
    } catch (error) {
      console.error("Backup failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-2 text-gray-600">System-wide analytics and management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchAdminData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleBackup}>
                <Download className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Organizations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalOrganizations || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats?.monthlyRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTickets?.toLocaleString() || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Churn Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.churnRate?.toFixed(1) || 0}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organizations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>Manage all organizations in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Tickets</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{org.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              org.status === "active"
                                ? "bg-green-100 text-green-800"
                                : org.status === "trial"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {org.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{org.ticketsCount}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
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
