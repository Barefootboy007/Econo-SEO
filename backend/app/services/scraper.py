"""
Web scraping service using Crawl4AI for SEO analysis
Pure Crawl4AI implementation following Archon architecture
"""

import asyncio
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from urllib.parse import urlparse, urljoin
import logging
import hashlib

from crawl4ai import AsyncWebCrawler, BrowserConfig
from crawl4ai.extraction_strategy import (
    LLMExtractionStrategy,
    JsonCssExtractionStrategy,
    NoExtractionStrategy
)
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

from app.services.scraper_settings import ScraperSettings, ScraperMode

logger = logging.getLogger(__name__)


class SEOScraper:
    """SEO-focused web scraper using pure Crawl4AI"""
    
    def __init__(self, settings: Optional[ScraperSettings] = None):
        self.settings = settings or ScraperSettings.get_preset(ScraperMode.STANDARD)
        self.crawler = None
        self._browser_config = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        # Create browser config from settings
        self._browser_config = BrowserConfig(**self.settings.to_browser_config())
        
        # Initialize crawler with browser config
        self.crawler = AsyncWebCrawler(
            browser_config=self._browser_config,
            verbose=True
        )
        await self.crawler.__aenter__()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.crawler:
            await self.crawler.__aexit__(exc_type, exc_val, exc_tb)
    
    def _get_markdown_generator(self) -> DefaultMarkdownGenerator:
        """Get configured markdown generator following Archon pattern"""
        return DefaultMarkdownGenerator(
            content_source="html",
            options={
                "mark_code": True,
                "handle_code_in_pre": True,
                "body_width": 0,  # No line wrapping
                "skip_internal_links": False,
                "include_raw_html": False,
                "escape": False,
                "decode_unicode": True,
                "strip_empty_lines": False,
                "preserve_code_formatting": True
            }
        )
    
    def _get_seo_extraction_schema(self) -> Dict:
        """Define the JSON schema for SEO data extraction using CSS selectors"""
        return {
            "name": "SEO Data Extraction",
            "baseSelector": "html",
            "fields": [
                # Meta tags
                {
                    "name": "title",
                    "selector": "title",
                    "type": "text",
                    "description": "Page title"
                },
                {
                    "name": "meta_description",
                    "selector": "meta[name='description']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Meta description"
                },
                {
                    "name": "meta_keywords",
                    "selector": "meta[name='keywords']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Meta keywords"
                },
                {
                    "name": "meta_robots",
                    "selector": "meta[name='robots']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Robots meta tag"
                },
                {
                    "name": "canonical",
                    "selector": "link[rel='canonical']",
                    "type": "attribute",
                    "attribute": "href",
                    "description": "Canonical URL"
                },
                
                # Open Graph
                {
                    "name": "og_title",
                    "selector": "meta[property='og:title']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Open Graph title"
                },
                {
                    "name": "og_description",
                    "selector": "meta[property='og:description']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Open Graph description"
                },
                {
                    "name": "og_image",
                    "selector": "meta[property='og:image']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Open Graph image"
                },
                {
                    "name": "og_type",
                    "selector": "meta[property='og:type']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Open Graph type"
                },
                
                # Twitter Card
                {
                    "name": "twitter_card",
                    "selector": "meta[name='twitter:card']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Twitter card type"
                },
                {
                    "name": "twitter_title",
                    "selector": "meta[name='twitter:title']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Twitter title"
                },
                {
                    "name": "twitter_description",
                    "selector": "meta[name='twitter:description']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Twitter description"
                },
                
                # Headings
                {
                    "name": "h1_tags",
                    "selector": "h1",
                    "type": "list",
                    "description": "All H1 headings"
                },
                {
                    "name": "h2_tags",
                    "selector": "h2",
                    "type": "list",
                    "description": "All H2 headings"
                },
                {
                    "name": "h3_tags",
                    "selector": "h3",
                    "type": "list",
                    "description": "All H3 headings"
                },
                
                # Images
                {
                    "name": "images",
                    "selector": "img",
                    "type": "nested_list",
                    "fields": [
                        {
                            "name": "src",
                            "type": "attribute",
                            "attribute": "src"
                        },
                        {
                            "name": "alt",
                            "type": "attribute",
                            "attribute": "alt"
                        },
                        {
                            "name": "title",
                            "type": "attribute",
                            "attribute": "title"
                        },
                        {
                            "name": "width",
                            "type": "attribute",
                            "attribute": "width"
                        },
                        {
                            "name": "height",
                            "type": "attribute",
                            "attribute": "height"
                        }
                    ],
                    "description": "All images with attributes"
                },
                
                # Links
                {
                    "name": "links",
                    "selector": "a[href]",
                    "type": "nested_list",
                    "fields": [
                        {
                            "name": "href",
                            "type": "attribute",
                            "attribute": "href"
                        },
                        {
                            "name": "text",
                            "type": "text"
                        },
                        {
                            "name": "rel",
                            "type": "attribute",
                            "attribute": "rel"
                        },
                        {
                            "name": "target",
                            "type": "attribute",
                            "attribute": "target"
                        }
                    ],
                    "description": "All links"
                },
                
                # Structured data
                {
                    "name": "structured_data",
                    "selector": "script[type='application/ld+json']",
                    "type": "list",
                    "description": "JSON-LD structured data"
                },
                
                # Technical SEO
                {
                    "name": "viewport",
                    "selector": "meta[name='viewport']",
                    "type": "attribute",
                    "attribute": "content",
                    "description": "Viewport meta tag"
                },
                {
                    "name": "charset",
                    "selector": "meta[charset]",
                    "type": "attribute",
                    "attribute": "charset",
                    "description": "Charset meta tag"
                },
                {
                    "name": "lang",
                    "selector": "html",
                    "type": "attribute",
                    "attribute": "lang",
                    "description": "HTML lang attribute"
                }
            ]
        }
    
    async def scrape_url(self, url: str, custom_settings: Optional[Dict] = None, progress_callback=None) -> Dict[str, Any]:
        """
        Scrape a single URL and extract SEO-relevant data using pure Crawl4AI
        
        Args:
            url: The URL to scrape
            custom_settings: Optional custom scraping settings
            
        Returns:
            Dictionary containing scraped data and SEO metrics
        """
        try:
            # Get crawl config from settings
            crawl_config = self.settings.to_crawl_config()
            
            # Apply custom settings if provided
            if custom_settings:
                crawl_config.update(custom_settings)
            
            # Create extraction strategy for SEO data
            extraction_strategy = JsonCssExtractionStrategy(
                schema=self._get_seo_extraction_schema(),
                verbose=True
            )
            
            # Add markdown generator if enabled
            if self.settings.extract_markdown:
                crawl_config["markdown_generator"] = self._get_markdown_generator()
            
            # Perform the crawl with Crawl4AI
            result = await self.crawler.arun(
                url=url,
                extraction_strategy=extraction_strategy,
                **crawl_config
            )
            
            if not result.success:
                return {
                    "success": False,
                    "error": result.error_message or "Failed to scrape URL",
                    "url": url
                }
            
            # Parse the extracted data
            extracted_data = {}
            if result.extracted_content:
                try:
                    extracted_data = json.loads(result.extracted_content)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse extracted content for {url}")
            
            # Process and organize the data
            seo_data = await self._process_seo_data(url, extracted_data, result)
            
            return {
                "success": True,
                "url": url,
                "timestamp": datetime.utcnow().isoformat(),
                "data": seo_data,
                "metadata": {
                    "raw_html_length": len(result.html) if result.html else 0,
                    "cleaned_text_length": len(result.cleaned_text) if result.cleaned_text else 0,
                    "load_time": result.metadata.get("load_time", 0) if result.metadata else 0,
                    "content_hash": hashlib.md5(result.html.encode()).hexdigest() if result.html else None,
                },
                "screenshot": result.screenshot if self.settings.screenshot and hasattr(result, 'screenshot') else None,
            }
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "url": url
            }
    
    async def _process_seo_data(self, url: str, extracted_data: Dict, result) -> Dict[str, Any]:
        """Process and organize SEO data from extraction"""
        
        # Parse URL for domain info
        parsed_url = urlparse(url)
        base_domain = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        # Process links to separate internal and external
        links = extracted_data.get('links', [])
        internal_links = []
        external_links = []
        nofollow_links = []
        
        for link in links:
            href = link.get('href', '')
            rel = link.get('rel', '')
            
            if 'nofollow' in rel:
                nofollow_links.append(link)
            
            if href:
                # Normalize relative URLs
                if href.startswith('/'):
                    link['href'] = urljoin(base_domain, href)
                    internal_links.append(link)
                elif href.startswith('http'):
                    if parsed_url.netloc in href:
                        internal_links.append(link)
                    else:
                        external_links.append(link)
                elif href.startswith('#'):
                    # Anchor links
                    continue
                else:
                    # Relative path
                    link['href'] = urljoin(url, href)
                    internal_links.append(link)
        
        # Process images for SEO analysis
        images = extracted_data.get('images', [])
        images_without_alt = [img for img in images if not img.get('alt')]
        large_images = [img for img in images if 
                       (img.get('width') and int(img.get('width', 0)) > 1200) or
                       (img.get('height') and int(img.get('height', 0)) > 1200)]
        
        # Process structured data
        structured_data = []
        for script_content in extracted_data.get('structured_data', []):
            try:
                data = json.loads(script_content)
                structured_data.append(data)
            except:
                pass
        
        # Count headings
        h1_tags = extracted_data.get('h1_tags', [])
        h2_tags = extracted_data.get('h2_tags', [])
        h3_tags = extracted_data.get('h3_tags', [])
        
        # Build comprehensive SEO analysis
        return {
            "meta": {
                "title": extracted_data.get('title'),
                "title_length": len(extracted_data.get('title', '')),
                "description": extracted_data.get('meta_description'),
                "description_length": len(extracted_data.get('meta_description', '') or ''),
                "keywords": extracted_data.get('meta_keywords'),
                "robots": extracted_data.get('meta_robots'),
                "canonical": extracted_data.get('canonical'),
            },
            "open_graph": {
                "title": extracted_data.get('og_title'),
                "description": extracted_data.get('og_description'),
                "image": extracted_data.get('og_image'),
                "type": extracted_data.get('og_type'),
            },
            "twitter_card": {
                "card": extracted_data.get('twitter_card'),
                "title": extracted_data.get('twitter_title'),
                "description": extracted_data.get('twitter_description'),
            },
            "headings": {
                "h1": h1_tags[:5],  # First 5 H1s
                "h2": h2_tags[:10],  # First 10 H2s
                "h3": h3_tags[:10],  # First 10 H3s
                "h1_count": len(h1_tags),
                "h2_count": len(h2_tags),
                "h3_count": len(h3_tags),
                "multiple_h1": len(h1_tags) > 1,  # SEO issue flag
            },
            "images": {
                "total": len(images),
                "without_alt": len(images_without_alt),
                "large_images": len(large_images),
                "alt_coverage_percentage": ((len(images) - len(images_without_alt)) / len(images) * 100) if images else 100,
                "samples": images[:5]  # Sample of first 5 images
            },
            "links": {
                "internal": {
                    "count": len(internal_links),
                    "urls": internal_links[:20]  # First 20
                },
                "external": {
                    "count": len(external_links),
                    "urls": external_links[:20]  # First 20
                },
                "nofollow": {
                    "count": len(nofollow_links),
                    "urls": nofollow_links[:10]  # First 10
                },
                "total": len(links),
            },
            "structured_data": {
                "found": len(structured_data) > 0,
                "types": [d.get('@type') for d in structured_data if isinstance(d, dict) and '@type' in d],
                "data": structured_data[:5],  # First 5 items
            },
            "content": {
                "word_count": len(result.cleaned_text.split()) if result.cleaned_text else 0,
                "markdown": result.markdown[:10000] if result.markdown else None,  # First 10K chars
            },
            "technical": {
                "has_viewport_meta": bool(extracted_data.get('viewport')),
                "viewport": extracted_data.get('viewport'),
                "has_charset_meta": bool(extracted_data.get('charset')),
                "charset": extracted_data.get('charset'),
                "has_lang_attribute": bool(extracted_data.get('lang')),
                "lang": extracted_data.get('lang'),
                "mobile_friendly": bool(extracted_data.get('viewport')) and 'width=device-width' in (extracted_data.get('viewport') or ''),
            },
            "media": {
                "images": result.media.get("images", [])[:10] if result.media else [],
                "videos": result.media.get("videos", [])[:10] if result.media else [],
                "audios": result.media.get("audios", [])[:10] if result.media else [],
            } if self.settings.extract_media else None,
            "performance": {
                "load_time": result.metadata.get("load_time", 0) if result.metadata else 0,
                "page_size": len(result.html) if result.html else 0,
            }
        }
    
    async def scrape_with_llm(self, url: str, extraction_prompt: str, model: str = "gpt-4o-mini") -> Dict[str, Any]:
        """
        Scrape a URL and extract specific information using LLM
        
        Args:
            url: The URL to scrape
            extraction_prompt: Custom prompt for LLM extraction
            model: LLM model to use
            
        Returns:
            Dictionary containing extracted data
        """
        try:
            # Use LLM extraction strategy for custom extraction
            extraction_strategy = LLMExtractionStrategy(
                provider="openai",
                model=model,
                instruction=extraction_prompt,
                verbose=True
            )
            
            # Get crawl config
            crawl_config = self.settings.to_crawl_config()
            
            result = await self.crawler.arun(
                url=url,
                extraction_strategy=extraction_strategy,
                **crawl_config
            )
            
            if not result.success:
                return {
                    "success": False,
                    "error": result.error_message or "Failed to scrape URL",
                    "url": url
                }
            
            # Parse the LLM extracted content
            extracted_data = {}
            if result.extracted_content:
                try:
                    extracted_data = json.loads(result.extracted_content)
                except json.JSONDecodeError:
                    extracted_data = {"raw_extraction": result.extracted_content}
            
            return {
                "success": True,
                "url": url,
                "timestamp": datetime.utcnow().isoformat(),
                "extracted_data": extracted_data,
                "metadata": {
                    "extraction_prompt": extraction_prompt,
                    "model": model,
                    "word_count": len(result.cleaned_text.split()) if result.cleaned_text else 0,
                }
            }
            
        except Exception as e:
            logger.error(f"Error in LLM extraction for {url}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "url": url
            }
    
    async def crawl_website(self, start_url: str, max_pages: int = 10, follow_links: bool = True) -> Dict[str, Any]:
        """
        Crawl an entire website starting from a URL
        
        Args:
            start_url: The starting URL
            max_pages: Maximum number of pages to crawl
            follow_links: Whether to follow internal links
            
        Returns:
            Dictionary containing all crawled pages data
        """
        crawled_urls = set()
        to_crawl = [start_url]
        results = []
        
        parsed_start = urlparse(start_url)
        base_domain = f"{parsed_start.scheme}://{parsed_start.netloc}"
        
        while to_crawl and len(crawled_urls) < max_pages:
            url = to_crawl.pop(0)
            
            if url in crawled_urls:
                continue
            
            # Add delay between requests if configured
            if self.settings.delay_between_requests > 0 and crawled_urls:
                await asyncio.sleep(self.settings.delay_between_requests / 1000)
            
            # Scrape the page
            result = await self.scrape_url(url)
            crawled_urls.add(url)
            results.append(result)
            
            # Extract internal links for further crawling
            if follow_links and result.get("success") and result.get("data"):
                internal_links = result["data"]["links"]["internal"]["urls"]
                for link in internal_links:
                    link_url = link.get("href") if isinstance(link, dict) else link
                    if link_url and link_url not in crawled_urls and link_url not in to_crawl:
                        # Only crawl links from the same domain
                        if base_domain in link_url:
                            to_crawl.append(link_url)
        
        return {
            "success": True,
            "start_url": start_url,
            "pages_crawled": len(results),
            "timestamp": datetime.utcnow().isoformat(),
            "results": results,
            "discovered_urls": len(crawled_urls) + len(to_crawl),
        }
    
    async def bulk_scrape(self, urls: List[str], max_concurrent: int = 3) -> List[Dict[str, Any]]:
        """
        Scrape multiple URLs concurrently using Crawl4AI
        
        Args:
            urls: List of URLs to scrape
            max_concurrent: Maximum number of concurrent scrapes
            
        Returns:
            List of scraping results
        """
        semaphore = asyncio.Semaphore(max_concurrent)
        
        async def scrape_with_semaphore(url):
            async with semaphore:
                # Add delay between concurrent requests if configured
                if self.settings.delay_between_requests > 0:
                    await asyncio.sleep(self.settings.delay_between_requests / 1000)
                return await self.scrape_url(url)
        
        tasks = [scrape_with_semaphore(url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        return results
    
    async def scrape_website(self, base_url: str, progress_callback=None) -> Dict[str, Any]:
        """
        Scrape an entire website with progress tracking
        
        Args:
            base_url: Base URL of the website to scrape
            progress_callback: Optional async callback for progress updates
            
        Returns:
            Dictionary with scraping results
        """
        from urllib.parse import urlparse, urljoin
        
        parsed = urlparse(base_url)
        domain = parsed.netloc
        
        # Track visited URLs to avoid duplicates
        visited = set()
        to_visit = {base_url}
        results = []
        errors = []
        
        max_pages = self.settings.max_pages
        pages_scraped = 0
        
        # Initial progress update
        if progress_callback:
            await progress_callback(0, max_pages, f"Starting to scrape {domain}")
        
        while to_visit and pages_scraped < max_pages:
            url = to_visit.pop()
            
            if url in visited:
                continue
                
            visited.add(url)
            
            try:
                # Update progress
                if progress_callback:
                    await progress_callback(
                        pages_scraped,
                        max_pages,
                        f"Scraping page {pages_scraped + 1}/{max_pages}",
                        url
                    )
                
                # Scrape the page
                result = await self.scrape_url(url)
                results.append(result)
                pages_scraped += 1
                
                # Extract links if we should follow them
                if self.settings.follow_links and result.get("links"):
                    for link in result["links"]:
                        # Only follow internal links
                        if domain in link and link not in visited:
                            to_visit.add(link)
                
                # Add delay between requests
                if self.settings.request_delay > 0:
                    await asyncio.sleep(self.settings.request_delay)
                    
            except Exception as e:
                logger.error(f"Error scraping {url}: {e}")
                errors.append({"url": url, "error": str(e)})
        
        # Final progress update
        if progress_callback:
            await progress_callback(
                pages_scraped,
                pages_scraped,
                f"Completed scraping {domain}",
                None
            )
        
        return {
            "success": len(errors) == 0,
            "domain": domain,
            "pages_scraped": pages_scraped,
            "total_pages": len(visited),
            "pages": results,
            "errors": errors
        }