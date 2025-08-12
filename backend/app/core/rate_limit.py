"""
Rate limiting utilities for API endpoints
Following the multi-tenancy strategy from the architecture
"""

from typing import Dict, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException
import asyncio
import logging

logger = logging.getLogger(__name__)


# In-memory rate limit store (replace with Redis in production)
rate_limit_store: Dict[str, Dict[str, any]] = {}

# Rate limits per tier (following architecture plan)
RATE_LIMITS = {
    "free": {
        "scrape": {"requests": 10, "window": 3600},  # 10 pages/hour
        "bulk_scrape": {"requests": 10, "window": 3600},  # 10 pages/hour total
        "llm_scrape": {"requests": 2, "window": 86400},  # 2 LLM/day
        "website_crawl": {"requests": 10, "window": 86400},  # 10 pages/day for crawl
    },
    "starter": {
        "scrape": {"requests": 100, "window": 3600},  # 100 pages/hour
        "bulk_scrape": {"requests": 100, "window": 3600},
        "llm_scrape": {"requests": 10, "window": 86400},  # 10 LLM/day
        "website_crawl": {"requests": 100, "window": 3600},
    },
    "pro": {
        "scrape": {"requests": 500, "window": 3600},  # 500 pages/hour
        "bulk_scrape": {"requests": 500, "window": 3600},
        "llm_scrape": {"requests": 50, "window": 86400},  # 50 LLM/day
        "website_crawl": {"requests": 500, "window": 3600},
    },
    "enterprise": {
        # No limits for enterprise
        "scrape": {"requests": 99999, "window": 1},
        "bulk_scrape": {"requests": 99999, "window": 1},
        "llm_scrape": {"requests": 99999, "window": 1},
        "website_crawl": {"requests": 99999, "window": 1},
    }
}


async def get_user_tier(user_id: str) -> str:
    """
    Get user's subscription tier
    
    Args:
        user_id: User ID
        
    Returns:
        Tier name (free, starter, pro, enterprise)
    """
    # TODO: Load from database based on user's subscription
    # For now, return starter tier for test user
    if user_id == "test_user_123":
        return "starter"
    return "free"


async def check_rate_limit(
    user_id: str, 
    operation: str,
    count: int = 1
) -> bool:
    """
    Check if user has exceeded rate limit for operation
    
    Args:
        user_id: User ID
        operation: Operation type (scrape, bulk_scrape, llm_scrape, website_crawl)
        count: Number of requests to count (for bulk operations)
        
    Returns:
        True if within limits
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    # Get user tier
    tier = await get_user_tier(user_id)
    
    # Get limits for tier and operation
    if operation not in RATE_LIMITS[tier]:
        # Unknown operation, allow by default
        return True
    
    limits = RATE_LIMITS[tier][operation]
    max_requests = limits["requests"]
    window_seconds = limits["window"]
    
    # Create key for rate limit tracking
    key = f"{user_id}:{operation}"
    now = datetime.utcnow()
    
    # Initialize store for user if needed
    if key not in rate_limit_store:
        rate_limit_store[key] = {
            "requests": [],
            "window_start": now
        }
    
    user_limits = rate_limit_store[key]
    
    # Clean old requests outside window
    window_start = now - timedelta(seconds=window_seconds)
    user_limits["requests"] = [
        req_time for req_time in user_limits["requests"]
        if req_time > window_start
    ]
    
    # Check if adding new requests would exceed limit
    current_count = len(user_limits["requests"])
    if current_count + count > max_requests:
        # Calculate reset time
        if user_limits["requests"]:
            oldest_request = min(user_limits["requests"])
            reset_time = oldest_request + timedelta(seconds=window_seconds)
            reset_in = (reset_time - now).total_seconds()
        else:
            reset_in = window_seconds
        
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "tier": tier,
                "limit": max_requests,
                "window": window_seconds,
                "reset_in": int(reset_in),
                "upgrade_url": "/pricing"
            }
        )
    
    # Add new request timestamps
    for _ in range(count):
        user_limits["requests"].append(now)
    
    return True


async def get_rate_limit_status(user_id: str, operation: str) -> Dict:
    """
    Get current rate limit status for user and operation
    
    Args:
        user_id: User ID
        operation: Operation type
        
    Returns:
        Dictionary with rate limit status
    """
    tier = await get_user_tier(user_id)
    
    if operation not in RATE_LIMITS[tier]:
        return {
            "tier": tier,
            "operation": operation,
            "unlimited": True
        }
    
    limits = RATE_LIMITS[tier][operation]
    max_requests = limits["requests"]
    window_seconds = limits["window"]
    
    key = f"{user_id}:{operation}"
    now = datetime.utcnow()
    
    if key not in rate_limit_store:
        return {
            "tier": tier,
            "operation": operation,
            "limit": max_requests,
            "remaining": max_requests,
            "window": window_seconds,
            "reset_in": window_seconds
        }
    
    user_limits = rate_limit_store[key]
    
    # Clean old requests
    window_start = now - timedelta(seconds=window_seconds)
    valid_requests = [
        req_time for req_time in user_limits["requests"]
        if req_time > window_start
    ]
    
    remaining = max_requests - len(valid_requests)
    
    # Calculate reset time
    if valid_requests:
        oldest_request = min(valid_requests)
        reset_time = oldest_request + timedelta(seconds=window_seconds)
        reset_in = max(0, (reset_time - now).total_seconds())
    else:
        reset_in = 0
    
    return {
        "tier": tier,
        "operation": operation,
        "limit": max_requests,
        "remaining": max(0, remaining),
        "window": window_seconds,
        "reset_in": int(reset_in)
    }


async def reset_rate_limits(user_id: str, operation: Optional[str] = None):
    """
    Reset rate limits for a user (admin function)
    
    Args:
        user_id: User ID
        operation: Optional specific operation to reset
    """
    if operation:
        key = f"{user_id}:{operation}"
        if key in rate_limit_store:
            del rate_limit_store[key]
    else:
        # Reset all operations for user
        keys_to_delete = [
            key for key in rate_limit_store.keys()
            if key.startswith(f"{user_id}:")
        ]
        for key in keys_to_delete:
            del rate_limit_store[key]