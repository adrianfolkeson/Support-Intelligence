import { clerkMiddleware } from "@clerk/nextjs";

const isPublicRoute = ["/", "/sign-in", "/sign-up", "/api/webhook"];

export default clerkMiddleware({
  publicRoutes: isPublicRoute,
  debug: false,
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
