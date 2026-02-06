/**
 * Better Auth client configuration.
 * This file provides hooks and functions for client-side authentication.
 */
"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Get the base URL - use window.location.origin for client-side
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000/api/auth";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [jwtClient()],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  getSession,
} = authClient;
