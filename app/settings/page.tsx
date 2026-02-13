"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Link, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { fetchAPI } from "@/lib/api";
import { ToastProvider, useToast } from "@/components/ui/toast";

function SettingsContent() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { showToast } = useToast();

  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);

  const [settings, setSettings] = useState({
    zendeskSubdomain: "",
    zendeskEmail: "",
    zendeskApiToken: "",
  });

  const [connectionStatus, setConnectionStatus] = useState<"connected" | "not_connected" | "unknown">("unknown");

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
    fetchSettings(orgIdFromCookie);
  }, [router]);

  const fetchSettings = async (id: string) => {
    try {
      const token = await getToken();
      const data = await fetchAPI(`/api/organizations/${id}/settings`, {}, token);

      setSettings({
        zendeskSubdomain: data.zendeskSubdomain || "",
        zendeskEmail: data.zendeskEmail || "",
        zendeskApiToken: data.zendeskApiToken || "",
      });

      setConnectionStatus(
        data.zendeskConnected ? "connected" : "not_connected"
      );
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const token = await getToken();
      await fetchAPI(
        `/api/organizations/${orgId}/settings`,
        {
          method: "POST",
          body: JSON.stringify(settings),
        },
        token
      );
      showToast("Settings saved successfully", "success");
      // Refetch to get connection status
      fetchSettings(orgId);
    } catch (error: any) {
      showToast(error.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!orgId) return;
    setTesting(true);
    try {
      const token = await getToken();
      const data = await fetchAPI(
        `/api/organizations/${orgId}/test-zendesk`,
        { method: "POST" },
        token
      );
      if (data.success) {
        showToast("Connection successful!", "success");
        setConnectionStatus("connected");
      } else {
        showToast("Connection failed. Please check your credentials.", "error");
        setConnectionStatus("not_connected");
      }
    } catch (error: any) {
      showToast(error.message || "Connection test failed", "error");
      setConnectionStatus("not_connected");
    } finally {
      setTesting(false);
    }
  };

  const handleSync = async () => {
    if (!orgId) return;
    setSyncing(true);
    try {
      const token = await getToken();
      await fetchAPI(
        `/api/organizations/${orgId}/sync-zendesk`,
        { method: "POST" },
        token
      );
      showToast("Sync started successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
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
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your integrations and preferences
          </p>
        </div>

        {/* Zendesk Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Zendesk Integration
              </CardTitle>
              <Badge
                variant={connectionStatus === "connected" ? "success" : "warning"}
              >
                {connectionStatus === "connected" ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subdomain
              </label>
              <p className="text-xs text-gray-500 mb-2">
                The part before .zendesk.com in your URL
              </p>
              <Input
                placeholder="yourcompany"
                value={settings.zendeskSubdomain}
                onChange={(e) =>
                  setSettings({ ...settings, zendeskSubdomain: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Your Zendesk admin email
              </p>
              <Input
                type="email"
                placeholder="admin@yourcompany.com"
                value={settings.zendeskEmail}
                onChange={(e) =>
                  setSettings({ ...settings, zendeskEmail: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                API Token
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Generate in Zendesk: Admin &gt; Channels &gt; API
              </p>
              <Input
                type="password"
                placeholder="Your API token"
                value={settings.zendeskApiToken}
                onChange={(e) =>
                  setSettings({ ...settings, zendeskApiToken: e.target.value })
                }
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={testing || !settings.zendeskSubdomain}
              >
                {testing ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              {connectionStatus === "connected" && (
                <Button
                  variant="secondary"
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* How to get API token */}
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                How to get your Zendesk API token:
              </p>
              <ol className="mt-2 text-sm text-blue-800 list-decimal list-inside space-y-1">
                <li>Log in to Zendesk as an administrator</li>
                <li>Go to Admin &gt; Channels &gt; API</li>
                <li>Click &quot;Add new token&quot;</li>
                <li>Give it a name and copy the token</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push("/settings/billing")}
          >
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900">Billing</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage your subscription and payment methods
              </p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => router.push("/settings/account")}
          >
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900">Account</h3>
              <p className="mt-1 text-sm text-gray-600">
                Update your profile and account settings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsContent />
    </ToastProvider>
  );
}
