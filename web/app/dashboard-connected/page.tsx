import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function DashboardConnectedPage() {
  // Sample data simulating real customers with churn risk
  const customers = [
    {
      id: 1,
      name: "Acme Corp",
      email: "billing@acme.com",
      riskScore: 8,
      riskLevel: "high",
      tickets: 15,
      lastInteraction: "2 hours ago",
      issues: ["Pricing complaint", "Feature request ignored", "Refund requested"]
    },
    {
      id: 2,
      name: "TechStart AB",
      email: "admin@techstart.se",
      riskScore: 3,
      riskLevel: "low",
      tickets: 3,
      lastInteraction: "1 day ago",
      issues: ["Setup question"]
    },
    {
      id: 3,
      name: "Global Enterprises",
      email: "it@global-ent.com",
      riskScore: 9,
      riskLevel: "high",
      tickets: 22,
      lastInteraction: "4 hours ago",
      issues: ["Multiple bugs", "Threatened to cancel", "Competitor mentioned"]
    },
    {
      id: 4,
      name: "Startup Inc",
      email: "ceo@startup-inc.io",
      riskScore: 6,
      riskLevel: "medium",
      tickets: 8,
      lastInteraction: "3 days ago",
      issues: ["Integration help", "Billing inquiry"]
    },
    {
      id: 5,
      name: "Media House",
      email: "support@mediahouse.com",
      riskScore: 2,
      riskLevel: "low",
      tickets: 2,
      lastInteraction: "5 days ago",
      issues: ["General question"]
    }
  ];

  const stats = {
    totalCustomers: 156,
    atRisk: 12,
    thisWeek: 8,
    avgRiskScore: 4.2
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return "bg-red-500";
    if (score >= 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getRiskTextColor = (score: number) => {
    if (score >= 8) return "text-red-700";
    if (score >= 5) return "text-yellow-700";
    return "text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg-px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">AI-powered customer churn prediction</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Zendesk Connected
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">At Risk (≥8/10)</div>
            <div className="text-3xl font-bold text-red-600">{stats.atRisk}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">New This Week</div>
            <div className="text-3xl font-bold text-orange-600">{stats.thisWeek}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Avg Risk Score</div>
            <div className="text-3xl font-bold text-gray-900">{stats.avgRiskScore}/10</div>
          </div>
        </div>

        {/* High Risk Alert */}
        {(stats.atRisk > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  {stats.atRisk} customers at high risk of churning
                </h3>
                <p className="text-red-700 text-sm">
                  Consider reaching out to these customers immediately. Their churn risk score is 8/10 or higher.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Export List
              </button>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Customer Risk Scores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRiskColor(customer.riskScore)}`}>
                          {customer.riskScore}
                        </div>
                        <span className={`text-sm font-medium ${getRiskTextColor(customer.riskScore)}`}>
                          {customer.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.tickets}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.lastInteraction}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.issues.map((issue, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl"></div>
              <h3 className="font-semibold text-gray-900">Export Data</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Download all customer data and risk scores as CSV</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Export CSV
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl"></div>
              <h3 className="font-semibold text-gray-900">Weekly Report</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">View the latest weekly insights and trends</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View Report
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl"></div>
              <h3 className="font-semibold text-gray-900">Settings</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Manage Zendesk connection and alert preferences</p>
            <Link
              href="/settings"
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-center block"
            >
              Manage Settings
            </Link>
          </div>
        </div>

        {/* View different states */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Want to see how it looks for new customers?
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/welcome"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
            >
              View Welcome Page
            </Link>
            <Link
              href="/dashboard-empty"
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
            >
              View Empty State
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
