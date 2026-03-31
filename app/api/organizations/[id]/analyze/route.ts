import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// POST /api/organizations/[id]/analyze - Run AI analysis on tickets
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: organizationId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner or admin
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId },
        ],
        role: { in: ["owner", "admin"] },
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Forbidden: Owner or admin access required" },
        { status: 403 }
      );
    }

    // Get organization for Aurora API
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get unanalyzed tickets
    const unanalyzedTickets = await prisma.ticket.findMany({
      where: {
        organizationId,
        analysis: null,
      },
      take: 10, // Process in batches of 10
    });

    if (unanalyzedTickets.length === 0) {
      return NextResponse.json({
        message: "No tickets to analyze",
        analyzed: 0,
      });
    }

    // Call Aurora API for each ticket
    const { analyzeTicket } = await import("@/lib/aurora-api");
    let analyzed = 0;

    for (const ticket of unanalyzedTickets) {
      try {
        const analysis = await analyzeTicket(
          ticket.id,
          ticket.subject,
          ticket.description,
          organizationId
        );

        if (analysis) {
          // Create or update ticket analysis
          await prisma.ticketAnalysis.upsert({
            where: { ticketId: ticket.id },
            create: {
              ticketId: ticket.id,
              organizationId,
              churnRisk: analysis.churnRisk || 0,
              sentiment: analysis.sentiment || 'neutral',
              frustration: analysis.frustration || 0,
              category: analysis.category || null,
              keyFactors: analysis.keyFactors || [],
              recommendedActions: analysis.recommendedActions || [],
              analyzedAt: new Date(),
            },
            update: {
              churnRisk: analysis.churnRisk || 0,
              sentiment: analysis.sentiment || 'neutral',
              frustration: analysis.frustration || 0,
              category: analysis.category || null,
              keyFactors: analysis.keyFactors || [],
              recommendedActions: analysis.recommendedActions || [],
            },
          });

          analyzed++;
        }
      } catch (error) {
        console.error(`Error analyzing ticket ${ticket.id}:`, error);
      }
    }

    return NextResponse.json({
      message: "Analysis completed",
      analyzed,
      total: unanalyzedTickets.length,
    });
  } catch (error: any) {
    console.error("Error in analysis:", error);
    return NextResponse.json(
      { error: "Failed to analyze tickets" },
      { status: 500 }
    );
  }
}
