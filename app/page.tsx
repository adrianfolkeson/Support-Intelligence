import Link from "next/link";
import { ArrowRight, Brain, Shield, Zap, BarChart3, Mail, AlertTriangle, Calculator, TrendingUp, Users, CheckCircle2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { caseStudies, testimonials } from "@/lib/case-studies";

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
            <Link href="/demo">
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10">
                Try Demo
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

      {/* Churn Calculator CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calculator className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            How much is churn costing you?
          </h2>
          <p className="mt-4 text-lg text-purple-100">
            Calculate your revenue loss and see how much you could save with AI-powered churn prediction.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/churn-calculator">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Calculate Your Churn Cost
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-purple-200">
            Takes 2 minutes • No signup required
          </p>
        </div>
      </section>

      {/* Social Proof Counter */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900">50+</p>
              <p className="mt-2 text-gray-600">SaaS Companies</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900">2.5M+</p>
              <p className="mt-2 text-gray-600">Tickets Analyzed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <p className="mt-4 text-4xl font-bold text-gray-900">34%</p>
              <p className="mt-2 text-gray-600">Avg. Churn Reduction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Real Results from Real Companies
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See how Support-Intel helped SaaS companies reduce churn and increase revenue
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {caseStudies.map((study) => (
              <Card key={study.company} className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="text-lg font-bold text-white">{study.logo}</span>
                    </div>
                    <span className="text-sm font-medium text-blue-100">{study.industry}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{study.company}</h3>
                  <div className="mt-4 space-y-3">
                    {study.metrics.map((metric) => (
                      <div key={metric.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{metric.label}</span>
                        <div className="flex items-center gap-1">
                          {metric.improvement === "down" && <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />}
                          {(metric.improvement === "up" || metric.improvement === "improvement") && <TrendingUp className="h-4 w-4 text-green-600" />}
                          <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Quote className="h-6 w-6 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-700 italic">{study.quote}</p>
                    <p className="mt-3 text-sm font-medium text-gray-900">{study.author}</p>
                    <p className="text-xs text-gray-500">{study.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Loved by Founders & Customer Success Teams
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Here's what our customers have to say
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="bg-white">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-blue-200 mb-4" />
                  <p className="text-gray-700">"{testimonial.quote}"</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
