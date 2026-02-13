import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocumentationPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900">Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn how Support Intelligence works and how to get the most out of it.
        </p>

        <div className="mt-12 space-y-8">
          {/* How It Works */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>How Support Intelligence Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Connect Your Data</h3>
                    <p className="text-gray-600">
                      Integrate with Zendesk or upload a CSV of your support tickets. Our system
                      securely ingests your ticket data including customer emails, subjects, and messages.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                    <p className="text-gray-600">
                      Our AI analyzes each ticket for sentiment, frustration level, and churn risk indicators.
                      We look at language patterns, issue types, and customer history.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get Insights</h3>
                    <p className="text-gray-600">
                      View risk scores in your dashboard, receive weekly reports, and get instant alerts
                      when high-risk customers need attention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AI Analysis */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Explained</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Sentiment Analysis</h3>
                  <p className="mt-1 text-gray-600">
                    Each ticket is analyzed for positive, neutral, or negative sentiment. This helps
                    identify unhappy customers even when they don&apos;t explicitly express frustration.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Frustration Detection</h3>
                  <p className="mt-1 text-gray-600">
                    Our AI detects signs of frustration including aggressive language, repeated issues,
                    threats to cancel, and expressions of disappointment.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Churn Prediction</h3>
                  <p className="mt-1 text-gray-600">
                    By combining sentiment, frustration, and historical patterns, we predict the likelihood
                    of customer churn on a 1-10 scale.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Risk Scoring */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Scoring Methodology</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">1-4</div>
                  <div>
                    <p className="font-medium text-gray-900">Low Risk</p>
                    <p className="text-sm text-gray-600">Customer is satisfied, no churn indicators detected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 font-bold">5-7</div>
                  <div>
                    <p className="font-medium text-gray-900">Medium Risk</p>
                    <p className="text-sm text-gray-600">Some concerns detected, monitoring recommended</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">8-10</div>
                  <div>
                    <p className="font-medium text-gray-900">High Risk</p>
                    <p className="text-sm text-gray-600">Strong churn indicators, immediate attention needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• We use industry-standard security practices</li>
                  <li>• Your data is never shared with third parties</li>
                  <li>• You can delete your data at any time</li>
                  <li>• AI processing is done through secure APIs</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
