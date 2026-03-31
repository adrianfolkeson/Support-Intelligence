"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface ChurnMetrics {
  mrr: number;
  churnRate: number;
  customerCount: number;
  avgCustomerValue: number;
}

export default function ChurnCalculatorPage() {
  const [metrics, setMetrics] = useState<ChurnMetrics>({
    mrr: 10000,
    churnRate: 5,
    customerCount: 100,
    avgCustomerValue: 100,
  });

  const calculateChurn = () => {
    const monthlyChurnRevenue = metrics.mrr * (metrics.churnRate / 100);
    const annualChurnRevenue = monthlyChurnRevenue * 12;
    const customersLostPerMonth = Math.round(metrics.customerCount * (metrics.churnRate / 100));

    // Industry benchmarks for recovery rates
    const recoveryRateWithoutTool = 0.15; // 15% recovery without AI
    const recoveryRateWithTool = 0.45; // 45% recovery with AI-powered detection

    const savingsWithoutTool = annualChurnRevenue * recoveryRateWithoutTool;
    const savingsWithTool = annualChurnRevenue * recoveryRateWithTool;
    const additionalSavings = savingsWithTool - savingsWithoutTool;

    // Calculate ROI
    const annualCost = 149 * 12; // $149/month * 12
    const roi = ((additionalSavings - annualCost) / annualCost) * 100;

    return {
      monthlyChurnRevenue,
      annualChurnRevenue,
      customersLostPerMonth,
      savingsWithoutTool,
      savingsWithTool,
      additionalSavings,
      annualCost,
      roi,
    };
  };

  const results = calculateChurn();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-neutral-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 sm:text-5xl mb-4">
              Churn Cost Calculator
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Discover how much revenue you're losing to churn and how Support-Intel can help you recover it.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Business Metrics</CardTitle>
                <CardDescription>
                  Enter your current numbers to calculate churn impact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="mrr" className="block text-sm font-medium text-neutral-700 mb-2">
                    Monthly Recurring Revenue (MRR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                    <Input
                      id="mrr"
                      type="number"
                      value={metrics.mrr}
                      onChange={(e) => setMetrics({ ...metrics, mrr: Number(e.target.value) })}
                      className="pl-8"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="churnRate" className="block text-sm font-medium text-neutral-700 mb-2">
                    Monthly Churn Rate (%)
                  </label>
                  <div className="relative">
                    <Input
                      id="churnRate"
                      type="number"
                      value={metrics.churnRate}
                      onChange={(e) => setMetrics({ ...metrics, churnRate: Number(e.target.value) })}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">%</span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Industry average: 5-7% for B2B SaaS
                  </p>
                </div>

                <div>
                  <label htmlFor="customerCount" className="block text-sm font-medium text-neutral-700 mb-2">
                    Total Customers
                  </label>
                  <Input
                    id="customerCount"
                    type="number"
                    value={metrics.customerCount}
                    onChange={(e) => setMetrics({ ...metrics, customerCount: Number(e.target.value) })}
                    min="1"
                    step="10"
                  />
                </div>

                <div>
                  <label htmlFor="avgCustomerValue" className="block text-sm font-medium text-neutral-700 mb-2">
                    Average Revenue Per Customer (ARPU)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                    <Input
                      id="avgCustomerValue"
                      type="number"
                      value={metrics.avgCustomerValue}
                      onChange={(e) => setMetrics({ ...metrics, avgCustomerValue: Number(e.target.value) })}
                      className="pl-8"
                      min="0"
                      step="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Current Churn Impact */}
              <Card className="border-error/20 bg-error/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-error">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    Current Churn Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-600">Monthly Revenue Lost</p>
                      <p className="text-3xl font-bold text-error">
                        {formatCurrency(results.monthlyChurnRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Annual Revenue Lost</p>
                      <p className="text-3xl font-bold text-error">
                        {formatCurrency(results.annualChurnRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Customers Lost Per Month</p>
                      <p className="text-2xl font-semibold text-error">
                        {results.customersLostPerMonth} customers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* With Support-Intel */}
              <Card className="border-success/20 bg-success/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-success">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    With Support-Intel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-600">Revenue You Could Save Annually</p>
                      <p className="text-3xl font-bold text-success">
                        {formatCurrency(results.savingsWithTool)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Additional Savings vs Manual Process</p>
                      <p className="text-3xl font-bold text-success">
                        {formatCurrency(results.additionalSavings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">ROI in First Year</p>
                      <p className="text-2xl font-semibold text-success">
                        {results.roi > 0 ? "+" : ""}{results.roi.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Breakdown Chart */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Annual Revenue Breakdown</CardTitle>
              <CardDescription>
                See where your revenue goes and how Support-Intel helps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Total MRR Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Total Annual Revenue</span>
                    <span className="text-neutral-600">{formatCurrency(metrics.mrr * 12)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-hover h-full rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: "100%" }}
                    >
                      100%
                    </div>
                  </div>
                </div>

                {/* Churn Loss Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-error">Lost to Churn</span>
                    <span className="text-error">{formatCurrency(results.annualChurnRevenue)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-error h-full rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${Math.min((results.annualChurnRevenue / (metrics.mrr * 12)) * 100, 100)}%` }}
                    >
                      {((results.annualChurnRevenue / (metrics.mrr * 12)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Recovered with Support-Intel Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-success">Recovered with Support-Intel</span>
                    <span className="text-success">{formatCurrency(results.savingsWithTool)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${Math.min((results.savingsWithTool / (metrics.mrr * 12)) * 100, 100)}%` }}
                    >
                      {((results.savingsWithTool / (metrics.mrr * 12)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Remaining Loss Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-warning">Remaining Loss (Even with Tool)</span>
                    <span className="text-warning">{formatCurrency(results.annualChurnRevenue - results.savingsWithTool)}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-warning h-full rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${Math.min(((results.annualChurnRevenue - results.savingsWithTool) / (metrics.mrr * 12)) * 100, 100)}%` }}
                    >
                      {(((results.annualChurnRevenue - results.savingsWithTool) / (metrics.mrr * 12)) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                    <TrendingDown className="h-6 w-6 text-neutral-900" />
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Reduce Churn by 30%</h3>
                <p className="text-sm text-neutral-600">
                  AI-powered analysis catches at-risk customers before they leave, giving you time to intervene.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
                    <DollarSign className="h-6 w-6 text-neutral-900" />
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Save {formatCurrency(results.additionalSavings)}/Year</h3>
                <p className="text-sm text-neutral-600">
                  Catch more at-risk customers with AI than with manual review alone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">{results.roi > 0 ? results.roi.toFixed(0) : "N/A"}% ROI in Year 1</h3>
                <p className="text-sm text-neutral-600">
                  Investment pays for itself {results.additionalSavings > results.annualCost ? Math.floor(results.additionalSavings / results.annualCost) : 0}x over with recovered revenue.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-primary to-primary-hover text-white border-0">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Stop Losing Revenue to Churn?
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
                Start your 30-day free trial and see which customers are at risk. No credit card required.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="bg-white text-primary hover:bg-neutral-100">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
