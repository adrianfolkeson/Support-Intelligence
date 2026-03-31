import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import { prisma } from "@/lib/db";

// GET /api/reports/[id] - Get specific report
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

    const report = await prisma.report.findUnique({
      where: { id: id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify user has access
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId: report.organizationId },
        ],
      },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
