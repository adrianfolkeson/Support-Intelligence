import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";

// Webhook types
export type WebhookEvent = "high_risk" | "new_analysis" | "weekly_report" | "customer_churned";

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

// Mock database for webhooks (replace with actual database)
const webhooksDb: Map<string, Webhook[]> = new Map();

export async function GET(req: NextRequest) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const orgId = req.nextUrl.searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const webhooks = webhooksDb.get(orgId) || [];
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const { orgId, url, events } = await req.json();

    if (!orgId || !url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "orgId, url, and events are required" },
        { status: 400 }
      );
    }

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const orgWebhooks = webhooksDb.get(orgId) || [];
    orgWebhooks.push(webhook);
    webhooksDb.set(orgId, orgWebhooks);

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const webhookId = searchParams.get("webhookId");

    if (!orgId || !webhookId) {
      return NextResponse.json(
        { error: "orgId and webhookId are required" },
        { status: 400 }
      );
    }

    const orgWebhooks = webhooksDb.get(orgId) || [];
    const filtered = orgWebhooks.filter(w => w.id !== webhookId);
    webhooksDb.set(orgId, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 });
  }
}
