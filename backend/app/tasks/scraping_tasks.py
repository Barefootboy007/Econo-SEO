"""
Celery tasks for web scraping operations
Integrates with Crawl4AI and WebSocket for real-time updates
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from celery import Task
from celery.signals import task_prerun, task_postrun, task_failure
import logging

from app.core.celery_app import celery_app
from app.core.websocket import emit_scraping_progress, emit_scraping_complete, emit_scraping_error
from app.services.scraper import SEOScraper
from app.services.scraper_settings import ScraperSettings, ScraperMode
from app.core.supabase import get_supabase_client
from app.core.rate_limit import check_rate_limit

logger = logging.getLogger(__name__)


class ScrapingTask(Task):
    """Base class for scraping tasks with progress tracking"""
    
    def __init__(self):
        super().__init__()
        self.start_time = None
    
    def before_start(self, task_id, args, kwargs):
        """Called before task execution starts"""
        self.start_time = datetime.utcnow()
        logger.info(f"Starting task {task_id} at {self.start_time}")
    
    def on_success(self, retval, task_id, args, kwargs):
        """Called on successful task completion"""
        duration = (datetime.utcnow() - self.start_time).total_seconds() if self.start_time else None
        logger.info(f"Task {task_id} completed successfully in {duration:.2f}s")
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called on task failure"""
        logger.error(f"Task {task_id} failed: {exc}")


