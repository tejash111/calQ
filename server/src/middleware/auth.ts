import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

// Initialize Clerk middleware — reads CLERK_SECRET_KEY from env automatically
export const clerkAuth = clerkMiddleware();

// Require authentication — returns 401 if no valid session
export const requireAuthentication = requireAuth();

// Helper to extract userId from Clerk auth
export function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId ?? null;
}
