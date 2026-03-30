import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/admin/stats - Get system-wide statistics
export async function GET() {
  try {
    // Get counts
    const totalOrganizations = await prisma.organization.count();
    const totalUsers = await prisma.organizationUser.count();
    const totalTickets = await prisma.ticket.count();
    const totalReports = await prisma.report.count();

    // Calculate revenue (trial subscriptions = $0)
    const activeOrganizations = await prisma.organization.count({
      where: {
        subscriptionStatus: { in: ['trial', 'active'] },
      },
    });

    const monthlyRevenue = activeOrganizations * 149; // $149/month

    // Get churn stats
    const totalAnalysis = await prisma.ticketAnalysis.count();
    const highRiskCount = await prisma.ticketAnalysis.count({
      where: { churnRisk: { gte: 7 } },
    });

    const avgRisk = await prisma.ticketAnalysis.aggregate({
      _avg: { churnRisk: true },
    });

    return NextResponse.json({
      totalOrganizations,
      totalUsers,
      totalTickets,
      totalReports,
      activeOrganizations,
      monthlyRevenue,
      analyzedTickets: totalAnalysis,
      highRiskCount,
      averageRiskScore: avgRiskAvg?._avg.churnRisk?.toFixed(1) || '0',
      churnRate: totalOrganizations > 0 ? ((1 - (activeOrganizations / totalOrganizations)) * 100).toFixed(1) : '0',
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
