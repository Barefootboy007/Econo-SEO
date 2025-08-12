"""
Authentication utilities for API endpoints
"""

from typing import Optional
from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import logging

logger = logging.getLogger(__name__)

# Simple bearer token security for now
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Get current user ID from JWT token
    
    This is a simplified version - in production, you would:
    1. Validate the JWT signature
    2. Check token expiration
    3. Extract user information from Clerk or your auth provider
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        User ID string
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # For development, we'll accept any bearer token and return a test user ID
        # TODO: Implement proper JWT validation with Clerk
        
        token = credentials.credentials
        
        if not token:
            raise HTTPException(
                status_code=401,
                detail="Authentication required"
            )
        
        # In production, decode and validate JWT here
        # Example with Clerk:
        # decoded = jwt.decode(token, CLERK_PUBLIC_KEY, algorithms=["RS256"])
        # user_id = decoded.get("sub")
        
        # For now, return a test user ID
        return "test_user_123"
        
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials"
        )


async def get_optional_user(
    authorization: Optional[str] = Header(None)
) -> Optional[str]:
    """
    Get optional user ID from JWT token
    
    Args:
        authorization: Optional Authorization header
        
    Returns:
        User ID string or None if not authenticated
    """
    if not authorization:
        return None
    
    try:
        # Extract bearer token
        if not authorization.startswith("Bearer "):
            return None
        
        token = authorization.replace("Bearer ", "")
        
        # In production, decode and validate JWT here
        # For now, return a test user ID if token exists
        return "test_user_123" if token else None
        
    except Exception:
        return None


async def require_admin(
    user_id: str = Depends(get_current_user)
) -> str:
    """
    Require admin privileges
    
    Args:
        user_id: Current user ID
        
    Returns:
        User ID if admin
        
    Raises:
        HTTPException: If user is not admin
    """
    # TODO: Check admin status from database or auth provider
    admin_users = ["admin_user_123"]  # Mock admin list
    
    if user_id not in admin_users:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    
    return user_id