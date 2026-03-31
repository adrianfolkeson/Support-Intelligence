import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-api";
import {
  batchChurnPrediction,
  sendBatchComplete,
} from "@/lib/aurora-api";

/**
 * POST /api/aurora/batch
 *
 * Batch process multiple customers for churn prediction
 *
 * Request body:
 * {
 *   "customers": array of {
 *     "customerId": string,
 *     "organizationId": string,
 *     "customerData": object
 *   }
 * }
 */
export async function POST(request: Request) {
  const start = Date.now();

  try {
    const { userId, response } = await getAuthenticatedUser();
    if (response) {
      return response;
    }

    const body = await request.json();
    const { customers } = body;

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        { error: "Missing or invalid 'customers' array" },
        { status: 400 }
      );
    }

    if (customers.length === 0) {
      return NextResponse.json(
        { error: "No customers provided" },
        { status: 400 }
      );
    }

    if (customers.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 customers per batch" },
        { status: 400 }
      );
    }

    // Process batch
    const predictions = await batchChurnPrediction(customers);

    // Calculate statistics
    const highRiskCount = predictions.filter(
      p => p.prediction.churnRisk >= 50
    ).length;
    const criticalCount = predictions.filter(
      p => p.prediction.churnRisk >= 75
    ).length;

    const batchId = `batch_${Date.now()}`;

    // Send completion notification
    await sendBatchComplete({
      batchId,
      totalCustomers: customers.length,
      highRiskCount,
      processedAt: new Date().toISOString(),
    }).catch(err => {
      console.error("Failed to send batch complete:", err);
    });

    return NextResponse.json({
      success: true,
      batchId,
      summary: {
        totalCustomers: customers.length,
        highRiskCount,
        criticalCount,
        avgRiskScore: predictions.reduce((sum, p) => sum + p.prediction.churnRisk, 0) / predictions.length,
      },
      predictions,
      processedIn: Date.now() - start,
    });
  } catch (error: any) {
    console.error("Error in Aurora batch API:", error);
    return NextResponse.json(
      {
        error: "Batch processing failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