@celery_app.task(
    bind=True,
    base=ScrapingTask,
    name="app.tasks.scraping_tasks.scrape_single_url",
    max_retries=3,
    default_retry_delay=60
)
def scrape_single_url(
    self,
    url: str,
    user_id: str,
    settings: Optional[Dict] = None,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Scrape a single URL
    
    Args:
        url: URL to scrape
        user_id: User ID for rate limiting and data storage
        settings: Scraper settings dictionary
        job_id: Optional job ID for tracking
    
    Returns:
        Scraping result dictionary
    """
    job_id = job_id or self.request.id
    
    try:
        # Check rate limit
        asyncio.run(check_rate_limit(user_id, "scrape", 1))
        
        # Update task state
        self.update_state(
            state="PROCESSING",
            meta={
                "current": 0,
                "total": 1,
                "status": f"Starting to scrape {url}"
            }
        )
        
        # Emit WebSocket progress
        asyncio.run(emit_scraping_progress(
            job_id=job_id,
            progress=0,
            status="processing",
            message=f"Starting to scrape {url}",
            current_url=url,
            pages_scraped=0,
            total_pages=1
        ))
        
        # Create scraper with settings
        scraper_settings = ScraperSettings.from_dict(settings) if settings else ScraperSettings.get_preset(ScraperMode.STANDARD)
        
        # Run scraping in async context
        result = asyncio.run(_async_scrape_url(url, scraper_settings, job_id))
        
        # Store in database
        supabase = get_supabase_client()
        
        # Store page data
        page_data = {
            "url": url,
            "user_id": user_id,
            "title": result.get("title"),
            "meta_description": result.get("seo_data", {}).get("meta_description"),
            "word_count": result.get("word_count"),
            "status": "completed",
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database (simplified for now)
        # supabase.table("pages").insert(page_data).execute()
        
        # Emit completion
        asyncio.run(emit_scraping_complete(
            job_id=job_id,
            success=True,
            pages_scraped=1,
            total_pages=1
        ))
        
        return {
            "success": True,
            "job_id": job_id,
            "url": url,
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        
        # Emit error via WebSocket
        asyncio.run(emit_scraping_error(
            job_id=job_id,
            error=str(e),
            error_type="scraping_error"
        ))
        
        # Retry if possible
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))
        
        return {
            "success": False,
            "job_id": job_id,
            "url": url,
            "error": str(e)
        }


@celery_app.task(
    bind=True,
    base=ScrapingTask,
    name="app.tasks.scraping_tasks.scrape_website",
    max_retries=3,
    default_retry_delay=120
)
def scrape_website(
    self,
    website_url: str,
    user_id: str,
    settings: Optional[Dict] = None,
    max_pages: int = 50,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Scrape an entire website
    
    Args:
        website_url: Base URL of the website
        user_id: User ID for rate limiting and data storage
        settings: Scraper settings dictionary
        max_pages: Maximum number of pages to scrape
        job_id: Optional job ID for tracking
    
    Returns:
        Scraping result dictionary
    """
    job_id = job_id or self.request.id
    
    try:
        # Check rate limit
        asyncio.run(check_rate_limit(user_id, "website_crawl", max_pages))
        
        # Create scraper with settings
        scraper_settings = ScraperSettings.from_dict(settings) if settings else ScraperSettings.get_preset(ScraperMode.STANDARD)
        scraper_settings.max_pages = max_pages
        
        # Run website scraping in async context
        result = asyncio.run(_async_scrape_website(
            website_url,
            scraper_settings,
            job_id,
            self,
            user_id
        ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error scraping website {website_url}: {e}")
        
        # Emit error via WebSocket
        asyncio.run(emit_scraping_error(
            job_id=job_id,
            error=str(e),
            error_type="website_scraping_error"
        ))
        
        # Retry if possible
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=120 * (self.request.retries + 1))
        
        return {
            "success": False,
            "job_id": job_id,
            "website_url": website_url,
            "error": str(e)
        }


@celery_app.task(
    bind=True,
    base=ScrapingTask,
    name="app.tasks.scraping_tasks.scrape_bulk_urls",
    max_retries=2,
    default_retry_delay=180
)
def scrape_bulk_urls(
    self,
    urls: List[str],
    user_id: str,
    settings: Optional[Dict] = None,
    job_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Scrape multiple URLs in bulk
    
    Args:
        urls: List of URLs to scrape
        user_id: User ID for rate limiting and data storage
        settings: Scraper settings dictionary
        job_id: Optional job ID for tracking
    
    Returns:
        Scraping results dictionary
    """
    job_id = job_id or self.request.id
    total_urls = len(urls)
    
    try:
        # Check rate limit
        asyncio.run(check_rate_limit(user_id, "bulk_scrape", total_urls))
        
        # Create scraper with settings
        scraper_settings = ScraperSettings.from_dict(settings) if settings else ScraperSettings.get_preset(ScraperMode.STANDARD)
        
        results = []
        successful = 0
        failed = 0
        
        for idx, url in enumerate(urls):
            try:
                # Update progress
                progress = int((idx / total_urls) * 100)
                
                self.update_state(
                    state="PROCESSING",
                    meta={
                        "current": idx,
                        "total": total_urls,
                        "status": f"Scraping {url}"
                    }
                )
                
                # Emit WebSocket progress
                asyncio.run(emit_scraping_progress(
                    job_id=job_id,
                    progress=progress,
                    status="processing",
                    message=f"Scraping URL {idx + 1} of {total_urls}",
                    current_url=url,
                    pages_scraped=successful,
                    total_pages=total_urls
                ))
                
                # Scrape URL
                result = asyncio.run(_async_scrape_url(url, scraper_settings, job_id))
                results.append({
                    "url": url,
                    "success": True,
                    "data": result
                })
                successful += 1
                
            except Exception as e:
                logger.error(f"Error scraping {url}: {e}")
                results.append({
                    "url": url,
                    "success": False,
                    "error": str(e)
                })
                failed += 1
        
        # Emit completion
        asyncio.run(emit_scraping_complete(
            job_id=job_id,
            success=failed == 0,
            pages_scraped=successful,
            total_pages=total_urls
        ))
        
        return {
            "success": failed == 0,
            "job_id": job_id,
            "total": total_urls,
            "successful": successful,
            "failed": failed,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in bulk scraping: {e}")
        
        # Emit error via WebSocket
        asyncio.run(emit_scraping_error(
            job_id=job_id,
            error=str(e),
            error_type="bulk_scraping_error"
        ))
        
        return {
            "success": False,
            "job_id": job_id,
            "error": str(e)
        }


# Async helper functions
async def _async_scrape_url(url: str, settings: ScraperSettings, job_id: str) -> Dict[str, Any]:
    """Async helper to scrape a single URL"""
    async with SEOScraper(settings) as scraper:
        result = await scraper.scrape_url(url)
        return result


async def _async_scrape_website(
    website_url: str,
    settings: ScraperSettings,
    job_id: str,
    task: Task,
    user_id: str
) -> Dict[str, Any]:
    """Async helper to scrape an entire website with progress tracking"""
    
    async def progress_callback(current: int, total: int, message: str, current_url: str = None):
        """Callback for progress updates"""
        progress = int((current / total) * 100) if total > 0 else 0
        
        # Update Celery task state
        task.update_state(
            state="PROCESSING",
            meta={
                "current": current,
                "total": total,
                "status": message
            }
        )
        
        # Emit WebSocket progress
        await emit_scraping_progress(
            job_id=job_id,
            progress=progress,
            status="processing",
            message=message,
            current_url=current_url,
            pages_scraped=current,
            total_pages=total
        )
    
    try:
        async with SEOScraper(settings) as scraper:
            # Discover and scrape pages
            result = await scraper.scrape_website(
                website_url,
                progress_callback=progress_callback
            )
            
            # Store results in database
            supabase = get_supabase_client()
            
            # Create website entry
            website_data = {
                "user_id": user_id,
                "url": website_url,
                "domain": result.get("domain"),
                "total_pages": result.get("total_pages", 0),
                "pages_scraped": result.get("pages_scraped", 0),
                "status": "completed" if result.get("success") else "failed",
                "scrape_completed_at": datetime.utcnow().isoformat()
            }
            
            # Insert website data (simplified for now)
            # website_result = supabase.table("websites").insert(website_data).execute()
            # website_id = website_result.data[0]["id"]
            
            # Store individual pages
            # for page in result.get("pages", []):
            #     page_data = {
            #         "website_id": website_id,
            #         "user_id": user_id,
            #         "url": page["url"],
            #         ...
            #     }
            #     supabase.table("pages").insert(page_data).execute()
            
            # Emit completion
            await emit_scraping_complete(
                job_id=job_id,
                success=result.get("success", False),
                pages_scraped=result.get("pages_scraped", 0),
                total_pages=result.get("total_pages", 0)
            )
            
            return {
                "success": result.get("success", False),
                "job_id": job_id,
                "website_url": website_url,
                "pages_scraped": result.get("pages_scraped", 0),
                "total_pages": result.get("total_pages", 0),
                "data": result
            }
            
    except Exception as e:
        logger.error(f"Error in async website scraping: {e}")
        raise