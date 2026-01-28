"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get("org");

  const [zendeskSubdomain, setZendeskSubdomain] = useState("");
  const [zendeskEmail, setZendeskEmail] = useState("");
  const [zendeskApiToken, setZendeskApiToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hasCredentials, setHasCredentials] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (orgId) {
      loadSettings();
      loadSubscription();
    }
  }, [orgId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.zendesk_subdomain) {
          setZendeskSubdomain(data.settings.zendesk_subdomain);
          setZendeskEmail(data.settings.zendesk_email || "");
          setHasCredentials(true);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgId) {
      setError("No organization selected");
      return;
    }

    if (!zendeskSubdomain || !zendeskEmail || !zendeskApiToken) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zendesk_subdomain: zendeskSubdomain,
          zendesk_email: zendeskEmail,
          zendesk_api_token: zendeskApiToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      setMessage("Settings saved successfully!");
      setHasCredentials(true);
      setZendeskApiToken(""); // Clear token after saving for security
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncNow = async () => {
    if (!orgId) {
      setError("No organization selected");
      return;
    }

    setSyncing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/sync-zendesk`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sync failed");
      }

      const result = await response.json();
      setMessage(`Successfully synced ${result.ticketsSynced} tickets!`);

      // Auto-trigger analysis
      setTimeout(async () => {
        try {
          const analyzeResponse = await fetch(`http://localhost:3001/api/organizations/${orgId}/analyze`, {
            method: "POST",
          });

          if (analyzeResponse.ok) {
            const analyzeResult = await analyzeResponse.json();
            setMessage(`Synced ${result.ticketsSynced} tickets and started analysis!`);
          }
        } catch (err) {
          console.error("Auto-analysis failed:", err);
        }
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/subscription`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error("Failed to load subscription:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleSubscribe = async () => {
    if (!orgId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Failed to start subscription");
    }
  };

  const handleManageBilling = async () => {
    if (!orgId) return;

    try {
      const response = await fetch(`http://localhost:3001/api/organizations/${orgId}/create-portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create billing portal session");
      }

      const data = await response.json();
      window.location.href = data.portalUrl;
    } catch (err: any) {
      setError(err.message || "Failed to open billing portal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
            <Link href={`/dashboard?org=${orgId}`}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {/* Zendesk Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Zendesk Integration</CardTitle>
              <CardDescription>
                Connect your Zendesk account to automatically sync support tickets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Zendesk Subdomain
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">https://</span>
                    <input
                      id="subdomain"
                      type="text"
                      value={zendeskSubdomain}
                      onChange={(e) => setZendeskSubdomain(e.target.value)}
                      placeholder="yourcompany"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span className="text-gray-500">.zendesk.com</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Zendesk Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={zendeskEmail}
                    onChange={(e) => setZendeskEmail(e.target.value)}
                    placeholder="admin@yourcompany.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
                    API Token
                  </label>
                  <input
                    id="apiToken"
                    type="password"
                    value={zendeskApiToken}
                    onChange={(e) => setZendeskApiToken(e.target.value)}
                    placeholder="Enter your Zendesk API token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!hasCredentials}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {hasCredentials
                      ? "Leave blank to keep existing token"
                      : "Generate in Zendesk Admin → API → Token Access"}
                  </p>
                </div>

                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Zendesk Settings"}
                </Button>
              </form>

              {hasCredentials && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Manual Sync</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Manually sync tickets from Zendesk. Automatic syncing happens daily at 2am.
                  </p>
                  <Button
                    onClick={handleSyncNow}
                    disabled={syncing}
                    variant="outline"
                    className="w-full"
                  >
                    {syncing ? "Syncing..." : "Sync Tickets Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription & Billing */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>
                Manage your subscription and payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubscription ? (
                <div className="text-center py-4 text-gray-500">Loading subscription...</div>
              ) : subscription?.isActive ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          ✓ Active Subscription
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {subscription.status === "trialing"
                            ? `Trial ends ${new Date(subscription.trialEndsAt).toLocaleDateString()}`
                            : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-900">$249/mo</p>
                        <p className="text-xs text-green-700">Pro Plan</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleManageBilling}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Billing
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Update payment method, view invoices, or cancel subscription
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Pro Plan - $249/month</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Unlimited ticket analysis</li>
                      <li>✓ Automatic Zendesk sync (daily)</li>
                      <li>✓ AI-powered churn detection</li>
                      <li>✓ Email alerts for high-risk customers</li>
                      <li>✓ Weekly summary reports</li>
                    </ul>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    className="w-full"
                  >
                    Start 7-Day Free Trial
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    No credit card required for trial. Cancel anytime.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How to get API Token */}
          <Card>
            <CardHeader>
              <CardTitle>How to get your Zendesk API Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log in to your Zendesk account</li>
                <li>Go to Admin Center (gear icon)</li>
                <li>Navigate to Apps and integrations → APIs → Zendesk API</li>
                <li>Click on "Settings" tab</li>
                <li>Enable "Token Access"</li>
                <li>Click "Add API Token"</li>
                <li>Give it a description (e.g., "Support Intelligence")</li>
                <li>Copy the token and paste it above</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Security:</strong> Your API token is encrypted and stored securely. We only use it to fetch your tickets.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
