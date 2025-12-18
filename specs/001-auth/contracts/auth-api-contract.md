# Authentication API Contract

## Overview
This document defines the API contracts for the authentication system. All endpoints follow REST conventions and use JSON for request/response payloads.

## Base URL
```
https://api.todoapp.com/auth
```

## Authentication
Most endpoints require authentication via JWT tokens passed in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

Unauthenticated endpoints are marked as such.

## Common Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "data": { ... } | null,
  "error": { "message": "..." } | null
}
```

## Endpoints

### POST /register
Creates a new user account with email and password.

**Unauthenticated**

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Successful Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-01-01T00:00:00Z"
    },
    "token": "jwt_token"
  },
  "error": null
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Invalid email format or password too weak"
  }
}
```

### POST /login
Authenticates a user with email and password.

**Unauthenticated**

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token"
  },
  "error": null
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Invalid credentials"
  }
}
```

### POST /oauth/google
Handles Google OAuth authentication flow.

**Unauthenticated**

**Request**:
```json
{
  "idToken": "google_id_token"
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "provider": "google"
    },
    "token": "jwt_token"
  },
  "error": null
}
```

### POST /logout
Logs out the current user and invalidates their session.

**Authenticated**

**Request**: (No body required)

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  },
  "error": null
}
```

### GET /me
Returns information about the authenticated user.

**Authenticated**

**Request**: (No body required)

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2023-01-01T00:00:00Z",
      "emailVerified": true
    }
  },
  "error": null
}
```

### POST /refresh
Refreshes the authentication token.

**Authenticated** (uses refresh token instead of access token)

**Request**:
```json
{
  "refreshToken": "refresh_token"
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  },
  "error": null
}
```

## Error Codes

Common HTTP status codes used across all endpoints:
- `200`: Success for GET, PUT, PATCH requests
- `201`: Success for POST requests (resource created)
- `400`: Bad request (validation error)
- `401`: Unauthorized (invalid or expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `409`: Conflict (e.g., email already exists)
- `500`: Internal server error

## Rate Limiting
All authentication endpoints implement rate limiting to prevent abuse:
- 5 login attempts per IP per 15 minutes
- 10 registration attempts per IP per hour
- Exceeded limits result in 429 (Too Many Requests) status code