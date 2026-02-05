import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="border-b bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <a href="/" className="text-xl font-bold text-gray-900">
                  Support Intelligence
                </a>
                <SignedOut>
                  <div className="flex gap-4">
                    <SignInButton mode="modal" />
                    <SignUpButton mode="modal" />
                  </div>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/"/>
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
