"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organizationName.trim()) {
      setError("Please enter your organization name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create organization
      const createOrgResponse = await fetch("http://localhost:3001/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: organizationName,
        }),
      });

      if (!createOrgResponse.ok) {
        throw new Error("Failed to create organization");
      }

      const orgData = await createOrgResponse.json();
      const orgId = orgData.organization.id;

      // Set trial end date (7 days from now)
      await fetch(`http://localhost:3001/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: "trial",
        }),
      });

      // Create Stripe checkout session
      const checkoutResponse = await fetch(
        `http://localhost:3001/api/organizations/${orgId}/create-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!checkoutResponse.ok) {
        throw new Error("Failed to create checkout session");
      }

      const checkoutData = await checkoutResponse.json();

      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkoutUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
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
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Start Your 7-Day Free Trial</CardTitle>
            <CardDescription>
              No credit card required. Cancel anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Acme Corp"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Enter your payment details (Stripe)</li>
                  <li>7-day free trial starts immediately</li>
                  <li>Connect your Zendesk account</li>
                  <li>AI automatically analyzes your tickets</li>
                  <li>Get email alerts for at-risk customers</li>
                </ol>
                <p className="text-xs text-blue-700 mt-3">
                  Your card won't be charged until after the trial ends. Cancel anytime in settings.
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Setting up..." : "Continue to Payment →"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
