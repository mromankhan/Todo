"""JWT verification middleware for authenticating requests."""
import os
from typing import Any

from jose import jwt, JWTError
from fastapi import HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer()


async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    """
    Verify JWT token and return the decoded payload.

    Args:
        credentials: The HTTP authorization credentials containing the Bearer token.

    Returns:
        The decoded JWT payload containing user information.

    Raises:
        HTTPException: If the token is invalid, expired, or missing.
    """
    token = credentials.credentials

    secret = os.environ.get("BETTER_AUTH_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: missing auth secret",
        )

    try:
        # Verify the JWT token using HS256 algorithm
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def verify_jwt_from_cookie(request: Request) -> dict[str, Any]:
    """
    Verify JWT token from cookie (for ChatKit endpoint).

    Better Auth stores the session token in a cookie named 'better-auth.session_token'.
    This function extracts and validates that token for ChatKit requests.

    Args:
        request: The FastAPI request object.

    Returns:
        The decoded JWT payload containing user information.

    Raises:
        HTTPException: If the token is invalid, expired, or missing.
    """
    # Try multiple cookie names where Better Auth might store the token
    token = (
        request.cookies.get("better-auth.session_token") or
        request.cookies.get("session_token") or
        request.cookies.get("auth_token")
    )

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: no session token found",
        )

    secret = os.environ.get("BETTER_AUTH_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: missing auth secret",
        )

    try:
        # Verify the JWT token using HS256 algorithm
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )


def validate_user_access(user_id: str, current_user: dict[str, Any]) -> None:
    """
    Validate that the current user has access to the specified user_id's resources.

    Args:
        user_id: The user_id from the URL path.
        current_user: The decoded JWT payload containing the authenticated user's info.

    Raises:
        HTTPException: If the user_id doesn't match the authenticated user.
    """
    # The custom token endpoint puts user ID in the "sub" claim
    token_user_id = current_user.get("sub")

    if user_id != token_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: cannot access other user's resources",
        )
