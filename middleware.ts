import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};