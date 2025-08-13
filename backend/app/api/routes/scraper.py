"""
API endpoints for web scraping operations
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.responses import JSONResponse
import logging

from app.scraping_models import (
    ScrapeRequest,
    BulkScrapeRequest,
    LLMScrapeRequest,
    CrawlWebsiteRequest,
    ScrapeResponse,
    BulkScrapeResponse,
    LLMScrapeResponse,
    CrawlWebsiteResponse
)
from app.services.scraper import SEOScraper
from app.services.scraper_settings import (
    ScraperSettings,
    ScraperMode,
    UserScraperPreferences
)
from app.core.auth import get_current_user
from app.core.rate_limit import check_rate_limit
from app.tasks.scraping_tasks import scrape_single_url, scrape_website, scrape_bulk_urls

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/scraper",
    tags=["scraper"]
)


# Dependency to get scraper settings for current user
async def get_user_scraper_settings(
    user_id: str = Depends(get_current_user)
) -> ScraperSettings:
    """
    Get scraper settings for the current user
    Could be extended to load from database
    """
    # TODO: Load user preferences from database
    # For now, return standard preset
    return ScraperSettings.get_preset(ScraperMode.STANDARD)


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_single_url(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
):
    """
    Scrape a single URL for SEO analysis
    
    Args:
        request: Scraping request parameters
        background_tasks: FastAPI background tasks
        settings: User's scraper settings
        user_id: Current user ID
        
    Returns:
        ScrapeResponse with SEO analysis data
    """
    try:
        # Check rate limits
        await check_rate_limit(user_id, "scrape")
        
        # Override settings with request parameters
        if request.js_enabled is not None:
            settings.js_enabled = request.js_enabled
        if request.screenshot is not None:
            settings.screenshot = request.screenshot
        if request.extract_media is not None:
            settings.extract_media = request.extract_media
        if request.bypass_cloudflare is not None:
            settings.bypass_cloudflare = request.bypass_cloudflare
        if request.page_timeout:
            settings.page_timeout = request.page_timeout
        if request.wait_for:
            settings.wait_for_timeout = request.wait_for * 1000  # Convert to ms
        
        # Create scraper instance and scrape
        async with SEOScraper(settings) as scraper:
            result = await scraper.scrape_url(str(request.url))
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Scraping failed")
            )
        
        # TODO: Store result in database for user history
        # background_tasks.add_task(store_scrape_result, user_id, result)
        
        return ScrapeResponse(
            success=result["success"],
            url=result["url"],
            timestamp=result.get("timestamp"),
            data=result.get("data"),
            metadata=result.get("metadata"),
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error scraping URL {request.url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Scraping failed: {str(e)}"
        )


@router.post("/scrape/bulk", response_model=BulkScrapeResponse)
async def scrape_bulk_urls(
    request: BulkScrapeRequest,
    background_tasks: BackgroundTasks,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
):
    """
    Scrape multiple URLs concurrently
    
    Args:
        request: Bulk scraping request
        background_tasks: FastAPI background tasks
        settings: User's scraper settings
        user_id: Current user ID
        
    Returns:
        BulkScrapeResponse with results for all URLs
    """
    try:
        # Check rate limits for bulk operation
        await check_rate_limit(user_id, "bulk_scrape", count=len(request.urls))
        
        # Convert URLs to strings
        urls = [str(url) for url in request.urls]
        
        # Create scraper and perform bulk scraping
        async with SEOScraper(settings) as scraper:
            results = await scraper.bulk_scrape(
                urls,
                max_concurrent=request.max_concurrent
            )
        
        # Count successes and failures
        successful = sum(1 for r in results if r.get("success"))
        failed = len(results) - successful
        
        # Convert results to response models
        scrape_responses = []
        for result in results:
            scrape_responses.append(ScrapeResponse(
                success=result.get("success", False),
                url=result.get("url", ""),
                timestamp=result.get("timestamp"),
                data=result.get("data"),
                metadata=result.get("metadata"),
                error=result.get("error")
            ))
        
        # TODO: Store bulk results in database
        # background_tasks.add_task(store_bulk_results, user_id, results)
        
        return BulkScrapeResponse(
            results=scrape_responses,
            total_urls=len(request.urls),
            successful=successful,
            failed=failed
        )
        
    except Exception as e:
        logger.error(f"Error in bulk scraping: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Bulk scraping failed: {str(e)}"
        )


@router.post("/scrape/llm", response_model=LLMScrapeResponse)
async def scrape_with_llm_extraction(
    request: LLMScrapeRequest,
    background_tasks: BackgroundTasks,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
):
    """
    Scrape a URL and extract specific information using LLM
    
    Args:
        request: LLM extraction request
        background_tasks: FastAPI background tasks
        settings: User's scraper settings
        user_id: Current user ID
        
    Returns:
        LLMScrapeResponse with extracted data
    """
    try:
        # Check rate limits for LLM operation (more expensive)
        await check_rate_limit(user_id, "llm_scrape")
        
        # Override JS setting if specified
        if request.js_enabled is not None:
            settings.js_enabled = request.js_enabled
        
        # Create scraper and perform LLM extraction
        async with SEOScraper(settings) as scraper:
            result = await scraper.scrape_with_llm(
                str(request.url),
                request.extraction_prompt
            )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "LLM extraction failed")
            )
        
        # TODO: Store LLM extraction result
        # background_tasks.add_task(store_llm_result, user_id, result)
        
        return LLMScrapeResponse(
            success=result["success"],
            url=result["url"],
            timestamp=result.get("timestamp"),
            extracted_data=result.get("extracted_data"),
            metadata=result.get("metadata"),
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error in LLM extraction for {request.url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"LLM extraction failed: {str(e)}"
        )


@router.post("/scrape/async")
async def scrape_async(
    request: ScrapeRequest,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Queue a URL for async scraping using Celery
    Returns immediately with a job ID
    """
    try:
        # Queue the task
        task = scrape_single_url.apply_async(
            args=[str(request.url), user_id],
            kwargs={"settings": settings.to_dict()}
        )
        
        return {
            "success": True,
            "job_id": task.id,
            "status": "queued",
            "message": f"Scraping job queued for {request.url}"
        }
        
    except Exception as e:
        logger.error(f"Error queuing scrape job: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue scraping job: {str(e)}"
        )


