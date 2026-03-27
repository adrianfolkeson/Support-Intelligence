"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, Link2, Zap, BarChart3, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";

type Step = "welcome" | "integration" | "test" | "analyze" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // Form state
  const [integrationType, setIntegrationType] = useState<"zendesk" | "intercom" | "helpscout" | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const steps: { id: Step; title: string; icon: any }[] = [
    { id: "welcome", title: "Welcome", icon: CheckCircle2 },
    { id: "integration", title: "Connect Integration", icon: Link2 },
    { id: "test", title: "Test Connection", icon: Zap },
    { id: "analyze", title: "Analyze Tickets", icon: BarChart3 },
    { id: "complete", title: "Complete", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleNext = async () => {
    if (currentStep === "welcome") {
      setCurrentStep("integration");
    } else if (currentStep === "integration") {
      await handleTestConnection();
    } else if (currentStep === "test" && testResult === "success") {
      await handleCreateOrg();
    } else if (currentStep === "analyze") {
      setCurrentStep("complete");
    } else if (currentStep === "complete") {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    const stepOrder: Step[] = ["welcome", "integration", "test", "analyze", "complete"];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const token = await getToken();

      // Test the connection
      const response = await fetch("/api/integrations/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: integrationType,
          apiKey,
          apiUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult("success");
        setTimeout(() => {
          setCurrentStep("test");
          setLoading(false);
        }, 1000);
      } else {
        setTestResult("error");
        setErrorMsg(data.error || "Connection failed");
        setLoading(false);
      }
    } catch (error: any) {
      setTestResult("error");
      setErrorMsg(error.message || "Connection failed");
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    setLoading(true);
    try {
      const token = await getToken();

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "My Organization",
          integrationType,
          apiKey,
          apiUrl,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrgId(data.id);

        // Store in cookie
        document.cookie = `orgId=${data.id}; path=/; max-age=31536000`;

        setCurrentStep("analyze");
        setLoading(false);

        // Trigger analysis
        setTimeout(async () => {
          try {
            await fetch(`/api/organizations/${data.id}/analyze`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            console.error("Analysis failed:", error);
          }
        }, 2000);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Failed to create organization");
        setLoading(false);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to create organization");
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    router.push("/demo");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isCompleted
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium ${
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 w-16 sm:w-24 ${
                          index < currentStepIndex ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Welcome Step */}
          {currentStep === "welcome" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome to Support-Intel</CardTitle>
                <CardDescription>
                  Let's get you set up with AI-powered churn prevention in just a few minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-3">What you'll accomplish:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Connect your support platform (Zendesk, Intercom, etc.)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Import and analyze your support tickets with AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>See which customers are at risk of churning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <span>Get your first churn risk report</span>
                    </li>
                  </ul>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={handleTryDemo}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Try Demo First
                  </button>
                </div>

                <p className="text-center text-sm text-gray-500">
                  Takes about 5 minutes • No credit card required
                </p>
              </CardContent>
            </Card>
          )}

          {/* Integration Step */}
          {currentStep === "integration" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Connect Your Support Platform</CardTitle>
                <CardDescription>
                  Choose your support platform and provide your API credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Integration
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { id: "zendesk", name: "Zendesk", icon: "🎫" },
                      { id: "intercom", name: "Intercom", icon: "💬" },
                      { id: "helpscout", name: "Help Scout", icon: "📧" },
                    ].map((integration) => (
                      <button
                        key={integration.id}
                        onClick={() => setIntegrationType(integration.id as any)}
                        className={`p-4 rounded-lg border-2 text-left transition-colors ${
                          integrationType === integration.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{integration.icon}</div>
                        <div className="font-medium text-gray-900">{integration.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {integrationType && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key / Token
                      </label>
                      <Input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Find this in your {integrationType} account settings
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API URL (optional)
                      </label>
                      <Input
                        type="url"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        placeholder="https://your-account.zendesk.com"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank to use default {integrationType} URL
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Need help?</strong>{" "}
                        <a href={`/integration-guide?type=${integrationType}`} className="underline hover:text-yellow-900">
                          View our setup guide for {integrationType}
                        </a>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack} disabled={loading}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!integrationType || !apiKey || loading}>
                    Test Connection
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Step */}
          {currentStep === "test" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Test Connection</CardTitle>
                <CardDescription>
                  We'll verify that your credentials work and we can access your tickets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {testResult === null && loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Testing connection...</p>
                  </div>
                )}

                {testResult === "success" && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-900">Connection Successful!</h3>
                      </div>
                      <p className="text-sm text-green-800">
                        We successfully connected to your {integrationType} account and can access your tickets.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Next step:</strong> We'll create your organization and import your tickets for analysis.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack} disabled={loading}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleNext} disabled={loading}>
                        Create Organization & Import Tickets
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {testResult === "error" && (
                  <div className="space-y-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-full bg-red-100 p-1">
                          <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                            <span className="text-white text-xs">✕</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-red-900">Connection Failed</h3>
                      </div>
                      <p className="text-sm text-red-800 mb-3">{errorMsg}</p>
                      <p className="text-xs text-red-700">
                        Please check your API key and URL, then try again.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack} disabled={loading}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button onClick={handleTestConnection} disabled={loading}>
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analyze Step */}
          {currentStep === "analyze" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Analyzing Your Tickets</CardTitle>
                <CardDescription>
                  We're using AI to analyze your support tickets and identify churn risk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 mb-2">Analyzing tickets with AI...</p>
                  <p className="text-sm text-gray-500">This may take a few minutes</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Tickets imported from {integrationType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-700">AI analyzing sentiment and churn risk</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Circle className="h-5 w-5 text-gray-300" />
                    <span className="text-sm text-gray-400">Generating your first report</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Step */}
          {currentStep === "complete" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">You're All Set!</CardTitle>
                <CardDescription>
                  Your account is ready. Here's what happens next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Setup Complete!</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Your support tickets have been imported and analyzed. You can now view your dashboard to see churn risk insights.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">What happens next:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Weekly Reports</p>
                        <p className="text-sm text-gray-600">You'll receive executive summaries every Monday morning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 shrink-0">
                        <Zap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Real-time Alerts</p>
                        <p className="text-sm text-gray-600">Get notified when high-risk customers need attention</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 shrink-0">
                        <Settings className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Customize Your Settings</p>
                        <p className="text-sm text-gray-600">Adjust alerts, integrations, and preferences anytime</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Go to Settings
                  </Button>
                  <Button onClick={() => router.push("/dashboard")}>
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
