"""
Pydantic models for scraping API
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime


class ScrapeRequest(BaseModel):
    """Request model for single URL scraping"""
    url: HttpUrl
    js_enabled: bool = True
    wait_for: int = Field(default=2, ge=0, le=30)
    screenshot: bool = False
    extract_media: bool = False
    bypass_cloudflare: bool = True
    page_timeout: int = Field(default=30000, ge=5000, le=120000)


class BulkScrapeRequest(BaseModel):
    """Request model for bulk URL scraping"""
    urls: List[HttpUrl] = Field(min_items=1, max_items=50)
    max_concurrent: int = Field(default=3, ge=1, le=10)
    options: Optional[Dict[str, Any]] = None


class LLMScrapeRequest(BaseModel):
    """Request model for LLM-based extraction"""
    url: HttpUrl
    extraction_prompt: str = Field(min_length=10, max_length=2000)
    js_enabled: bool = True


class CrawlWebsiteRequest(BaseModel):
    """Request model for website crawling"""
    start_url: HttpUrl
    max_pages: int = Field(default=10, ge=1, le=100)


class SEOMetaData(BaseModel):
    """SEO meta data model"""
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[str] = None
    robots: Optional[str] = None
    canonical: Optional[str] = None


class OpenGraphData(BaseModel):
    """Open Graph data model"""
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None


class HeadingsData(BaseModel):
    """Headings analysis data"""
    h1: List[str] = []
    h2: List[str] = []
    h3: List[str] = []
    h1_count: int = 0
    h2_count: int = 0
    h3_count: int = 0


class ImagesData(BaseModel):
    """Images analysis data"""
    total: int = 0
    without_alt: int = 0
    alt_coverage_percentage: float = 100.0
    samples: List[Dict[str, Any]] = []


class LinksData(BaseModel):
    """Links analysis data"""
    internal: Dict[str, Any] = {"count": 0, "urls": []}
    external: Dict[str, Any] = {"count": 0, "urls": []}
    total: int = 0


class ContentData(BaseModel):
    """Content analysis data"""
    word_count: int = 0
    markdown: Optional[str] = None


class TechnicalData(BaseModel):
    """Technical SEO data"""
    has_viewport_meta: bool = False
    viewport: Optional[str] = None
    has_charset_meta: bool = False
    charset: Optional[str] = None
    has_lang_attribute: bool = False
    lang: Optional[str] = None


class MediaData(BaseModel):
    """Media content data"""
    images: List[str] = []
    videos: List[str] = []
    audios: List[str] = []


class SEOAnalysisData(BaseModel):
    """Complete SEO analysis data"""
    meta: SEOMetaData
    open_graph: OpenGraphData
    headings: HeadingsData
    images: ImagesData
    links: LinksData
    structured_data: List[Dict[str, Any]] = []
    content: ContentData
    technical: TechnicalData
    media: MediaData
    screenshot: Optional[str] = None


class ScrapeMetadata(BaseModel):
    """Scraping metadata"""
    raw_html_length: int = 0
    cleaned_text_length: int = 0
    load_time: float = 0
    crawl4ai_version: Optional[str] = None


class ScrapeResponse(BaseModel):
    """Response model for scraping operations"""
    success: bool
    url: str
    timestamp: Optional[datetime] = None
    data: Optional[SEOAnalysisData] = None
    metadata: Optional[ScrapeMetadata] = None
    error: Optional[str] = None


class BulkScrapeResponse(BaseModel):
    """Response model for bulk scraping"""
    results: List[ScrapeResponse]
    total_urls: int
    successful: int
    failed: int


class LLMScrapeResponse(BaseModel):
    """Response model for LLM extraction"""
    success: bool
    url: str
    timestamp: Optional[datetime] = None
    extracted_data: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class CrawlWebsiteResponse(BaseModel):
    """Response model for website crawling"""
    success: bool
    start_url: str
    pages_crawled: int
    timestamp: Optional[datetime] = None
    results: List[ScrapeResponse] = []
    error: Optional[str] = None