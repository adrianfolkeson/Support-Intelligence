import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Support Intelligence - AI-Powered Churn Prevention",
  description: "Predict customer churn before it happens with AI-powered support ticket analysis.",
  openGraph: {
    title: "Support Intelligence",
    description: "AI-powered churn prevention for SaaS companies",
    type: "website",
  },
};

// Check if Clerk is configured with real keys (not placeholder values)
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                          !!process.env.CLERK_SECRET_KEY &&
                          !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx') &&
                          !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('_test_');

// Dev mode banner component
function DevModeBanner() {
  if (isClerkConfigured) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center text-sm text-amber-800">
      <strong>Development Mode:</strong> Authentication is disabled. Add Clerk environment variables to enable sign in/sign up.
    </div>
  );
}

// Simple wrapper component that doesn't use Clerk
function NoAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // When Clerk is configured, dynamically load AuthProvider
  if (isClerkConfigured) {
    const AuthProvider = require("@/components/auth-provider").AuthProvider;
    return (
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </AuthProvider>
        </body>
      </html>
    );
  }

  // No auth configured
  return (
    <html lang="en">
      <body className={inter.className}>
        <DevModeBanner />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
