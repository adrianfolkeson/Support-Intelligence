import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, TrendingDown, Users, AlertTriangle } from "lucide-react";

async function getChurnRiskData(organizationId: string) {
  // In production, fetch from your API with auth
  const response = await fetch(
    `http://localhost:3001/api/dashboard/churn-risk?organizationId=${organizationId}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return {
      stats: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        avgRiskScore: 0,
      },
      highRiskCustomers: [],
      summary: {
        totalCustomers: 0,
        requiresAttention: 0,
        percentAtRisk: 0,
      },
    };
  }

  return await response.json();
}

export default async function ChurnRiskDashboard({
  searchParams,
}: {
  searchParams: Promise<{ organizationId?: string }>;
}) {
  const params = await searchParams;
  const organizationId =
    params.organizationId || "default_organization";

  const data = await getChurnRiskData(organizationId);
  const { stats, highRiskCustomers, summary } = data;

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          Customer Churn Risk Dashboard
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280" }}>
          Monitor and manage customer churn risk in real-time
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Total Customers */}
        <Card>
          <CardHeader style={{ paddingBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CardTitle style={{ fontSize: "14px", color: "#6b7280" }}>
                Total Customers
              </CardTitle>
              <Users size={20} color="#6b7280" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#111827" }}>
              {stats.total}
            </div>
          </CardContent>
        </Card>

        {/* Critical Risk */}
        <Card>
          <CardHeader style={{ paddingBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CardTitle style={{ fontSize: "14px", color: "#6b7280" }}>
                Critical Risk
              </CardTitle>
              <AlertCircle size={20} color="#dc2626" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#dc2626" }}>
              {stats.critical}
            </div>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              ≥75% risk score
            </p>
          </CardContent>
        </Card>

        {/* High Risk */}
        <Card>
          <CardHeader style={{ paddingBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CardTitle style={{ fontSize: "14px", color: "#6b7280" }}>
                High Risk
              </CardTitle>
              <AlertTriangle size={20} color="#f59e0b" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#f59e0b" }}>
              {stats.high}
            </div>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              50-74% risk score
            </p>
          </CardContent>
        </Card>

        {/* At Risk % */}
        <Card>
          <CardHeader style={{ paddingBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CardTitle style={{ fontSize: "14px", color: "#6b7280" }}>
                At Risk
              </CardTitle>
              <TrendingDown size={20} color="#ef4444" />
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#ef4444" }}>
              {summary.percentAtRisk}%
            </div>
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              {summary.requiresAttention} customers need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card style={{ marginBottom: "32px" }}>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
          <CardDescription>
            Breakdown of customers by risk level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: "flex",
              height: "40px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#10b981",
                width: `${(stats.low / stats.total) * 100 || 0}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {stats.low > 0 && `Low ${stats.low}`}
            </div>
            <div
              style={{
                backgroundColor: "#3b82f6",
                width: `${(stats.medium / stats.total) * 100 || 0}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {stats.medium > 0 && `Med ${stats.medium}`}
            </div>
            <div
              style={{
                backgroundColor: "#f59e0b",
                width: `${(stats.high / stats.total) * 100 || 0}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {stats.high > 0 && `High ${stats.high}`}
            </div>
            <div
              style={{
                backgroundColor: "#ef4444",
                width: `${(stats.critical / stats.total) * 100 || 0}%`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {stats.critical > 0 && `Crit ${stats.critical}`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "16px",
              fontSize: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#10b981",
                }}
              />
              <span>Low Risk ({stats.low})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#3b82f6",
                }}
              />
              <span>Medium Risk ({stats.medium})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#f59e0b",
                }}
              />
              <span>High Risk ({stats.high})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "2px",
                  backgroundColor: "#ef4444",
                }}
              />
              <span>Critical Risk ({stats.critical})</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Risk Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>High-Risk Customers</CardTitle>
          <CardDescription>
            Customers requiring immediate attention (Top 20)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highRiskCustomers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px",
                color: "#6b7280",
              }}
            >
              <AlertCircle size={48} style={{ margin: "0 auto 16px" }} />
              <p>No high-risk customers found</p>
              <p style={{ fontSize: "14px" }}>
                Run the nightly analysis to see results
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "12px", fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: "12px", fontWeight: 600 }}>Risk Score</th>
                    <th style={{ padding: "12px", fontWeight: 600 }}>Risk Level</th>
                    <th style={{ padding: "12px", fontWeight: 600 }}>Key Factors</th>
                    <th style={{ padding: "12px", fontWeight: 600 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {highRiskCustomers.map((customer: any, index: number) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "12px" }}>
                        {customer.customerId || "Unknown"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontWeight: 600,
                            backgroundColor:
                              customer.churnRisk >= 75
                                ? "#fef2f2"
                                : customer.churnRisk >= 50
                                ? "#fffbeb"
                                : "#eff6ff",
                            color:
                              customer.churnRisk >= 75
                                ? "#dc2626"
                                : customer.churnRisk >= 50
                                ? "#f59e0b"
                                : "#3b82f6",
                          }}
                        >
                          {customer.churnRisk}%
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                          }}
                        >
                          {customer.riskLevel}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontSize: "12px" }}>
                        {Array.isArray(customer.keyFactors) &&
                        customer.keyFactors.length > 0 ? (
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: "16px",
                              color: "#6b7280",
                            }}
                          >
                            {customer.keyFactors
                              .slice(0, 2)
                              .map((factor: any, i: number) => (
                                <li key={i}>{factor.name}</li>
                              ))}
                          </ul>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <button
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // TODO: Implement action
                            console.log("View customer:", customer.customerId);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div
        style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        <p>
          Last updated: {new Date().toLocaleString()} | Average Risk Score:{" "}
          {stats.avgRiskScore.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
