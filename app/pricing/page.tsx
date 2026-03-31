"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

// Check if Clerk is configured
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    // If Clerk is configured and user might need auth
    if (isClerkConfigured) {
      router.push("/sign-in?redirectUrl=/pricing");
      return;
    }

    // Clerk not configured - show message or proceed
    alert("Authentication is not configured. Please add Clerk environment variables to enable checkout.");
  };

  const features = [
    "Up to 2,000 tickets/month",
    "AI churn risk analysis",
    "Zendesk integration",
    "Weekly insight reports",
    "Email alerts for high-risk",
    "Priority support",
  ];

  return (
    <div className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Start your 30-day free trial today.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mt-16 flex justify-center">
          <Card className="w-full max-w-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Professional</h2>
                <div className="mt-6 flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">$149</span>
                  <span className="ml-2 text-xl text-gray-500">/month</span>
                </div>
                <p className="mt-2">
                  <span className="text-lg text-gray-400 line-through">$249</span>
                  <span className="ml-2 text-sm text-green-600 font-medium">Launch pricing</span>
                </p>
              </div>

              <ul className="mt-8 space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="mt-8 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Start 30-Day Free Trial"
                )}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "What happens after the trial?",
                a: "After 30 days, you'll be charged $149/month. You can cancel anytime before the trial ends with no charge.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
