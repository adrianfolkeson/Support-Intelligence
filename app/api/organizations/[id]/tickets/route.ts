import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ticketsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  page: z.coerce.number().int().positive().optional().default(1),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  riskMin: z.coerce.number().int().min(0).max(10).optional(),
  riskMax: z.coerce.number().int().min(0).max(10).optional(),
  search: z.string().optional(),
});

// GET /api/organizations/[id]/tickets - List tickets with filtering and pagination
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
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());
    const validation = ticketsQuerySchema.safeParse(query);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { limit, page, status, riskMin, riskMax, search } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { organizationId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch tickets with risk analysis
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        analysis: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Filter by risk if specified (client-side filtering)
    let filteredTickets = tickets;
    if (riskMin !== undefined || riskMax !== undefined) {
      filteredTickets = tickets.filter(t => {
        const risk = t.analysis?.churnRisk || 0;
        if (riskMin !== undefined && risk < riskMin) return false;
        if (riskMax !== undefined && risk > riskMax) return false;
        return true;
      });
    }

    // Get total count for pagination
    const totalCount = await prisma.ticket.count({ where });

    return NextResponse.json({
      tickets: filteredTickets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
