import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import { prisma } from "@/lib/db";

// GET /api/admin/organizations - List all organizations (admin only)
export async function GET() {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    // TODO: Verify user is admin
    // For now, return all organizations
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { tickets: true, users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
