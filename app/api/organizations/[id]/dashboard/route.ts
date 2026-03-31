import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET /api/organizations/[id]/dashboard - Get dashboard statistics
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: organizationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a member
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId },
        ],
      },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get ticket counts
    const totalTickets = await prisma.ticket.count({
      where: { organizationId },
    });

    const analyzedTickets = await prisma.ticketAnalysis.count({
      where: { organizationId },
    });

    const highRiskTickets = await prisma.ticketAnalysis.count({
      where: {
        organizationId,
        churnRisk: { gte: 7 },
      },
    });

    // Get average risk score
    const riskScores = await prisma.ticketAnalysis.findMany({
      where: { organizationId },
      select: { churnRisk: true },
    });

    const avgRiskScore = riskScores.length > 0
      ? riskScores.reduce((sum, t) => sum + t.churnRisk, 0) / riskScores.length
      : 0;

    // Get recent high-risk tickets
    const recentHighRiskTickets = await prisma.ticket.findMany({
      where: { organizationId },
      include: {
        analysis: {
          where: { churnRisk: { gte: 7 } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Filter and sort by churn risk in JavaScript
    const sortedHighRiskTickets = recentHighRiskTickets
      .filter(t => t.analysis)
      .sort((a, b) => (b.analysis?.churnRisk || 0) - (a.analysis?.churnRisk || 0))
      .slice(0, 5);

    const stats = {
      totalTickets,
      analyzedTickets,
      highRiskCount: highRiskTickets,
      averageRiskScore: avgRiskScore.toFixed(1),
      recentTickets: sortedHighRiskTickets.map(t => ({
        id: t.id,
        subject: t.subject,
        customerEmail: t.customerEmail,
        status: t.status,
        createdAt: t.createdAt,
        churnRisk: t.analysis?.churnRisk || 0,
      })),
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
