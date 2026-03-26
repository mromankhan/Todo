/**
 * Better Auth server configuration.
 * This file configures the authentication server with security best practices.
 */
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { Pool } from "pg";

export const auth = betterAuth({
  appName: "Todo App",
  // BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from env automatically
  database: process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : undefined,

  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
  ],

  // Rate limiting — stricter limits on sensitive auth endpoints
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    storage: "database",
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
      "/api/auth/forget-password": { window: 60, max: 3 },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,            // 5-minute cache
      strategy: "compact",       // Base64url + HMAC — smallest footprint
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 30,   // 30 minutes
    revokeSessionsOnPasswordReset: true,
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Wire up your email provider here (Resend, Nodemailer, etc.)
      console.log(`[Auth] Verification email for ${user.email}: ${url}`);
    },
  },

  // Trusted origins — extend via BETTER_AUTH_TRUSTED_ORIGINS env var
  trustedOrigins: [
    "http://localhost:3000",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
      : []),
  ],

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "todo-auth",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
