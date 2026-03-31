import { Shield, Eye, Database, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-4 text-gray-600">Last updated: February 2026</p>
        </div>

        <div className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Data We Collect</h2>
            <p className="mt-4 text-gray-600">
              We collect customer support ticket data including customer emails, ticket subjects,
              message content, and associated metadata. This data is provided to us through
              Zendesk integration or manual CSV upload.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Data</h2>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li className="flex items-start">
                <Eye className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Analyze support tickets for sentiment and churn risk indicators
              </li>
              <li className="flex items-start">
                <Eye className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Generate risk scores and actionable insights
              </li>
              <li className="flex items-start">
                <Eye className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Provide weekly reports and real-time alerts
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Third-Party Services</h2>
            <p className="mt-4 text-gray-600">
              We use the following third-party services to provide our service:
            </p>
            <div className="mt-4 space-y-3">
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium text-gray-900">Clerk</p>
                  <p className="text-sm text-gray-600">Authentication and user management</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium text-gray-900">Stripe</p>
                  <p className="text-sm text-gray-600">Payment processing</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="font-medium text-gray-900">Anthropic</p>
                  <p className="text-sm text-gray-600">AI analysis models</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Data Retention</h2>
            <p className="mt-4 text-gray-600">
              Your data is retained for the duration of your subscription and for 30 days after
              account termination. Upon request, we can delete your data immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
            <p className="mt-4 text-gray-600">You have the right to:</p>
            <ul className="mt-2 space-y-2 text-gray-600">
              <li className="flex items-start">
                <Database className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Access a copy of your data
              </li>
              <li className="flex items-start">
                <Database className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Request correction of inaccurate data
              </li>
              <li className="flex items-start">
                <Trash2 className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Request deletion of your data
              </li>
              <li className="flex items-start">
                <Database className="mr-3 h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                Export your data
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Contact</h2>
            <p className="mt-4 text-gray-600">
              For privacy-related questions or requests, please contact us at:
              <a href="mailto:info@auroraecom.se" className="ml-1 text-blue-600 hover:underline">
                info@auroraecom.se
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
