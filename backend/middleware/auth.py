"""JWT verification middleware for authenticating requests."""
import os
from typing import Any

from jose import jwt, JWTError
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer()

_ALGORITHMS = ["HS256"]


def _get_secret() -> str:
    secret = os.environ.get("BETTER_AUTH_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: missing auth secret",
        )
    return secret


def _decode(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, _get_secret(), algorithms=_ALGORITHMS)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    """Verify Bearer JWT and return decoded payload."""
    return _decode(credentials.credentials)


async def verify_jwt_bearer(request: Request) -> dict[str, Any]:
    """Verify Bearer JWT from Authorization header (no OpenAPI security scheme)."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token required",
        )
    return _decode(auth_header[7:])


async def verify_jwt_from_cookie(request: Request) -> dict[str, Any]:
    """Verify JWT stored in Better Auth session cookie."""
    token = (
        request.cookies.get("todo-auth.session_token")
        or request.cookies.get("better-auth.session_token")
        or request.cookies.get("session_token")
    )
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: no session token found",
        )
    return _decode(token)


def validate_user_access(user_id: str, current_user: dict[str, Any]) -> None:
    """Raise 403 if the authenticated user does not own the requested resource."""
    if user_id != current_user.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: cannot access other user's resources",
        )
