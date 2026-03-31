import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import {
  getHighRiskCustomers,
  getChurnRiskStats,
} from "@/lib/db/churn-predictions";

/**
 * GET /api/dashboard/churn-risk
 *
 * Get churn risk dashboard data for an organization
 *
 * Query params:
 * - organizationId: Organization ID (required)
 */
export async function GET(request: Request) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId query parameter is required" },
        { status: 400 }
      );
    }

    // Get statistics
    const stats = await getChurnRiskStats(organizationId);

    // Get high-risk customers
    const highRiskCustomers = await getHighRiskCustomers(organizationId);

    return NextResponse.json({
      organizationId,
      stats,
      highRiskCustomers: highRiskCustomers.slice(0, 20), // Top 20
      summary: {
        totalCustomers: stats.total,
        requiresAttention: stats.critical + stats.high,
        percentAtRisk: stats.total > 0
          ? Math.round(((stats.critical + stats.high) / stats.total) * 100)
          : 0,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching churn risk dashboard:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
