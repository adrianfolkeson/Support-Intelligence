import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import { prisma } from "@/lib/db";

// GET /api/tickets/[id] - Get single ticket details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }
    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: id },
      include: {
        analysis: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verify user has access to this ticket's organization
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId: ticket.organizationId },
        ],
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Forbidden: You don't have access to this ticket" },
        { status: 403 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
