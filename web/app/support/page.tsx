import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata = {
  title: "Support - Support Intelligence",
  description: "Get help with Support Intelligence",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Logo size="md" />
            </div>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/pricing"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Support
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How long does analysis take?
                </h3>
                <p className="text-gray-600">
                  Most ticket batches are analyzed within 1-2 minutes. Large
                  batches of 500+ tickets may take 5-10 minutes.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What ticket formats do you support?
                </h3>
                <p className="text-gray-600">
                  We support Zendesk, Freshdesk, Intercom, and generic CSV
                  formats. Contact us for custom integrations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How accurate is the churn prediction?
                </h3>
                <p className="text-gray-600">
                  Our AI achieves 85%+ accuracy based on historical data analysis.
                  Predictions improve as the system learns from your specific customer patterns.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Can I export my data?
                </h3>
                <p className="text-gray-600">
                  Yes, you can export all analyzed tickets and reports in CSV
                  or JSON format from the dashboard.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What happens after my trial ends?
                </h3>
                <p className="text-gray-600">
                  You'll receive a reminder before your trial ends. If you
                  don't subscribe, your data is preserved for 30 days so you
                  can export it.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Us
              </h2>

              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="enterprise">Enterprise Inquiry</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">
                Other Ways to Reach Us
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li> Email: support@support-intelligence.ai</li>
                <li> Live Chat: Available 9AM-5PM EST</li>
                <li>📞 Phone: 1-800-SUPPORT (Enterprise plans only)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Additional Resources
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/documentation"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Documentation
              </h3>
              <p className="text-gray-600">
                Detailed guides and API reference
              </p>
            </Link>

            <Link
              href="/api-reference"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                API Reference
              </h3>
              <p className="text-gray-600">
                Technical documentation for developers
              </p>
            </Link>

            <Link
              href="/integration-guide"
              className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-3xl mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Integration Guide
              </h3>
              <p className="text-gray-600">
                Step-by-step integration instructions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
