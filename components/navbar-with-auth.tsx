"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function NavbarWithAuth() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push('/');
    router.refresh();
  };

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
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-neutral-900">
              Support Intelligence
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {!loading && !user && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-neutral-600 ${
                      pathname === link.href
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-700"
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
              </>
            )}

            {!loading && user && (
              <>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-neutral-600 ${
                      pathname === link.href
                        ? "text-neutral-900 font-medium"
                        : "text-neutral-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                      <Link
                        href="/settings/account"
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
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
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-4">
            {!loading && !user && (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
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
                  className="block rounded-lg bg-primary px-3 py-2 text-center text-base font-medium text-white hover:bg-primary-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}

            {!loading && user && (
              <>
                <div className="px-3 py-2 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">
                    {user.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-neutral-600">{user.email}</p>
                </div>
                {dashboardLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-neutral-100 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
