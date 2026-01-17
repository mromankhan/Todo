---
name: better-auth-setup
description: Configure Better Auth authentication for Next.js frontend with JWT plugin for FastAPI backend integration. Use this skill when setting up user authentication, login/register flows, or integrating auth between frontend and backend. Triggers on "setup authentication", "add login", "configure Better Auth", or when working on auth-related features.
---

# Better Auth Setup

Configure Better Auth for the Next.js frontend with JWT token generation for FastAPI backend authentication.

## Workflow

1. Install Better Auth dependencies
2. Configure Better Auth with JWT plugin
3. Set up authentication API routes
4. Create auth context and hooks
5. Build login/register UI components
6. Configure backend JWT verification

## Project Structure

```
frontend/
├── lib/
│   └── auth.ts              # Better Auth configuration
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts # Auth API routes
│   └── (auth)/
│       ├── login/
│       │   └── page.tsx
│       └── register/
│           └── page.tsx
└── components/
    └── auth/
        ├── login-form.tsx
        ├── register-form.tsx
        └── auth-provider.tsx
```

## Installation

```bash
npm install better-auth
```

## Better Auth Configuration

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  // Database adapter (using Prisma or Drizzle)
  database: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },

  // Email/password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true in production
  },

  // JWT plugin for backend integration
  plugins: [
    jwt({
      // JWT secret shared with FastAPI backend
      secret: process.env.JWT_SECRET!,
      expiresIn: "7d",
      // Custom claims to include in JWT
      customClaims: async (user) => ({
        user_id: user.id,
        email: user.email,
      }),
    }),
  ],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

// Export auth client for frontend use
export const authClient = auth.client;
```

## API Routes

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Auth Provider

```typescript
// components/auth/auth-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    authClient.getSession().then((session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    if (result.user) {
      setUser(result.user);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    });
    if (result.user) {
      setUser(result.user);
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
  };

  const getToken = async () => {
    const session = await authClient.getSession();
    return session?.token ?? null;
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## Login Form Component

```typescript
// components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
```

## Environment Variables

```env
# frontend/.env.local
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
JWT_SECRET=your-shared-secret-with-backend-min-32-chars
BETTER_AUTH_SECRET=your-better-auth-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Protected Route Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token");

  // Protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (
    sessionCookie &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

## Key Principles

1. **Shared JWT Secret**: Same secret in frontend and backend
2. **Secure Cookies**: Better Auth handles secure cookie storage
3. **Token in API Calls**: Include JWT in Authorization header
4. **Protected Routes**: Use middleware for route protection
5. **Session Refresh**: Tokens auto-refresh before expiry
