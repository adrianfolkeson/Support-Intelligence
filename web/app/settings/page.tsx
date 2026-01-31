"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Force dynamic rendering - prevent prerendering at build time
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const [zendeskSubdomain, setZendeskSubdomain] = useState("");
  const [zendeskEmail, setZendeskEmail] = useState("");
  const [zendeskApiToken, setZendeskApiToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const org = params.get("org") || "";
      
      // Load saved settings from localStorage
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
      // Save to localStorage
      localStorage.setItem("zendesk_subdomain", zendeskSubdomain);
      localStorage.setItem("zendesk_email", zendeskEmail);
      localStorage.setItem("zendesk_api_token", zendeskApiToken);

      // TODO: Send to backend API
      // await fetch("/api/settings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ zendeskSubdomain, zendeskEmail, zendeskApiToken }),
      // });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save settings");
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
              <Link href="/dashboard-connected?org=71474f1d-e3c0-4b70-8874-d26cb5047cb7" style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                Dashboard
              </Link>
              <Link href="/upload" style={{ padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "0.375rem", fontSize: "0.875rem" }}>
                Upload CSV
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Settings</h1>
          <p style={{ color: "#6b7280" }}>Configure your integration settings</p>
        </div>

        {/* Zendesk Settings */}
        <div style={{ backgroundColor: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.5rem" }}>Zendesk Integration</h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Connect your Zendesk account to automatically analyze support tickets
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Subdomain
              </label>
              <input
                type="text"
                value={zendeskSubdomain}
                onChange={(e) => setZendeskSubdomain(e.target.value)}
                placeholder="yourcompany"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Your Zendesk subdomain (e.g., "yourcompany" from yourcompany.zendesk.com)
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                Email
              </label>
              <input
                type="email"
                value={zendeskEmail}
                onChange={(e) => setZendeskEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Your Zendesk admin email address
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>
                API Token
              </label>
              <input
                type="password"
                value={zendeskApiToken}
                onChange={(e) => setZendeskApiToken(e.target.value)}
                placeholder="your_api_token"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                }}
              />
              <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                Generate an API token in Zendesk Admin &gt; Channels &gt; API
              </p>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {saved && (
                <span style={{ marginLeft: "0.5rem", color: "#22c55e", fontSize: "0.875rem" }}>
                  ✓ Saved successfully
                </span>
              )}
              {error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div style={{ backgroundColor: "white", borderRadius: "0.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Need Help?</h3>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Check our documentation for detailed setup instructions
          </p>
          <Link
            href="/integration-guide"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#f3f4f6",
              color: "#374151",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            View Integration Guide
          </Link>
        </div>
      </main>
    </div>
  );
}
