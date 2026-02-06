import Link from "next/link";
import { ArrowRight, Brain, Shield, Zap, BarChart3, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const features = [
    { icon: Brain, title: "AI-Powered Analysis", description: "Advanced AI models analyze every support ticket for sentiment and churn indicators" },
    { icon: AlertTriangle, title: "Churn Risk Scoring", description: "Each customer gets a 1-10 risk score based on their support interactions" },
    { icon: Zap, title: "Zendesk Integration", description: "One-click integration with Zendesk. Set up in minutes, not hours" },
    { icon: BarChart3, title: "Weekly Reports", description: "Comprehensive weekly reports summarizing trends and at-risk customers" },
    { icon: Mail, title: "Email Alerts", description: "Instant notifications when high-risk customers need attention" },
    { icon: Shield, title: "Privacy First", description: "Enterprise-grade security. Your data is encrypted and never shared" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            AI-powered churn prevention, simplified
          </h1>
          <p className="mt-6 text-lg text-blue-100 sm:text-xl lg:mx-auto lg:max-w-2xl">
            Predict customer churn before it happens. Automatic AI analysis of your support tickets.
            Start your 30-day free trial.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/documentation">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to prevent churn
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features that help you identify and retain at-risk customers
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            Trusted by SaaS companies worldwide
          </h3>
          <p className="mt-4 text-gray-600">
            Join hundreds of companies using AI to reduce churn and improve customer retention
          </p>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start your 30-day free trial. No credit card required.
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Professional</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">$149</span>
                <span className="ml-2 text-gray-500">/month</span>
                <span className="ml-3 text-lg text-gray-400 line-through">$249</span>
              </div>
              <ul className="mt-6 space-y-4">
                {[
                  "Up to 2,000 tickets/month",
                  "AI churn risk analysis",
                  "Zendesk integration",
                  "Weekly insight reports",
                  "Email alerts for high-risk",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-3">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="mt-8 block">
                <Button className="w-full">Start 30-Day Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to reduce churn?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Start your free trial today and see which customers are at risk.
          </p>
          <div className="mt-8">
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
