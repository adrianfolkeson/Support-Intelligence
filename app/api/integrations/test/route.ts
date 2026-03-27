import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, apiKey, apiUrl } = await req.json();

    if (!type || !apiKey) {
      return NextResponse.json(
        { error: "Integration type and API key are required" },
        { status: 400 }
      );
    }

    // Default URLs based on integration type
    const defaultUrls = {
      zendesk: "https://youraccount.zendesk.com/api/v2",
      intercom: "https://api.intercom.io",
      helpscout: "https://api.helpscout.net/v2",
    };

    const testUrl = apiUrl || defaultUrls[type as keyof typeof defaultUrls];

    // Test the connection based on integration type
    let success = false;
    let error = "";

    try {
      switch (type) {
        case "zendesk":
          const zendeskResponse = await fetch(`${testUrl}/tickets.json`, {
            headers: {
              Authorization: `Basic ${Buffer.from(`${apiKey}/token:${apiKey}`).toString("base64")}`,
            },
          });
          if (zendeskResponse.ok) {
            success = true;
          } else {
            error = `Zendesk API error: ${zendeskResponse.status}`;
          }
          break;

        case "intercom":
          const intercomResponse = await fetch("https://api.intercom.io/conversations", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Intercom-Version": "2.10",
              Accept: "application/json",
            },
          });
          if (intercomResponse.ok) {
            success = true;
          } else {
            error = `Intercom API error: ${intercomResponse.status}`;
          }
          break;

        case "helpscout":
          const helpScoutResponse = await fetch("https://api.helpscout.net/v2/conversations", {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              Accept: "application/json",
            },
          });
          if (helpScoutResponse.ok) {
            success = true;
          } else {
            error = `Help Scout API error: ${helpScoutResponse.status}`;
          }
          break;

        default:
          error = "Unknown integration type";
      }
    } catch (e: any) {
      error = e.message || "Connection failed";
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Connection successful",
      });
    } else {
      return NextResponse.json(
        { error: error || "Connection failed. Please check your credentials." },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Integration test error:", error);
    return NextResponse.json(
      { error: "Failed to test integration" },
      { status: 500 }
    );
  }
}
