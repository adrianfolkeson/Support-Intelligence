"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiReferencePage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900">API Reference</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete API documentation for integrating with Support Intelligence.
        </p>

        <div className="mt-12 space-y-8">
          {/* Authentication */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  All API requests require authentication using your Clerk JWT token. Include the token
                  in the Authorization header:
                </p>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>Authorization: Bearer YOUR_CLERK_TOKEN</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Base URL */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Base URL</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>https://support-intelligence-backend.vercel.app</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Endpoints */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Endpoints</h2>

            {/* Get Dashboard */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">GET</span>
                  <CardTitle className="text-lg">/api/organizations/{'{orgId}'}/dashboard</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get dashboard statistics including ticket counts and risk summaries.</p>
                <p className="text-sm font-medium text-gray-900">Response:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>{`{
  "totalTickets": 1250,
  "analyzedTickets": 1180,
  "highRiskCount": 42,
  "averageRiskScore": 4.2
}`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Get Tickets */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">GET</span>
                  <CardTitle className="text-lg">/api/organizations/{'{orgId}'}/tickets</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get all tickets with optional pagination.</p>
                <p className="text-sm font-medium text-gray-900">Query Parameters:</p>
                <ul className="mt-2 text-sm text-gray-600">
                  <li>• <code className="bg-gray-100 px-1 rounded">limit</code> - Number of results (default: 20)</li>
                  <li>• <code className="bg-gray-100 px-1 rounded">offset</code> - Pagination offset</li>
                </ul>
              </CardContent>
            </Card>

            {/* Get Ticket */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">GET</span>
                  <CardTitle className="text-lg">/api/tickets/{'{ticketId}'}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Get detailed information about a specific ticket including AI analysis.</p>
                <p className="text-sm font-medium text-gray-900">Response:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>{`{
  "id": "ticket_123",
  "customerEmail": "customer@example.com",
  "subject": "Login issue",
  "message": "Full message text...",
  "sentiment": "negative",
  "frustrationLevel": 7,
  "churnRisk": 8,
  "keyIssues": ["repeated problem", "delayed response"],
  "recommendedAction": "Priority follow-up required",
  "createdAt": "2026-02-01T10:00:00Z"
}`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Get Reports */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-700">GET</span>
                  <CardTitle className="text-lg">/api/organizations/{'{orgId}'}/reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get all weekly reports for the organization.</p>
              </CardContent>
            </Card>

            {/* Sync Zendesk */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">POST</span>
                  <CardTitle className="text-lg">/api/organizations/{'{orgId}'}/sync-zendesk</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Trigger a manual sync of tickets from Zendesk.</p>
              </CardContent>
            </Card>

            {/* Update Settings */}
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">POST</span>
                  <CardTitle className="text-lg">/api/organizations/{'{orgId}'}/settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Update organization settings including Zendesk configuration.</p>
                <p className="text-sm font-medium text-gray-900">Request Body:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>{`{
  "zendeskSubdomain": "yourcompany",
  "zendeskEmail": "support@yourcompany.com",
  "zendeskApiToken": "your_api_token"
}`}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Upload CSV */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-700">POST</span>
                  <CardTitle className="text-lg">/api/upload</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Upload a CSV file of support tickets.</p>
                <p className="text-sm font-medium text-gray-900">Request Body:</p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>{`{
  "organizationName": "Your Organization",
  "csvData": "customer_id,subject,message\\n..."
}`}</code>
                </pre>
              </CardContent>
            </Card>
          </section>

          {/* Rate Limits */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  API requests are limited to 100 requests per minute per organization.
                  Exceeding this limit will return a 429 status code.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
