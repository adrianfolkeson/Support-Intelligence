import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

// GET /api/organizations/[id]/reports - List all reports
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }
    const { id: organizationId } = await params;

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

    const reports = await prisma.report.findMany({
      where: { organizationId },
      orderBy: { startDate: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
