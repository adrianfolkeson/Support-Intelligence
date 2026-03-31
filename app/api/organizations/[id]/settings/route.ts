import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateSettingsSchema = z.object({
  notifications: z.object({
    reportFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    reportDay: z.string().optional(),
    reportTime: z.string().optional(),
    riskThreshold: z.number().min(1).max(10).optional(),
    additionalEmails: z.array(z.string().email()).optional(),
    alerts: z.object({
      highRisk: z.boolean().optional(),
      newAnalysis: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

// GET /api/organizations/[id]/settings - Get organization settings
// PUT /api/organizations/[id]/settings - Update organization settings
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is a member
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId: id },
        ],
      },
    });

    if (!orgUser) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: id },
      select: { settings: true },
    });

    return NextResponse.json({ settings: organization?.settings || {} });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner or admin
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId: id },
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

    const body = await req.json();
    const validationResult = updateSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: id },
      data: {
        settings: validationResult.data,
      },
    });

    return NextResponse.json({
      settings: organization.settings,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
