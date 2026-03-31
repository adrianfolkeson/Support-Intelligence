import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import {
  sendChurnPrediction,
  collectCustomerMetrics,
  sendChurnAlert,
  checkAuroraHealth
} from "@/lib/aurora-api";

/**
 * POST /api/aurora/predict
 *
 * Analyze customer churn risk using Aurora AI integration
 *
 * Request body:
 * {
 *   "customerId": string,
 *   "organizationId": string,
 *   "customer": object,      // Customer basic info
 *   "supportData": array,    // Support tickets
 *   "usageData": object      // Usage metrics
 * }
 */
export async function POST(request: Request) {
  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const body = await request.json();
    const { customerId, organizationId, customer, supportData, usageData } = body;

    if (!customerId || !organizationId || !customer) {
      return NextResponse.json(
        { error: "Missing required fields: customerId, organizationId, customer" },
        { status: 400 }
      );
    }

    // Collect customer metrics
    const customerData = collectCustomerMetrics(
      customer,
      supportData || [],
      usageData || {}
    );

    // Send prediction request to Aurora
    const prediction = await sendChurnPrediction({
      customerId,
      organizationId,
      customerData,
    });

    // If high risk, send alert webhook
    if (prediction.prediction.churnRisk >= 50) {
      await sendChurnAlert({
        customerId,
        organizationId,
        riskLevel: prediction.prediction.riskLevel,
        riskScore: prediction.prediction.churnRisk,
      }).catch(err => {
        console.error("Failed to send churn alert:", err);
        // Don't fail the request if alert fails
      });
    }

    return NextResponse.json({
      success: true,
      customerId,
      prediction,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error in Aurora predict API:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze churn risk",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/aurora/predict
 *
 * Check Aurora connection status
 */
export async function GET() {
  try {
    const health = await checkAuroraHealth();

    return NextResponse.json({
      status: "connected",
      aurora: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