@router.post("/scrape/website/async")
async def scrape_website_async(
    request: CrawlWebsiteRequest,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Queue a website for async crawling using Celery
    Returns immediately with a job ID
    """
    try:
        # Queue the task
        task = scrape_website.apply_async(
            args=[str(request.base_url), user_id],
            kwargs={
                "settings": settings.to_dict(),
                "max_pages": request.max_pages
            }
        )
        
        return {
            "success": True,
            "job_id": task.id,
            "status": "queued",
            "message": f"Website crawl queued for {request.base_url}"
        }
        
    except Exception as e:
        logger.error(f"Error queuing website crawl: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue website crawl: {str(e)}"
        )


@router.get("/job/{job_id}/status")
async def get_job_status(
    job_id: str,
    user_id: str = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get the status of a scraping job
    """
    try:
        from app.core.celery_app import celery_app
        
        # Get task result
        result = celery_app.AsyncResult(job_id)
        
        return {
            "job_id": job_id,
            "status": result.status,
            "state": result.state,
            "info": result.info if result.info else {},
            "ready": result.ready(),
            "successful": result.successful() if result.ready() else None,
            "result": result.result if result.successful() else None
        }
        
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get job status: {str(e)}"
        )


@router.post("/scrape/crawl", response_model=CrawlWebsiteResponse)
async def crawl_website(
    request: CrawlWebsiteRequest,
    background_tasks: BackgroundTasks,
    settings: ScraperSettings = Depends(get_user_scraper_settings),
    user_id: str = Depends(get_current_user)
):
    """
    Crawl an entire website starting from a URL
    
    Args:
        request: Website crawling request
        background_tasks: FastAPI background tasks
        settings: User's scraper settings
        user_id: Current user ID
        
    Returns:
        CrawlWebsiteResponse with all crawled pages
    """
    try:
        # Check rate limits for crawling (most expensive)
        await check_rate_limit(user_id, "website_crawl", count=request.max_pages)
        
        # Create scraper and crawl website
        async with SEOScraper(settings) as scraper:
            result = await scraper.crawl_website(
                str(request.start_url),
                max_pages=request.max_pages
            )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Website crawling failed")
            )
        
        # Convert results to response models
        scrape_responses = []
        for page_result in result.get("results", []):
            scrape_responses.append(ScrapeResponse(
                success=page_result.get("success", False),
                url=page_result.get("url", ""),
                timestamp=page_result.get("timestamp"),
                data=page_result.get("data"),
                metadata=page_result.get("metadata"),
                error=page_result.get("error")
            ))
        
        # TODO: Store crawl results in database
        # background_tasks.add_task(store_crawl_results, user_id, result)
        
        return CrawlWebsiteResponse(
            success=result["success"],
            start_url=result["start_url"],
            pages_crawled=result["pages_crawled"],
            timestamp=result.get("timestamp"),
            results=scrape_responses,
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error crawling website {request.start_url}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Website crawling failed: {str(e)}"
        )


