"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();

      if (!user || !session?.access_token) {
        router.push("/sign-in?redirectUrl=/pricing");
        return;
      }

      // Call checkout API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ organizationName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const features = [
    "30-day free trial",
    "No credit card required for trial",
    "Cancel anytime",
    "Up to 2,000 tickets/month",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            Start Your Free Trial
          </h1>
          <p className="mt-3 text-lg text-neutral-600">
            Just one more step to get started
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-8">
            <form onSubmit={handleStartCheckout} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Organization Name
                </label>
                <Input
                  id="orgName"
                  type="text"
                  placeholder="Acme Inc"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  helperText="This will be your organization's display name"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !organizationName.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Setting up your trial...
                  </span>
                ) : (
                  "Continue to Checkout"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              What's included:
            </h3>
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center text-neutral-700">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 mr-3">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
