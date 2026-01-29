"use client";

import { useState } from "react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Kunde inte starta betalningen. Försök igen eller kontakta support.');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Enkel, transparent prissättning
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ett pris, alla funktioner. Inga dolda avgifter, inga överraskningar.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600">För växande supportteam</p>
              </div>

              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-gray-900">$249</span>
                <span className="text-gray-600">/månad</span>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Upp till 2 000 ärenden per månad',
                  'AI-driven analys av supportärenden',
                  'Churn risk förutsägelser',
                  'Zendesk integration',
                  'Veckovisa insiktsrapporter',
                  'Mejlvarningar för högriskkunder',
                  'Prioriterad support',
                  '30 dagars gratis provperiod',
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-4 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Startar...' : 'Starta Gratis Prova'}
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                Ingen kreditkort krävs • Igång på 5 minuter • Avsluta när som helst
              </p>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-6">Säker betalning driven av</p>
            <div className="flex justify-center items-center gap-8 opacity-60 grayscale">
              <span className="text-2xl font-bold text-gray-400">Stripe</span>
              <span className="text-2xl font-bold text-gray-400">Vercel</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
