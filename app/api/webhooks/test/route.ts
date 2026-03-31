import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";

export async function POST(req: NextRequest) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Test webhook by sending a ping
    const testPayload = {
      event: "test",
      timestamp: new Date().toISOString(),
      data: {
        message: "Webhook test successful",
      },
    };

    const webhookResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Support-Intel-Webhook/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    if (webhookResponse.ok) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: `Webhook returned status ${webhookResponse.status}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Webhook test error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook test failed" },
      { status: 500 }
    );
  }
}
