"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupOrganization = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        // No session ID - might be direct access, redirect to pricing
        router.push('/pricing');
        return;
      }

      try {
        // Get organization from Stripe session
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://support-intelligence-backend.vercel.app';

        const response = await fetch(`${backendUrl}/api/stripe/session/${sessionId}/organization`);
        if (!response.ok) {
          throw new Error('Failed to get organization');
        }

        const data = await response.json();
        setOrganizationId(data.organization_id);
        setLoading(false);
      } catch (err) {
        console.error('Failed to get organization:', err);
        setError('Could not load your account. Please contact support.');
        setLoading(false);
      }
    };

    setupOrganization();
  }, [searchParams, router]);

  const handleGetStarted = () => {
    if (organizationId) {
      router.push(`/dashboard-connected?org=${organizationId}`);
    }
  };

  const handleConnectZendesk = () => {
    if (organizationId) {
      router.push(`/settings?org=${organizationId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/support"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact Support →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Welcome to Support Intelligence!</h1>
                <p className="text-green-700">Your subscription is now active. Let's get you set up.</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get started in 3 simple steps</h2>

            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect your Zendesk account</h3>
                  <p className="text-gray-600 mb-4">
                    Link your Zendesk account so we can analyze your support tickets and predict customer churn.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Go to your Zendesk Admin settings
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Generate an API token
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enter your subdomain and token below
                    </li>
                  </ul>
                  <button
                    onClick={handleConnectZendesk}
                    className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Connect Zendesk Now
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI analyzes your tickets</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI will automatically analyze all your support tickets, identify churn risk patterns, and score each customer.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>What we analyze:</strong> Sentiment, frustration levels, repeated issues, subscription cancellations, refund requests, and more.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-500">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Get insights & alerts</h3>
                  <p className="text-gray-600 mb-4">
                    View your dashboard with churn risk scores, weekly reports, and receive email alerts when customers are at risk.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Churn Risk Scores</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Weekly Reports</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-2"></div>
                      <p className="text-sm font-medium text-gray-900">Email Alerts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="mt-4 text-sm text-gray-600">
              Takes less than 5 minutes to set up
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
