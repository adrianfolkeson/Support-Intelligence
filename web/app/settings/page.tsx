"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// Force dynamic rendering - prevent prerendering at build time
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [zendeskSubdomain, setZendeskSubdomain] = useState("");
  const [zendeskEmail, setZendeskEmail] = useState("");
  const [zendeskApiToken, setZendeskApiToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState("71474f1d-e3c0-4b70-8874-d26cb5047cb7");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const org = params.get("org") || "71474f1d-e3c0-4b70-8874-d26cb5047cb7";
      setOrgId(org);

      // Load from localStorage for now
      const savedSubdomain = localStorage.getItem("zendesk_subdomain");
      const savedEmail = localStorage.getItem("zendesk_email");
      const savedToken = localStorage.getItem("zendesk_api_token");

      if (savedSubdomain) setZendeskSubdomain(savedSubdomain);
      if (savedEmail) setZendeskEmail(savedEmail);
      if (savedToken) setZendeskApiToken(savedToken);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://support-intelligence-backend.vercel.app';

      // Save to backend
      const response = await fetch(`${backendUrl}/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zendesk_subdomain: zendeskSubdomain,
          zendesk_email: zendeskEmail,
          zendesk_api_token: zendeskApiToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      // Also save to localStorage as backup
      localStorage.setItem("zendesk_subdomain", zendeskSubdomain);
      localStorage.setItem("zendesk_email", zendeskEmail);
      localStorage.setItem("zendesk_api_token", zendeskApiToken);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#111827" }}>
              Support Intelligence
            </Link>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link
                href={`/dashboard-connected?org=${orgId}`}
                style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem", textDecoration: "none", color: "#374151" }}
              >
                Dashboard
              </Link>
              <Link
                href={`/upload?org=${orgId}`}
                style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem", textDecoration: "none", color: "#374151" }}
              >
                Upload CSV
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Settings</h1>
          <p style={{ color: "#6b7280" }}>Configure your integration settings</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div style={{ backgroundColor: "#d1fae5", border: "1px solid #34d399", borderRadius: "0.375rem", padding: "0.75rem", marginBottom: "1rem" }}>
            <p style={{ color: "#065f46", fontSize: "0.875rem" }}>Settings saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.375rem", padding: "0.75rem", marginBottom: "1rem" }}>
            <p style={{ color: "#991b1b", fontSize: "0.875rem" }}>{error}</p>
          </div>
        )}

        {/* Zendesk Settings */}
        <div style={{ backgroundColor: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>Zendesk Integration</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Connect your Zendesk account to automatically analyze support tickets
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Subdomain */}
            <div>
              <label htmlFor="subdomain" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                Zendesk Subdomain
              </label>
              <input
                id="subdomain"
                type="text"
                value={zendeskSubdomain}
                onChange={(e) => setZendeskSubdomain(e.target.value)}
                placeholder="yourcompany"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                The part before .zendesk.com in your URL
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                Zendesk Email
              </label>
              <input
                id="email"
                type="email"
                value={zendeskEmail}
                onChange={(e) => setZendeskEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Your Zendesk account email
              </p>
            </div>

            {/* API Token */}
            <div>
              <label htmlFor="apiToken" style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", color: "#374151", marginBottom: "0.25rem" }}>
                API Token
              </label>
              <input
                id="apiToken"
                type="password"
                value={zendeskApiToken}
                onChange={(e) => setZendeskApiToken(e.target.value)}
                placeholder="Your API token from Zendesk Admin"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem"
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Generate in Zendesk Admin → Channels → API
              </p>
            </div>

            {/* Save Button */}
            <div style={{ marginTop: "1rem" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: saving ? "#9ca3af" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #3b82f6", borderRadius: "0.5rem", padding: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#1e40af", marginBottom: "0.5rem" }}>
            How to generate your Zendesk API token:
          </h3>
          <ol style={{ paddingLeft: "1.5rem", color: "#1e3a8a", fontSize: "0.875rem" }}>
            <li style={{ marginBottom: "0.25rem" }}>Log in to your Zendesk account as an admin</li>
            <li style={{ marginBottom: "0.25rem" }}>Go to Admin Center → Channels → API</li>
            <li style={{ marginBottom: "0.25rem" }}>Click "Add API token"</li>
            <li style={{ marginBottom: "0.25rem" }}>Give it a description (e.g., "Support Intelligence")</li>
            <li style={{ marginBottom: "0.25rem" }}>Set scope to "Tickets: Read" and "Users: Read"</li>
            <li>Copy and paste the token above</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
