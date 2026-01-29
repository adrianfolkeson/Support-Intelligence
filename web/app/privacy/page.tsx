import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Support Intelligence",
  description: "Privacy policy for Support Intelligence",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h2>
              <p className="text-gray-600">
                We collect information you provide directly to us, including when you create an account,
                use our services, or communicate with us. This may include your name, email address,
                and support ticket data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
              <p className="text-gray-600">
                We use the information we collect to provide, maintain, and improve our services,
                to process support ticket analyses, and to send you technical notices and support messages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate technical and organizational measures to protect your data
                against unauthorized access, alteration, disclosure, or destruction. Your support ticket
                data is processed securely and never used to train AI models.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Retention</h2>
              <p className="text-gray-600">
                We retain your data for as long as necessary to provide our services and comply with
                legal obligations. You can request deletion of your data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
              <p className="text-gray-600">
                We use third-party services to help operate our business, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Anthropic for AI analysis</li>
                <li>Stripe for payment processing</li>
                <li>Zendesk for ticket integration</li>
                <li>Vercel for hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, correct, or delete your personal data. You may also
                opt out of marketing communications at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact us at
                <a href="mailto:support@supportintelligence.com" className="text-blue-600 hover:underline ml-1">
                  support@supportintelligence.com
                </a>
              </p>
            </section>

            <section className="pt-6 border-t">
              <p className="text-sm text-gray-500">
                Last updated: January 2026
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