@router.get("/settings", response_model=Dict[str, Any])
async def get_scraper_settings(
    user_id: str = Depends(get_current_user)
):
    """
    Get current user's scraper settings
    
    Args:
        user_id: Current user ID
        
    Returns:
        User's scraper settings
    """
    try:
        # TODO: Load from database
        settings = ScraperSettings.get_preset(ScraperMode.STANDARD)
        return settings.dict()
        
    except Exception as e:
        logger.error(f"Error getting scraper settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get settings: {str(e)}"
        )


@router.put("/settings", response_model=Dict[str, Any])
async def update_scraper_settings(
    settings: ScraperSettings,
    user_id: str = Depends(get_current_user)
):
    """
    Update user's scraper settings
    
    Args:
        settings: New scraper settings
        user_id: Current user ID
        
    Returns:
        Updated settings
    """
    try:
        # TODO: Save to database
        # await save_user_settings(user_id, settings)
        
        return settings.dict()
        
    except Exception as e:
        logger.error(f"Error updating scraper settings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.get("/settings/presets", response_model=Dict[str, Dict[str, Any]])
async def get_scraper_presets():
    """
    Get available scraper setting presets
    
    Returns:
        Dictionary of available presets
    """
    presets = {}
    for mode in ScraperMode:
        settings = ScraperSettings.get_preset(mode)
        presets[mode.value] = settings.dict()
    
    return presets


@router.get("/quota", response_model=Dict[str, Any])
async def get_user_quota(
    user_id: str = Depends(get_current_user)
):
    """
    Get user's scraping quota and usage
    
    Args:
        user_id: Current user ID
        
    Returns:
        User's quota information
    """
    try:
        # TODO: Implement quota tracking
        # quota = await get_user_quota_from_db(user_id)
        
        # Mock response for now
        return {
            "tier": "standard",
            "limits": {
                "pages_per_hour": 100,
                "concurrent_jobs": 3,
                "llm_requests_per_day": 10,
                "storage_gb": 5
            },
            "usage": {
                "pages_this_hour": 12,
                "active_jobs": 1,
                "llm_requests_today": 2,
                "storage_used_gb": 0.5
            },
            "reset_at": "2024-01-01T00:00:00Z"
        }
        
    except Exception as e:
        logger.error(f"Error getting user quota: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get quota: {str(e)}"
        )


@router.get("/history", response_model=Dict[str, Any])
async def get_scraping_history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user_id: str = Depends(get_current_user)
):
    """
    Get user's scraping history
    
    Args:
        limit: Number of records to return
        offset: Pagination offset
        user_id: Current user ID
        
    Returns:
        User's scraping history
    """
    try:
        # TODO: Load from database
        # history = await get_user_history(user_id, limit, offset)
        
        # Mock response for now
        return {
            "total": 0,
            "items": [],
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error getting scraping history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get history: {str(e)}"
        )