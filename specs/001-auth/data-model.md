# Data Model: Authentication System

## User Entity

**Description**: Represents an authenticated user in the system with credentials and OAuth provider information.

**Fields**:
- `id` (string): Unique identifier for the user (UUID)
- `email` (string): User's email address (unique, validated)
- `emailVerified` (boolean): Whether the email has been verified
- `name` (string): User's display name
- `image` (string): Profile image URL (optional)
- `createdAt` (date): Account creation timestamp
- `updatedAt` (date): Last update timestamp
- `provider` (string): Authentication provider (e.g., "email", "google")
- `hashedPassword` (string): Hashed password for email authentication (nullable)

**Storage**: These entities will be stored in the database configured with Better Auth (Neon)

**Relationships**:
- One-to-Many: A user can have multiple sessions
- One-to-Many: A user can have multiple OAuth accounts (for multiple providers)

**Validation Rules**:
- Email must be in valid format
- Email must be unique across all users
- Name should be 1-100 characters
- Provider must be one of the supported providers

**State Transitions**:
- Unregistered → Registered (when account is created)
- Registered → Verified (when email is verified)
- Registered/Verified → Active (when logged in)
- Active → Inactive (when logged out or session expires)

## Session Entity

**Description**: Represents an authenticated user's active session with associated JWT token.

**Fields**:
- `id` (string): Unique identifier for the session (UUID)
- `userId` (string): Reference to the user who owns the session
- `expiresAt` (date): Expiration timestamp for the session
- `createdAt` (date): Session creation timestamp
- `updatedAt` (date): Last update timestamp
- `deviceInfo` (object): Information about the device used (optional)
- `ipAddress` (string): IP address of the session (optional)

**Storage**: These entities will be stored in the database configured with Better Auth

**Relationships**:
- Many-to-One: Multiple sessions can belong to one user
- One-to-One: Each session has a unique identifier

**Validation Rules**:
- Session must be associated with a valid user
- Expiration time must be in the future
- Cannot create a session for a non-existent user

**State Transitions**:
- Inactive → Active (when user logs in)
- Active → Expired (when session expires)
- Active → Inactive (when user logs out)

## OAuth Account Entity

**Description**: Represents an OAuth account linked to a user account.

**Fields**:
- `id` (string): Unique identifier for the OAuth account (UUID)
- `userId` (string): Reference to the user who owns this OAuth account
- `provider` (string): OAuth provider name (e.g., "google", "github")
- `providerAccountId` (string): Account ID from the OAuth provider
- `accessToken` (string): OAuth access token (encrypted)
- `refreshToken` (string): OAuth refresh token (encrypted, optional)
- `expiresAt` (date): Token expiration timestamp (optional)
- `createdAt` (date): Creation timestamp
- `updatedAt` (date): Last update timestamp

**Storage**: These entities will be stored in the database configured with Better Auth

**Relationships**:
- Many-to-One: Multiple OAuth accounts can belong to one user
- One-to-Many: One OAuth account belongs to one specific provider

**Validation Rules**:
- OAuth account must be linked to a valid user
- Provider and providerAccountId combination must be unique
- Cannot link an OAuth account to a non-existent user

## Authentication State Entity

**Description**: Represents the current authentication status of the user across the application.

**Fields**:
- `isAuthenticated` (boolean): Whether the user is currently authenticated
- `user` (object reference): Reference to the current user object when authenticated
- `loading` (boolean): Whether authentication state is being resolved
- `error` (string): Any error that occurred during authentication (optional)
- `lastChecked` (date): When the state was last updated

**State Transitions**:
- Unknown → Loading (when app initializes)
- Loading → Authenticated (when valid session exists)
- Loading → Unauthenticated (when no valid session)
- Authenticated → Unauthenticated (when logging out or session expires)
- Unauthenticated → Authenticated (when logging in)