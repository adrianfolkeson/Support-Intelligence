import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";

export default function IntegrationGuidePage() {
  const steps = [
    {
      number: 1,
      title: "Log in to Zendesk",
      description: "Navigate to admin.zendesk.com and sign in with your administrator account.",
    },
    {
      number: 2,
      title: "Access API Settings",
      description: "Go to Admin > Channels > API in the left sidebar.",
    },
    {
      number: 3,
      title: "Create API Token",
      description: "Click the 'Add new token' button. Give it a name like 'Support Intelligence' and click 'Create'.",
    },
    {
      number: 4,
      title: "Copy Your Token",
      description: "Important: Copy the token immediately as it won't be shown again after you close the modal.",
    },
    {
      number: 5,
      title: "Find Your Subdomain",
      description: "Your subdomain is the first part of your Zendesk URL (e.g., 'yourcompany' in 'yourcompany.zendesk.com').",
    },
    {
      number: 6,
      title: "Connect in Support Intelligence",
      description: "Go to Settings in Support Intelligence, enter your subdomain, email, and API token, then click 'Save'.",
    },
  ];

  const troubleshooting = [
    {
      issue: "Authentication Failed",
      solution: "Double-check that you copied the API token correctly. Make sure you're using the same email that has access to Zendesk.",
    },
    {
      issue: "No Tickets Imported",
      solution: "Ensure your Zendesk account has tickets and that your API token has the necessary permissions (read access to tickets).",
    },
    {
      issue: "Sync Takes Too Long",
      solution: "Large ticket volumes may take time to process. You can safely close the page - sync will continue in the background.",
    },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900">Zendesk Integration Guide</h1>
        <p className="mt-4 text-lg text-gray-600">
          Follow these steps to connect your Zendesk account to Support Intelligence.
        </p>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Instructions</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <Card key={step.number}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-gray-600">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Connection</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                After saving your settings, click the &quot;Test Connection&quot; button to verify everything is working.
                You should see a success message if the connection is valid.
              </p>
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">Connection verified successfully</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">First Sync</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600 mb-4">
                Once connected, click &quot;Sync Now&quot; to import your existing tickets. The initial sync may take
                several minutes depending on your ticket volume.
              </p>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> After the initial sync, new tickets will be automatically imported
                  every hour. You can also trigger manual syncs at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            {troubleshooting.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    {item.issue}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.solution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600">
                If you&apos;re having trouble with the integration, please contact us at{" "}
                <a href="mailto:info@auroraecom.se" className="text-blue-600 hover:underline">
                  info@auroraecom.se
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
