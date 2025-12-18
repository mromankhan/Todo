# Quickstart: Authentication System

## Overview
This guide helps you quickly set up and start working with the authentication system for the Todo application.

## Prerequisites
- Node.js 18+ installed
- Next.js 14+ set up in your project
- Better Auth configured in your application
- shadcn/ui components installed

## Installation

1. Install required dependencies:
   ```bash
   npm install @better-auth/react @better-auth/next-js shadcn-ui
   ```

2. Set up environment variables:
   ```env
   # For Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # For JWT signing
   AUTH_SECRET=your_auth_secret
   
   # Database connection (for Better Auth storage)
   DATABASE_URL=your_database_connection_string
   ```

## Configuration

1. Configure Better Auth in your Next.js application:

   Create `lib/auth.ts`:
   ```typescript
   import { betterAuth } from "better-auth";
   import { nextJs } from "@better-auth/next-js";

   export const auth = betterAuth({
     database: {
       provider: "your_provider", // e.g., "postgresql", "mysql"
       url: process.env.DATABASE_URL!,
     },
     socialProviders: {
       google: {
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       },
     },
     // Additional configuration options...
   });

   export const authNext = nextJs(auth);
   ```

2. Update your Next.js middleware (`middleware.ts`) to protect routes:
   ```typescript
   import { authNext } from "./lib/auth";

   export default authNext();

   export const config = {
     matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
   };
   ```

## Usage

### Creating Authentication Components

1. Use the provided shadcn/ui auth components:

   ```tsx
   import { AuthCard } from "@/components/auth/auth-card";

   export default function LoginPage() {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <AuthCard type="login" />
       </div>
     );
   }
   ```

2. Implement protected routes using the `useAuth` hook:

   ```tsx
   import { useAuth } from "@/hooks/useAuth";
   import { useRouter } from "next/router";

   export default function DashboardPage() {
     const { user, loading } = useAuth({ redirectTo: '/login' });

     if (loading) return <div>Loading...</div>;

     return (
       <div>
         <h1>Welcome, {user?.name}!</h1>
         {/* Your protected content */}
       </div>
     );
   }
   ```

### API Routes

Use Better Auth's API routes for authentication:

```typescript
// pages/api/auth/[...auth].ts
import { auth } from "@/lib/auth";

export default auth;
```

## Running in Development

1. Start your database (if using local database)
2. Run the Next.js development server:
   ```bash
   npm run dev
   ```
3. Navigate to the login page in your browser
4. Test authentication flows (registration, login, logout)

## Environment Variables

Required environment variables:
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `AUTH_SECRET`: Secret for signing JWT tokens
- `DATABASE_URL`: Connection string for your database

## Next Steps

1. Customize the authentication UI components to match your design
2. Add additional OAuth providers if needed
3. Implement role-based access control for protected features
4. Add email verification flows if required
5. Set up monitoring and analytics for authentication events