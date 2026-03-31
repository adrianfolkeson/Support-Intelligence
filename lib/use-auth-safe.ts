"use client";

import { useAuth as useClerkAuth } from "@clerk/nextjs";

// Re-export Clerk's auth hook - it will throw if keys aren't set
export { useClerkAuth as useAuth };

