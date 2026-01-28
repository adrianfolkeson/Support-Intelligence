import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "API Reference - Support Intelligence",
  description: "API Reference for Support Intelligence",
};

export default function ApiReferencePage() {
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
          API Reference
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Base URL
          </h2>
          <code className="bg-gray-900 text-gray-100 px-4 py-2 rounded-lg block">
            https://api.support-intelligence.ai/v1
          </code>
        </div>

        <div className="space-y-8">
          {/* Organizations */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Organizations
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations
                </h3>
                <p className="text-gray-600 mb-4">
                  List all organizations for the authenticated user.
                </p>
                <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`{
  "organizations": [
    {
      "id": "org_123",
      "name": "Acme Inc",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations/:id
                </h3>
                <p className="text-gray-600 mb-4">
                  Get organization details including subscription status.
                </p>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tickets
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations/:id/tickets
                </h3>
                <p className="text-gray-600 mb-4">
                  List all tickets for an organization with optional filtering.
                </p>
                <h4 className="font-medium text-gray-900 mb-2">Query Parameters:</h4>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>limit - Number of tickets to return (default: 50)</li>
                  <li>offset - Pagination offset (default: 0)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations/:id/churn-risk
                </h3>
                <p className="text-gray-600 mb-4">
                  Get tickets with high churn risk scores.
                </p>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Analysis
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  POST /organizations/:id/analyze
                </h3>
                <p className="text-gray-600 mb-4">
                  Trigger AI analysis for unanalyzed tickets.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations/:id/dashboard
                </h3>
                <p className="text-gray-600 mb-4">
                  Get dashboard analytics including ticket counts, churn metrics, and recent tickets.
                </p>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Reports
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GET /organizations/:id/reports
                </h3>
                <p className="text-gray-600 mb-4">
                  List weekly reports for an organization.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  POST /organizations/:id/generate-report
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate a new weekly report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
