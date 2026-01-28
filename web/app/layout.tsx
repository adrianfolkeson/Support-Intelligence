import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/ui/footer";
import { Logo } from "@/components/ui/logo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Support Intelligence - AI-Powered Ticket Analysis",
  description: "Predict churn before it happens with AI-powered support ticket analysis",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
