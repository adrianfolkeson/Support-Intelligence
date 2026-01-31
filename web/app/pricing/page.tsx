"use client";

import { useState } from "react";
import Link from "next/link";

// Pricing page with Stripe checkout
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // Generate organization name from timestamp for uniqueness
      const organizationName = `Customer-${Date.now()}`;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationName }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not start payment. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <nav className="border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Support Intelligence
            </Link>
            <Link href="/">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              AI-powered churn prevention,
              <span className="text-blue-600"> simplified</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Predict customer churn before it happens. Automatic AI analysis of support tickets.
              30 day free trial.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-600 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Professional</h3>
                  <p className="text-gray-600">Complete AI analysis for support teams</p>

                  <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <p className="text-sm font-semibold text-purple-700 mb-2">Limited time offer for first 10 customers</p>
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl font-bold text-gray-400 line-through">$249</span>
                      <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        $149
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <p className="text-sm text-green-600 font-semibold mt-2">
                      You save $1,200/year! Lock in this price forever as an early adopter.
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      After the first 10 customers, the price will be $249/month.
                    </p>
                  </div>
                </div>

                <div className="mb-10">
                  <h4 className="text-xl font-semibold text-gray-900 mb-6">Everything included:</h4>
                  <ul className="space-y-4">
                    {[
                      { icon: '', text: 'AI analysis of all support tickets', highlight: false },
                      { icon: '', text: 'Churn risk scoring (0-10) for each customer', highlight: false },
                      { icon: '', text: 'Email alerts for high risk (≥8/10)', highlight: false },
                      { icon: '', text: 'Weekly insight reports', highlight: true },
                      { icon: '', text: 'Zendesk integration (automatic sync)', highlight: true },
                      { icon: '', text: 'Export data to CSV', highlight: false },
                      { icon: '', text: 'Priority support via email', highlight: true },
                      { icon: '', text: '30 day free trial - no credit card required!', highlight: true },
                    ].map((feature, index) => (
                      <li key={index} className={`flex items-start gap-3 ${feature.highlight ? 'bg-blue-50 p-3 -mx-3 rounded-lg' : ''}`}>
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <span className={`font-medium ${feature.highlight ? 'text-blue-700' : 'text-gray-700'}`}>
                            {feature.text}
                          </span>
                          {feature.highlight && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              POPULAR
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-5 text-center text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? 'Starting...' : 'Start 30 day free trial'}
                </button>

                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
                    </svg>
                    <span>Cancel anytime</span>
                  </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                  You keep the introductory price as long as you stay a customer
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-center text-gray-900 mb-6">
                What our early users say
              </h4>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    quote: "We found a risk customer we would have otherwise missed. Great value!",
                    author: "SaaS Founder",
                    company: "Early Adopter"
                  },
                  {
                    quote: "The weekly reports save us hours every week.",
                    author: "Support Lead",
                    company: "Beta Tester"
                  },
                  {
                    quote: "So easy to get started. Integrated in 5 minutes.",
                    author: "CTO",
                    company: "Early Adopter"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                    <p className="text-sm font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                *Hypothetical quotes for illustrative purposes
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Be one of the first 10 customers
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in shaping the future of support analytics. Early adopter pricing applies as long as you stay a customer.
          </p>
          <button
            onClick={() => window.location.href = '#pricing'}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get started now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5H6" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
