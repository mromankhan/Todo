/**
 * Better Auth client configuration.
 * baseURL is resolved from NEXT_PUBLIC_BETTER_AUTH_URL or the current origin.
 */
"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  (typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost:3000/api/auth");

export const authClient = createAuthClient({
  baseURL,
  plugins: [jwtClient()],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  getSession,
} = authClient;
