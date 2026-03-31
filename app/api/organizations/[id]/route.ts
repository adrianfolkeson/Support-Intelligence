import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireEnv } from "@/lib/error-handler";

const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().optional(),
});

// GET /api/organizations/[id] - Get organization details
// PUT /api/organizations/[id] - Update organization
// DELETE /api/organizations/[id] - Delete organization
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

    // Check if user is a member of this organization
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
      include: {
        _count: {
          select: { tickets: true, users: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
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
    const validationResult = updateOrganizationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { name, slug } = validationResult.data;

    const organization = await prisma.organization.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error("Error updating organization:", error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Organization with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is owner
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        AND: [
          { userId },
          { organizationId: id },
        ],
        role: "owner",
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required" },
        { status: 403 }
      );
    }

    // Delete organization (cascade will delete related records)
    await prisma.organization.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Organization deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
