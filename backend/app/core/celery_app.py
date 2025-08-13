"""
Celery configuration for background task processing
Handles scraping jobs, SEO processing, and export tasks
"""

import os
from celery import Celery
from app.core.config import settings

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery instance
celery_app = Celery(
    "seo_optimizer",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "app.tasks.scraping_tasks",
        "app.tasks.seo_tasks",
        "app.tasks.export_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task execution settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task tracking
    task_track_started=True,
    task_send_sent_event=True,
    
    # Task time limits
    task_time_limit=30 * 60,  # 30 minutes hard limit
    task_soft_time_limit=25 * 60,  # 25 minutes soft limit
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    worker_disable_rate_limits=False,
    
    # Result backend settings
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,
    
    # Task routing
    task_routes={
        "app.tasks.scraping_tasks.*": {"queue": "scraping"},
        "app.tasks.seo_tasks.*": {"queue": "seo"},
        "app.tasks.export_tasks.*": {"queue": "export"},
    },
    
    # Task priorities (0-9, where 0 is highest priority)
    task_default_priority=5,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    
    # Beat schedule for periodic tasks (if needed)
    beat_schedule={
        # Example: Clean up old jobs every day at midnight
        # "cleanup-old-jobs": {
        #     "task": "app.tasks.maintenance.cleanup_old_jobs",
        #     "schedule": crontab(hour=0, minute=0),
        # },
    },
    
    # Error handling
    task_reject_on_worker_lost=True,
    task_ignore_result=False,
)

# Configure task priorities
celery_app.conf.task_annotations = {
    "app.tasks.scraping_tasks.scrape_single_url": {"priority": 7},
    "app.tasks.scraping_tasks.scrape_website": {"priority": 5},
    "app.tasks.scraping_tasks.scrape_bulk_urls": {"priority": 3},
    "app.tasks.seo_tasks.process_seo_optimization": {"priority": 6},
    "app.tasks.export_tasks.export_to_csv": {"priority": 4},
}

# Task rate limits (per minute)
celery_app.conf.task_annotations.update({
    "app.tasks.scraping_tasks.scrape_single_url": {"rate_limit": "60/m"},
    "app.tasks.scraping_tasks.scrape_website": {"rate_limit": "10/m"},
    "app.tasks.scraping_tasks.scrape_bulk_urls": {"rate_limit": "5/m"},
})


def create_celery_app() -> Celery:
    """Factory function to create Celery app"""
    return celery_app


# Helper function for testing Celery connection
def test_celery_connection():
    """Test if Celery can connect to Redis broker"""
    try:
        # Try to inspect active workers
        inspector = celery_app.control.inspect()
        stats = inspector.stats()
        
        if stats:
            print(f"✅ Celery connected successfully. Active workers: {list(stats.keys())}")
            return True
        else:
            print("⚠️ Celery connected but no active workers found. Start a worker with: celery -A app.core.celery_app worker")
            return False
            
    except Exception as e:
        print(f"❌ Failed to connect to Celery/Redis: {e}")
        print(f"   Make sure Redis is running on {REDIS_URL}")
        return False


if __name__ == "__main__":
    # Test connection when module is run directly
    test_celery_connection()