import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { fetchTicketsFromZendesk, testZendeskConnection } from "@/lib/zendesk";

// POST /api/organizations/[id]/sync-zendesk - Sync tickets from Zendesk
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
        userId_organizationId: {
          userId,
          organizationId,
        },
        role: { in: ["owner", "admin"] },
      },
    });

    if (!orgUser) {
      return NextResponse.json(
        { error: "Forbidden: Owner or admin access required" },
        { status: 403 }
      );
    }

    // Get organization with integrations
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const integrations = organization.integrations as any;
    const zendeskConfig = integrations?.zendesk;

    if (!zendeskConfig || !zendeskConfig.enabled) {
      return NextResponse.json(
        { error: "Zendesk integration not configured" },
        { status: 400 }
      );
    }

    // Fetch tickets from Zendesk
    const zendeskTickets = await fetchTicketsFromZendesk(zendeskConfig, {
      limit: 200, // Fetch last 200 tickets
    });

    let imported = 0;
    let updated = 0;

    // Process each ticket
    for (const zTicket of zendeskTickets) {
      const existingTicket = await prisma.ticket.findUnique({
        where: {
          organizationId_externalId: {
            organizationId,
            externalId: zTicket.id.toString(),
          },
        },
      });

      if (existingTicket) {
        // Update existing ticket
        await prisma.ticket.update({
          where: { id: existingTicket.id },
          data: {
            subject: zTicket.subject,
            description: zTicket.description,
            status: zTicket.status,
            priority: zTicket.priority.toString(),
            updatedAt: new Date(zTicket.updated_at),
          },
        });
        updated++;
      } else {
        // Create new ticket
        await prisma.ticket.create({
          data: {
            organizationId,
            externalId: zTicket.id.toString(),
            externalSource: "zendesk",
            customerEmail: zTicket.requester_id.toString(), // Will be updated with fetch
            subject: zTicket.subject,
            description: zTicket.description,
            status: zTicket.status,
            priority: zTicket.priority.toString(),
            externalUrl: `https://${zendeskConfig.subdomain}.zendesk.com/agent/tickets/${zTicket.id}`,
            externalCreatedAt: new Date(zTicket.created_at),
          },
        });
        imported++;
      }
    }

    // Update integration lastSync time
    const updatedIntegrations = {
      ...integrations,
      zendesk: {
        ...zendeskConfig,
        lastSync: new Date().toISOString(),
      },
    };

    await prisma.organization.update({
      where: { id },
      data: {
        integrations: updatedIntegrations,
      },
    });

    return NextResponse.json({
      message: "Zendesk sync completed",
      stats: {
        imported,
        updated,
        total: zendeskTickets.length,
      },
    });
  } catch (error: any) {
    console.error("Error syncing Zendesk tickets:", error);
    return NextResponse.json(
      { error: "Failed to sync tickets from Zendesk" },
      { status: 500 }
    );
  }
}
