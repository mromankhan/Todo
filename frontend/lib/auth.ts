/**
 * Better Auth server configuration.
 * This file configures the authentication server with JWT support.
 */
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

// Validate required environment variables at runtime
const databaseUrl = process.env.DATABASE_URL;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl && typeof window === "undefined") {
  console.warn("DATABASE_URL is not set. Auth will not work properly.");
}

if (!authSecret && typeof window === "undefined") {
  console.warn("BETTER_AUTH_SECRET is not set. Auth will not work properly.");
}

export const auth = betterAuth({
  secret: authSecret,
  database: databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
      })
    : undefined,
  plugins: [
    // JWT plugin for JWKS endpoint (optional, not used for backend auth)
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
});

export type Session = typeof auth.$Infer.Session;
