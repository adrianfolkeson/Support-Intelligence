import Link from "next/link";

export default function WelcomePage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const sessionId = params.get('session_id');
  
  if (!sessionId) {
    if (typeof window !== 'undefined') {
      window.location.href = '/pricing';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">Welcome to Support Intelligence!</h1>
                <p className="text-green-700">Your subscription is now active. Let's get you set up.</p>
              </div>
            </div>
          </div>

          {/* Simple Steps */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Get started in 3 simple steps</h2>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Connect your Zendesk account</h3>
              <p className="text-gray-600">Go to Settings to connect your Zendesk account and start analyzing tickets.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. AI analyzes your tickets</h3>
              <p className="text-gray-600">Our AI will automatically analyze all your support tickets for churn risk.</p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Get insights & alerts</h3>
              <p className="text-gray-600">View your dashboard with churn risk scores and weekly reports.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/dashboard-connected"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Takes less than 5 minutes to set up
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
