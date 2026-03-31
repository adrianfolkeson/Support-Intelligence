"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export function NavbarWithAuth() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/pricing", label: "Pricing" },
    { href: "/documentation", label: "Documentation" },
    { href: "/api-reference", label: "API" },
    { href: "/support", label: "Support" },
  ];

  const dashboardLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/tickets", label: "Tickets" },
    { href: "/reports", label: "Reports" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              Support Intelligence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <SignedOut>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="sm">Get Started</Button>
              </Link>
            </SignedOut>

            <SignedIn>
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            <SignedOut>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/sign-in"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="block rounded-lg bg-blue-600 px-3 py-2 text-center text-base font-medium text-white hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </SignedOut>

            <SignedIn>
              {dashboardLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex justify-center pt-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
