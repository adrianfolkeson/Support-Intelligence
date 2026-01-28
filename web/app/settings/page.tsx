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
  const [isClient, setIsClient] = useState(false);

  // Prevent SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadSettings = async () => {
    if (!orgId || !isClient) return;
    
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/organizations/${orgId}/settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.zendesk_subdomain) {
          setZendeskSubdomain(data.settings.zendesk_subdomain);
          setZendeskEmail(data.settings.zendesk_email || "");
          setHasCredentials(true);
        }
      }
    } catch (err) {
      // Silently fail during build
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
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/organizations/${orgId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zendesk_subdomain: zendeskSubdomain,
          zendesk_email: zendeskEmail,
          zendesk_api_token: zendeskApiToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage("Settings saved successfully!");
      setHasCredentials(true);
      setZendeskApiToken("");
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
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/organizations/${orgId}/sync-zendesk`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();
      setMessage(`Successfully synced ${result.ticketsSynced} tickets!`);
    } catch (err: any) {
      setError(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zendesk Subdomain
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">https://</span>
                    <input
                      type="text"
                      value={zendeskSubdomain}
                      onChange={(e) => setZendeskSubdomain(e.target.value)}
                      placeholder="yourcompany"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    <span className="text-gray-500">.zendesk.com</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zendesk Email
                  </label>
                  <input
                    type="email"
                    value={zendeskEmail}
                    onChange={(e) => setZendeskEmail(e.target.value)}
                    placeholder="admin@yourcompany.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Token
                  </label>
                  <input
                    type="password"
                    value={zendeskApiToken}
                    onChange={(e) => setZendeskApiToken(e.target.value)}
                    placeholder="Enter your Zendesk API token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required={!hasCredentials}
                  />
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
                  <Button onClick={handleSyncNow} disabled={syncing} variant="outline" className="w-full">
                    {syncing ? "Syncing..." : "Sync Tickets Now"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to get your Zendesk API Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log in to your Zendesk account</li>
                <li>Go to Admin Center (gear icon)</li>
                <li>Navigate to Apps and integrations → APIs → Zendesk API</li>
                <li>Enable "Token Access"</li>
                <li>Click "Add API Token"</li>
                <li>Copy the token and paste it above</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
