import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using Support Intelligence, you accept and agree to be bound by the terms and provisions of this agreement.",
    },
    {
      title: "Description of Service",
      content: "Support Intelligence provides AI-powered analysis of customer support tickets to predict churn risk. The service includes dashboard access, weekly reports, and email alerts.",
    },
    {
      title: "User Accounts",
      content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "Payment Terms",
      content: "The Service is offered on a subscription basis. You will be billed $149/month (or current promotional rate) after your 30-day free trial. You may cancel at any time.",
    },
    {
      title: "Cancellation",
      content: "You may cancel your subscription at any time through your account settings or by contacting support. Cancellation will take effect at the end of the current billing period.",
    },
    {
      title: "Limitation of Liability",
      content: "Support Intelligence shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.",
    },
    {
      title: "Contact",
      content: "For questions about these terms, please contact us at info@auroraecom.se",
    },
  ];

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
        <p className="mt-4 text-gray-600">Last updated: February 2026</p>

        <div className="mt-12 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
              <p className="mt-2 text-gray-600">{section.content}</p>
            </section>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">
              By using Support Intelligence, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
