"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, AlertTriangle, TrendingUp, Download, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";

export const dynamic = 'force-dynamic';

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if Clerk is properly configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx') &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('_test_');

  useEffect(() => {
    if (isClerkConfigured) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [isClerkConfigured]);

  const fetchAdminData = async () => {
    if (!isClerkConfigured) return;

    try {
      // Dynamically import Clerk
      const { useAuth } = require("@clerk/nextjs");
      // We can't use hooks inside useEffect, so we'll use a different approach
      const tokenResponse = await fetch("/api/admin/stats");
      if (tokenResponse.ok) {
        const statsData = await tokenResponse.json();
        setStats(statsData);
      }

      const orgsRes = await fetch("/api/admin/organizations");
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

  const NotConfiguredMessage = () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Not Configured</h1>
        <p className="text-gray-600">Please set up Clerk authentication to access this page.</p>
      </div>
    </div>
  );

  if (!isClerkConfigured) {
    return <NotConfiguredMessage />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Monitor your Support Intelligence instance</p>
          </div>
          <Button onClick={fetchAdminData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Organizations</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrganizations || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats?.monthlyRevenue || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSubscriptions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Churn Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.churnRate ? stats.churnRate.toFixed(1) : 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Organizations Table */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>All organizations in your instance</CardDescription>
          </CardHeader>
          <CardContent>
            {organizations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No organizations yet</p>
            ) : (
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
                        <td className="py-3 px-4 font-medium">{org.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            org.status === 'active' ? 'bg-green-100 text-green-800' :
                            org.status === 'trial' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {org.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{org.ticketsCount}</td>
                        <td className="py-3 px-4">{new Date(org.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
