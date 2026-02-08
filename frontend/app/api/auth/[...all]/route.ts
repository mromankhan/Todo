/**
 * Better Auth API route handler.
 * Handles all authentication requests (sign-in, sign-up, sign-out, etc.)
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
