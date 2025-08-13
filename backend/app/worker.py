"""
Celery worker entry point
Run with: celery -A app.worker worker --loglevel=info
"""

import os
import sys
from pathlib import Path

# Add parent directory to path so we can import app
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.celery_app import celery_app
from app.core.config import settings

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == '__main__':
    print(f"Starting Celery worker for {settings.PROJECT_NAME}")
    print(f"Redis URL: {os.getenv('REDIS_URL', 'redis://localhost:6379/0')}")
    
    # Start the worker
    celery_app.start()