import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Documentation - Support Intelligence",
  description: "Learn how to use Support Intelligence AI-powered ticket analysis",
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Documentation
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <a
                href="#getting-started"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Getting Started
              </a>
              <a
                href="#quick-start"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Quick Start Guide
              </a>
              <a
                href="#features"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Features Overview
              </a>
              <a
                href="#api"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                API Reference
              </a>
              <a
                href="#integrations"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Integrations
              </a>
              <a
                href="#billing"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Billing & Plans
              </a>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-12">
            <section id="getting-started">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Getting Started
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to Support Intelligence! This documentation will help you
                understand how to use our AI-powered ticket analysis platform to
                predict churn and improve customer retention.
              </p>
            </section>

            <section id="quick-start">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Start Guide
              </h2>
              <ol className="space-y-4 text-gray-600 list-decimal list-inside">
                <li>Sign up for a free trial account</li>
                <li>Connect your Zendesk account or upload CSV tickets</li>
                <li>Wait for AI analysis to complete (usually a few minutes)</li>
                <li>View your dashboard for insights and churn predictions</li>
                <li>Set up email alerts for high-risk customers</li>
              </ol>
            </section>

            <section id="features">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Features Overview
              </h2>
              <ul className="space-y-2 text-gray-600">
                <li>🎯 AI-powered sentiment analysis</li>
                <li> Real-time churn risk scoring (0-10)</li>
                <li> Frustration level detection</li>
                <li> Automatic ticket categorization</li>
                <li> Evidence-based insights</li>
                <li> Email alerts for high-risk tickets</li>
              </ul>
            </section>

            <section id="api">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                API Reference
              </h2>
              <p className="text-gray-600 mb-4">
                See our{" "}
                <Link href="/api-reference" className="text-blue-600 hover:underline">
                  API Reference page
                </Link>{" "}
                for detailed endpoint documentation.
              </p>
            </section>

            <section id="integrations">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Integrations
              </h2>
              <p className="text-gray-600 mb-4">
                We currently support the following integrations:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li> Zendesk</li>
                <li>📁 CSV File Upload</li>
                <li> Email Alerts (via Resend)</li>
              </ul>
              <p className="text-gray-600 mt-4">
                See our{" "}
                <Link href="/integration-guide" className="text-blue-600 hover:underline">
                  Integration Guide
                </Link>{" "}
                for setup instructions.
              </p>
            </section>

            <section id="billing">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Billing & Plans
              </h2>
              <p className="text-gray-600 mb-4">
                We offer a simple, transparent pricing model:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>🆓 7-day free trial</li>
                <li>💰 $249/month for up to 2,000 tickets</li>
                <li> Volume discounts available for larger organizations</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
