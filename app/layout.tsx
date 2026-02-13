import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
