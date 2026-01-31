import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <div className="flex gap-4 items-center">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Pricing
              </a>
              <Link
                href="/dashboard-connected?org=71474f1d-e3c0-4b70-8874-d26cb5047cb7"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
              Now with Zendesk Integration
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn Support Tickets Into
              <span className="text-blue-600"> Business Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered analysis that identifies customer patterns, predicts churn risk, 
              and helps your support team work smarter. Save 10+ hours per week.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start 30-Day Free Trial
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 mb-6">Trusted by support teams at</p>
            <div className="flex justify-center items-center gap-8 opacity-50 grayscale">
              <span className="text-2xl font-bold text-gray-400">Zendesk</span>
              <span className="text-2xl font-bold text-gray-400">Slack</span>
              <span className="text-2xl font-bold text-gray-400">Stripe</span>
              <span className="text-2xl font-bold text-gray-400">Notion</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to optimize support
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From ticket analysis to churn prediction, get insights that help you deliver better customer experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">AI</div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Automatically analyze sentiment, frustration level, and churn risk for every ticket using Claude AI.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
                <p className="text-gray-600">
                  Get email notifications when customers show high churn risk (≥8/10) so you can act fast.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Evidence-Based Insights</h3>
                <p className="text-gray-600">
                  See exactly why AI rated each ticket with specific evidence from customer messages.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-xl font-semibold mb-2">Zendesk Integration</h3>
                <p className="text-gray-600">
                  Connect your Zendesk account for automatic ticket sync. No manual data entry required.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">Weekly Reports</h3>
                <p className="text-gray-600">
                  Get comprehensive weekly reports with trends, patterns, and actionable recommendations.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-xl">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
                <p className="text-gray-600">
                  Your data stays yours. Enterprise-grade security with no training on your tickets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                One plan, all features. No hidden fees, no surprises.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600">For growing support teams</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-gray-900">$249</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    'Up to 2,000 tickets per month',
                    'AI-powered ticket analysis',
                    'Churn risk predictions',
                    'Zendesk integration',
                    'Weekly insight reports',
                    'Email alerts for high-risk tickets',
                    'Priority support',
                    '30-day free trial',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className="block w-full py-4 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Start Free Trial
                </Link>
                <p className="mt-4 text-center text-sm text-gray-500">
                  Cancel anytime. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to optimize your support team?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join companies using Support Intelligence to deliver better customer experiences.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="sm" />
              <p className="mt-2 text-sm">AI-powered support intelligence</p>
            </div>
            <div className="flex gap-8">
              <a href="/documentation" className="hover:text-white transition-colors">Documentation</a>
              <a href="/api-reference" className="hover:text-white transition-colors">API</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            © 2024 Support Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
