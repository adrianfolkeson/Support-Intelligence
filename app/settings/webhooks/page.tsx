"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, TestTube, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export default function WebhooksSettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ webhookId: string; success: boolean } | null>(null);

  const availableEvents = [
    { id: "high_risk", label: "High Risk Customer", description: "When a customer's churn risk reaches 7+" },
    { id: "new_analysis", label: "New Ticket Analysis", description: "When a ticket is analyzed" },
    { id: "weekly_report", label: "Weekly Report", description: "When weekly report is generated" },
    { id: "customer_churned", label: "Customer Churned", description: "When a customer cancels" },
  ];

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
    fetchWebhooks(orgIdFromCookie);
  }, [router]);

  const fetchWebhooks = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/webhooks?orgId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    if (!orgId || !newWebhookUrl || selectedEvents.length === 0) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgId,
          url: newWebhookUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        await fetchWebhooks(orgId);
        setNewWebhookUrl("");
        setSelectedEvents([]);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!orgId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      await fetch(`/api/webhooks?orgId=${orgId}&webhookId=${webhookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchWebhooks(orgId);
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const handleTestWebhook = async (webhookId: string, url: string) => {
    setTesting(webhookId);
    setTestResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });

      const success = response.ok;
      setTestResult({ webhookId, success });
    } catch (error) {
      setTestResult({ webhookId, success: false });
    } finally {
      setTesting(null);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId) ? prev.filter(e => e !== eventId) : [...prev, eventId]
    );
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
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
            <p className="mt-2 text-gray-600">
              Configure webhooks to receive real-time notifications about events
            </p>
          </div>

          {/* Add Webhook Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Webhook</CardTitle>
                <CardDescription>
                  Enter your webhook URL and select the events you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook URL
                  </label>
                  <Input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://your-app.com/webhooks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Events
                  </label>
                  <div className="space-y-2">
                    {availableEvents.map(event => (
                      <label
                        key={event.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event.id)}
                          onChange={() => toggleEvent(event.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{event.label}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddWebhook}
                    disabled={!newWebhookUrl || selectedEvents.length === 0}
                  >
                    Add Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Webhooks List */}
          <div className="space-y-4">
            {webhooks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500 mb-4">No webhooks configured yet</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Webhook
                  </Button>
                </CardContent>
              </Card>
            ) : (
              webhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{webhook.url}</h3>
                          {webhook.active && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {webhook.events.map(event => {
                            const eventInfo = availableEvents.find(e => e.id === event);
                            return (
                              <span
                                key={event}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {eventInfo?.label || event}
                              </span>
                            );
                          })}
                        </div>

                        <div className="space-y-1 text-xs text-gray-500">
                          <p>Created: {new Date(webhook.createdAt).toLocaleString()}</p>
                          <p>Secret: <code className="bg-gray-100 px-1 py-0.5 rounded">{webhook.secret}</code></p>
                        </div>

                        {testResult?.webhookId === webhook.id && (
                          <div className={`mt-3 flex items-center gap-2 text-sm ${
                            testResult.success ? "text-green-600" : "text-red-600"
                          }`}>
                            {testResult.success ? (
                              <>
                                <CheckCircle2 className="h-4 w-4" />
                                Test successful!
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4" />
                                Test failed
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook.id, webhook.url)}
                          disabled={testing === webhook.id}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {!showAddForm && webhooks.length > 0 && (
            <div className="mt-6">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Another Webhook
              </Button>
            </div>
          )}

          {/* Documentation */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Webhook Payload</CardTitle>
              <CardDescription>Example webhook payload structure</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "event": "high_risk",
  "timestamp": "2025-03-27T10:30:00Z",
  "data": {
    "ticketId": "T12345",
    "customerEmail": "customer@example.com",
    "churnRisk": 8,
    "sentiment": "negative",
    "reason": "Multiple unresolved issues"
  }
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
