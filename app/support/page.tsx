import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageCircle, Clock } from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      q: "How does the free trial work?",
      a: "You get 30 days of full access to all features. No credit card is required to start. After 30 days, you can subscribe to continue using the service.",
    },
    {
      q: "What happens to my data during the trial?",
      a: "Your data is securely stored and protected. If you choose not to subscribe, your data is deleted after 30 days.",
    },
    {
      q: "Can I import tickets from multiple sources?",
      a: "Currently, we support Zendesk integration and CSV uploads. You can use both methods to import tickets from different sources.",
    },
    {
      q: "How accurate is the churn prediction?",
      a: "Our AI model is trained on thousands of support interactions and achieves approximately 85% accuracy in identifying customers at risk of churning.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time from your billing settings. Access continues until the end of your billing period.",
    },
    {
      q: "Do you offer enterprise plans?",
      a: "Yes, we offer custom enterprise plans for organizations with more than 2,000 tickets per month. Contact us for details.",
    },
    {
      q: "Is my customer data secure?",
      a: "Absolutely. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.",
    },
    {
      q: "How often are reports generated?",
      a: "Weekly reports are generated every Monday morning. You can also view real-time data in your dashboard at any time.",
    },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Help & Support</h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions or get in touch with our team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Mail className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Email Support</h3>
              <p className="mt-2 text-gray-600">
                Get help via email. We typically respond within 24 hours.
              </p>
              <a
                href="mailto:support@supportintelligence.com"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                support@supportintelligence.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Documentation</h3>
              <p className="mt-2 text-gray-600">
                Browse our documentation for detailed guides and API reference.
              </p>
              <a
                href="/documentation"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                View Documentation
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Response Time */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Response Time</p>
                <p className="text-sm text-gray-600">
                  We typically respond to all inquiries within 24 hours on business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900">Still need help?</h3>
            <p className="mt-2 text-gray-600">
              Our support team is here to help. Reach out anytime.
            </p>
            <a
              href="mailto:support@supportintelligence.com"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700"
            >
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
