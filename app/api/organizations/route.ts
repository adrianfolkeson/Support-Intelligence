import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEnv } from "@/lib/error-handler";

// Validation schemas
const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters").max(100),
  slug: z.string().optional(),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().optional(),
});

// GET /api/organizations - List all organizations for current user
// POST /api/organizations - Create new organization
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all organizations where user is a member
    const orgUsers = await prisma.organizationUser.findMany({
      where: { userId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            _count: {
              select: { tickets: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const organizations = orgUsers.map(ou => ({
      ...ou.organization,
      role: ou.role,
    }));

    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validationResult = createOrganizationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, slug } = validationResult.data;

    // Check if user already has an organization
    const existingOrgUser = await prisma.organizationUser.findFirst({
      where: { userId },
    });

    if (existingOrgUser) {
      return NextResponse.json(
        { error: "You already have an organization" },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        clerkUserId: userId,
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
      },
    });

    // Add user as owner
    await prisma.organizationUser.create({
      data: {
        userId,
        organizationId: organization.id,
        role: "owner",
      },
    });

    return NextResponse.json(
      { organization, message: "Organization created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating organization:", error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Organization with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
