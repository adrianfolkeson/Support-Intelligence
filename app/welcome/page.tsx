"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Link as LinkIcon, Upload, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();
  const sessionId = searchParams.get("session_id");
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      router.push("/pricing");
      return;
    }

    // Verify session and get organization ID
    getToken().then((token) => {
      fetchAPI(`/api/stripe/session/${sessionId}/organization`, {}, token)
        .then((data) => {
          if (data.success && data.organizationId) {
            setOrgId(data.organizationId);
            // Store orgId in cookie for future use
            document.cookie = `orgId=${data.organizationId}; path=/; max-age=2592000; SameSite=Lax`;
          } else {
            setError("Failed to verify checkout session");
          }
        })
        .catch((err: Error) => {
          console.error("Failed to verify session:", err);
          if (err.message.includes("Payment not completed")) {
            setError("Payment not completed. Please complete your payment to continue.");
          } else if (err.message.includes("Invalid session")) {
            setError("Invalid checkout session. Please try again.");
          } else {
            setError("Failed to verify checkout. Please contact support.");
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [sessionId, router, getToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your checkout session...</p>
        </div>
      </div>
    );
  }

  if (error || !orgId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Checkout Verification Failed</h1>
          <p className="mt-4 text-gray-600">{error || "Could not verify your checkout session"}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/pricing">
              <Button variant="outline">Back to Pricing</Button>
            </Link>
            <Link href="/support">
              <Button>Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      icon: LinkIcon,
      title: "Connect Zendesk",
      description: "Integrate with your Zendesk account to automatically import tickets",
    },
    {
      icon: Upload,
      title: "Upload CSV",
      description: "Alternatively, upload a CSV file of your support tickets",
    },
    {
      icon: BarChart3,
      title: "Get Insights",
      description: "View churn predictions and receive weekly reports",
    },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Success Message */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900">
            Welcome to Support Intelligence!
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Your 30-day free trial is now active.
          </p>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Get Started in 3 Steps
          </h2>
          <div className="mt-8 grid gap-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
