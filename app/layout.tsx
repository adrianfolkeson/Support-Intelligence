import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Support Intelligence - AI-Powered Churn Prevention",
  description: "Predict customer churn before it happens with AI-powered support ticket analysis.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Support Intelligence",
    description: "AI-powered churn prevention for SaaS companies",
    type: "website",
  },
};

// Check if Supabase is configured with real keys (not placeholder values)
const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
                             !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                             !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');

// Dev mode banner component
function DevModeBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center text-sm text-amber-800">
      <strong>Development Mode:</strong> Authentication is disabled. Add Supabase environment variables to enable sign in/sign up.
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
