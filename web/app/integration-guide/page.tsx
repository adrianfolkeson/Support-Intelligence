import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Integration Guide - Support Intelligence",
  description: "Step-by-step guide to integrate Support Intelligence with your systems",
};

export default function IntegrationGuidePage() {
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
          Integration Guide
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="space-y-2">
              <a
                href="#zendesk"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Zendesk
              </a>
              <a
                href="#csv"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                CSV Upload
              </a>
              <a
                href="#api"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                REST API
              </a>
              <a
                href="#webhooks"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                Webhooks
              </a>
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-2 space-y-12">
            <section id="zendesk">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Zendesk Integration
              </h2>
              <p className="text-gray-600 mb-4">
                Connect your Zendesk account to automatically sync support tickets
                and analyze them with AI.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Zendesk admin access</li>
                  <li>Support Intelligence account</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Setup Steps
              </h3>
              <ol className="space-y-3 text-gray-600 list-decimal list-inside">
                <li>Go to Settings &gt; Integrations in your dashboard</li>
                <li>Click &quot;Connect Zendesk&quot;</li>
                <li>Enter your Zendesk subdomain (e.g., yourcompany)</li>
                <li>Generate an API token in Zendesk Admin &gt; Channels &gt; API</li>
                <li>Enter your email and API token</li>
                <li>Click &quot;Test Connection&quot; then &quot;Save&quot;</li>
              </ol>
            </section>

            <section id="csv">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                CSV Upload
              </h2>
              <p className="text-gray-600 mb-4">
                Upload a CSV file with your support tickets for immediate analysis.
                Great for one-time analysis or trying out the platform.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                CSV Format
              </h3>
              <p className="text-gray-600 mb-4">
                Your CSV should include the following columns:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>customer_id,subject,message,created_at
john@example.com,Login issue,Can't login to my account,2024-01-15T10:30:00Z
jane@example.com,Billing question,How do I upgrade my plan?,2024-01-15T11:00:00Z</pre>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Upload Steps
              </h3>
              <ol className="space-y-3 text-gray-600 list-decimal list-inside">
                <li>Go to Upload page or Settings &gt; Data Import</li>
                <li>Drag and drop your CSV file or click to browse</li>
                <li>Map CSV columns to our fields if needed</li>
                <li>Click "Upload & Analyze"</li>
                <li>Wait for analysis to complete</li>
              </ol>
            </section>

            <section id="api">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                REST API
              </h2>
              <p className="text-gray-600 mb-4">
                Use our REST API to integrate Support Intelligence with your own
                applications and workflows.
              </p>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                <pre>{`# Example API request
curl -X GET https://api.support-intelligence.ai/v1/organizations/:id/tickets \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
              </div>

              <p className="text-gray-600">
                See our{" "}
                <Link href="/api-reference" className="text-blue-600 hover:underline">
                  API Reference
                </Link>{" "}
                for complete documentation.
              </p>
            </section>

            <section id="webhooks">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Webhooks
              </h2>
              <p className="text-gray-600 mb-4">
                Receive real-time notifications when important events occur, such
                as high churn risk detection.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supported Events
              </h3>
              <ul className="space-y-2 text-gray-600 mb-4">
                <li>🚨 high_churn_risk - Churn risk ≥8 detected</li>
                <li> analysis_complete - Ticket analysis finished</li>
                <li> weekly_report_ready - New report generated</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Webhook Payload Example
              </h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre>{`{
  "event": "high_churn_risk",
  "timestamp": "2024-01-15T12:00:00Z",
  "data": {
    "ticket_id": "ticket_123",
    "churn_risk": 9,
    "customer_id": "customer@example.com"
  }
}`}</pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
