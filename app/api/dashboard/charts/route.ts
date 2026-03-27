import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get orgId from query params
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    // TODO: Fetch from database when schema is ready
    // For now, return mock data

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Generate trend data for the last 30 days
    const churnTrendData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avgRiskScore: Number((Math.random() * 3 + 3).toFixed(1)), // 3-6 range
        highRiskCount: Math.floor(Math.random() * 8 + 2), // 2-10 range
      };
    });

    // Risk distribution
    const riskDistributionData = [
      { name: "High Risk (7-10)", value: 18, color: "#ef4444" },
      { name: "Medium Risk (4-6)", value: 35, color: "#f59e0b" },
      { name: "Low Risk (0-3)", value: 74, color: "#10b981" },
    ];

    // Sentiment trend
    const sentimentData = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (3 - i) * 7);

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        positive: Math.floor(Math.random() * 20 + 20),
        neutral: Math.floor(Math.random() * 30 + 40),
        negative: Math.floor(Math.random() * 15 + 10),
      };
    });

    // Category breakdown
    const categoryData = [
      { category: "bug", count: 45, trend: "up" as const },
      { category: "feature_request", count: 32, trend: "stable" as const },
      { category: "billing", count: 18, trend: "down" as const },
      { category: "performance", count: 15, trend: "up" as const },
      { category: "documentation", count: 12, trend: "stable" as const },
      { category: "reliability", count: 5, trend: "up" as const },
    ];

    return NextResponse.json({
      churnTrend: churnTrendData,
      riskDistribution: riskDistributionData,
      sentiment: sentimentData,
      categories: categoryData,
    });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
