"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

function BillingContent() {
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
    fetchSubscription(orgIdFromCookie);
  }, [router]);

  const fetchSubscription = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const data = await fetchAPI(`/api/organizations/${id}/subscription`, {}, token);
      setSubscription(data);
    } catch (error: any) {
      console.error("Failed to fetch subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!orgId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const data = await fetchAPI(
        `/api/organizations/${orgId}/create-portal`,
        { method: "POST" },
        token
      );
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      showToast(error.message || "Failed to open customer portal", "error");
    }
  };

  const handleCancel = async () => {
    if (!orgId) return;
    setCanceling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await fetchAPI(
        `/api/organizations/${orgId}/subscription`,
        { method: "DELETE" },
        token
      );
      showToast("Subscription canceled", "success");
      fetchSubscription(orgId);
      setShowCancelConfirm(false);
    } catch (error: any) {
      showToast(error.message || "Failed to cancel subscription", "error");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isCanceled = subscription?.cancelAtPeriodEnd;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/settings")}
          className="mb-6 text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to settings
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and payment method
          </p>
        </div>

        {/* Current Plan */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Professional Plan
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${subscription?.amount || 149}/month
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={isActive ? "success" : "warning"}>
                    {subscription?.status || "Unknown"}
                  </Badge>
                  {isCanceled && (
                    <Badge variant="danger">
                      Cancels {formatDate(subscription?.currentPeriodEnd)}
                    </Badge>
                  )}
                </div>
                {subscription?.trialEnd && (
                  <p className="mt-2 text-sm text-gray-600">
                    Trial ends {formatDate(subscription.trialEnd)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button onClick={handleManageSubscription}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Manage in Customer Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tickets analyzed</span>
              <span className="font-medium text-gray-900">
                {subscription?.usage || 0} / 2,000
              </span>
            </div>
            <div className="w-full rounded-full bg-gray-200 h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(((subscription?.usage || 0) / 2000) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cancel Subscription */}
        {!isCanceled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Cancel Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showCancelConfirm ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Canceling your subscription will stop all future charges.
                    Your access will continue until the end of your billing period.
                  </p>
                  <Button
                    variant="danger"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              ) : (
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-red-900 font-medium mb-4">
                    Are you sure you want to cancel?
                  </p>
                  <p className="text-red-800 text-sm mb-4">
                    You will lose access to all features at the end of your
                    current billing period ({formatDate(subscription?.currentPeriodEnd)}).
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="danger"
                      onClick={handleCancel}
                      disabled={canceling}
                    >
                      {canceling ? "Canceling..." : "Yes, Cancel"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelConfirm(false)}
                    >
                      Keep Subscription
                    </Button>
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

export default function BillingPage() {
  return (
    <ToastProvider>
      <BillingContent />
    </ToastProvider>
  );
}
