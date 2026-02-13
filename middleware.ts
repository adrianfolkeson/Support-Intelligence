import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhook(.*)"]);

export default clerkMiddleware((req) => {
  if (isPublicRoute(req)) {
    return;
  }
});

export const config = {
  matcher: ["/((?!_next|favicon|static).*)"],
};
