"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Mail, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    reportFrequency: "weekly" as "daily" | "weekly" | "monthly",
    reportDay: "monday" as string,
    reportTime: "09:00",
    riskThreshold: 7,
    additionalEmails: [] as string[],
  });

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
      const response = await fetch(`/api/organizations/${id}/notification-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
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
      await fetch(`/api/organizations/${orgId}/notification-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    setSettings({
      ...settings,
      additionalEmails: [...settings.additionalEmails, ""],
    });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...settings.additionalEmails];
    newEmails[index] = value;
    setSettings({ ...settings, additionalEmails: newEmails });
  };

  const removeEmail = (index: number) => {
    setSettings({
      ...settings,
      additionalEmails: settings.additionalEmails.filter((_, i) => i !== index),
    });
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
            <p className="mt-2 text-gray-600">Customize when and how you receive reports</p>
          </div>

          {/* Report Schedule */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Report Schedule
              </CardTitle>
              <CardDescription>Choose when you receive executive summaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  value={settings.reportFrequency}
                  onChange={(e) => setSettings({ ...settings, reportFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Day
                </label>
                <select
                  value={settings.reportDay}
                  onChange={(e) => setSettings({ ...settings, reportDay: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={settings.reportFrequency === "daily"}
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Time
                </label>
                <Input
                  type="time"
                  value={settings.reportTime}
                  onChange={(e) => setSettings({ ...settings, reportTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>Set when you want to be notified about at-risk customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Churn Risk Threshold (1-10)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.riskThreshold}
                  onChange={(e) => setSettings({ ...settings, riskThreshold: Number(e.target.value) })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Get notified when a customer's churn risk reaches this level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Recipients */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Additional Email Recipients</CardTitle>
              <CardDescription>Send reports to other team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {settings.additionalEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="colleague@example.com"
                  />
                  <Button variant="ghost" onClick={() => removeEmail(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addEmail}>
                Add Email
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
