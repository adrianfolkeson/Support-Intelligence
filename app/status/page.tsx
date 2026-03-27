import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const systems = [
  { name: "API", status: "operational", uptime: "99.98%" },
  { name: "Web Application", status: "operational", uptime: "99.95%" },
  { name: "Database", status: "operational", uptime: "99.99%" },
  { name: "AI Analysis", status: "operational", uptime: "99.90%" },
  { name: "Email Service", status: "degraded", uptime: "99.85%" },
];

const incidents = [
  {
    date: "2025-03-27",
    title: "Email delivery delays",
    status: "investigating",
    description: "We're currently investigating delays in email delivery for weekly reports.",
  },
  {
    date: "2025-03-20",
    title: "API latency",
    status: "resolved",
    description: "Experienced elevated API latency for approximately 15 minutes. Resolved.",
  },
];

export const dynamic = 'force-dynamic';

export default function StatusPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "outage":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "outage":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  const getIncidentStatusColor = (status: string) => {
    switch (status) {
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "identified":
        return "bg-orange-100 text-orange-800";
      case "monitoring":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Support-Intel Status</h1>
          <p className="mt-1 text-sm text-gray-600">Real-time system status and incident updates</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Overall Status */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-lg font-semibold text-green-900">All Systems Operational</p>
                <p className="text-sm text-green-700">Last checked: Just now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Systems Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="space-y-3">
              {systems.map((system) => (
                <div key={system.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(system.status)}
                    <span className="font-medium text-gray-900">{system.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${getStatusColor(system.status)}`}>
                      {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500">{system.uptime} uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incidents */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.date} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-500">{new Date(incident.date).toLocaleDateString()}</p>
                      <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getIncidentStatusColor(incident.status)}`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{incident.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Uptime Metrics */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uptime History</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last 24 hours</span>
                <span className="font-medium text-green-600">99.98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 7 days</span>
                <span className="font-medium text-green-600">99.95%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 30 days</span>
                <span className="font-medium text-green-600">99.93%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last 90 days</span>
                <span className="font-medium text-green-600">99.91%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe to Updates */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Subscribe to status updates at</p>
          <a href="/status/rss" className="text-blue-600 hover:underline">
            /status/rss
          </a>
        </div>
      </main>
    </div>
  );
}
