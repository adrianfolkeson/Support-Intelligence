import { NextResponse } from "next/server";

// Check if Clerk is configured with real keys (not placeholder values)
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
                          !!process.env.CLERK_SECRET_KEY &&
                          !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('xxx') &&
                          !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('_test_');

// Export middleware that only runs when Clerk is configured
export default isClerkConfigured
  ? (() => {
      // Dynamically import Clerk only when configured
      const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");

      const isPublicRoute = createRouteMatcher([
        // Marketing pages
        "/",
        "/pricing",
        "/churn-calculator",
        "/compare",
        "/demo",
        "/blog(.*)",
        "/documentation",
        "/api-reference",
        "/integration-guide",
        "/support(.*)",
        "/privacy(.*)",
        "/terms(.*)",
        "/status(.*)",
        // Auth pages
        "/sign-in(.*)",
        "/sign-up(.*)",
        // API endpoints that should be public
        "/api/webhook(.*)",
        "/api/stripe(.*)",
      ]);

      return clerkMiddleware((auth: any, req: any) => {
        if (!isPublicRoute(req)) {
          auth.protect();
        }
      });
    })()
  : ((req: any) => NextResponse.next());

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
