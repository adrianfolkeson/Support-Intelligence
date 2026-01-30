import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function DashboardEmptyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/settings" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome! Let's connect your Zendesk account to get started.</p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="max-w-2xl mx-auto">
            {/* Icon */}
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No data yet
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your Zendesk account to start analyzing your support tickets and predicting customer churn.
            </p>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🤖</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Automatic sentiment analysis and churn risk scoring
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Risk Scores</h3>
                <p className="text-sm text-gray-600">
                  Identify customers at risk of leaving (0-10 score)
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-3xl mb-3">🔔</div>
                <h3 className="font-semibold text-gray-900 mb-2">Email Alerts</h3>
                <p className="text-sm text-gray-600">
                  Get notified when high-risk customers need attention
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/settings"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Connect Zendesk Now
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5-5H6" />
              </svg>
            </Link>

            <p className="mt-6 text-sm text-gray-500">
              Setup takes less than 5 minutes
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How it works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Connect Zendesk</p>
                <p className="text-sm text-gray-600">Enter your subdomain and API token</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">We analyze tickets</p>
                <p className="text-sm text-gray-600">AI scans all your support tickets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Get insights</p>
                <p className="text-sm text-gray-600">View risk scores and patterns</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <p className="font-medium text-gray-900">Take action</p>
                <p className="text-sm text-gray-600">Reach out to at-risk customers</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
