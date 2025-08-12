"""
Scraper settings and configuration
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


class BrowserType(str, Enum):
    """Browser types for scraping"""
    CHROMIUM = "chromium"
    FIREFOX = "firefox"
    WEBKIT = "webkit"


class ScraperMode(str, Enum):
    """Scraping modes"""
    FAST = "fast"  # No JS, basic HTML
    STANDARD = "standard"  # JS enabled, standard wait
    THOROUGH = "thorough"  # JS enabled, comprehensive wait
    STEALTH = "stealth"  # Anti-detection measures


class ProxyType(str, Enum):
    """Proxy types"""
    NONE = "none"
    DATACENTER = "datacenter"
    RESIDENTIAL = "residential"
    CUSTOM = "custom"


class ScraperSettings(BaseModel):
    """Configurable scraper settings"""
    
    # Browser settings
    browser_type: BrowserType = BrowserType.CHROMIUM
    headless: bool = True
    viewport_width: int = Field(default=1920, ge=800, le=3840)
    viewport_height: int = Field(default=1080, ge=600, le=2160)
    user_agent: Optional[str] = None
    
    # JavaScript settings
    js_enabled: bool = True
    wait_for_selector: Optional[str] = None
    wait_for_timeout: int = Field(default=2000, ge=0, le=30000)
    
    # Anti-detection settings
    bypass_cloudflare: bool = True
    remove_overlay: bool = True
    disable_web_security: bool = False
    stealth_mode: bool = False
    
    # Performance settings
    page_timeout: int = Field(default=30000, ge=5000, le=120000)
    screenshot: bool = False
    extract_media: bool = False
    cache_enabled: bool = True
    
    # Proxy settings
    proxy_type: ProxyType = ProxyType.NONE
    proxy_url: Optional[str] = None
    proxy_username: Optional[str] = None
    proxy_password: Optional[str] = None
    
    # Content extraction
    extract_markdown: bool = True
    extract_links: bool = True
    extract_images: bool = True
    extract_structured_data: bool = True
    
    # Rate limiting
    delay_between_requests: int = Field(default=1000, ge=0, le=10000)
    max_retries: int = Field(default=3, ge=0, le=10)
    
    def to_browser_config(self) -> Dict[str, Any]:
        """Convert to Crawl4AI browser config"""
        config = {
            "headless": self.headless,
            "verbose": False,
            "viewport_width": self.viewport_width,
            "viewport_height": self.viewport_height,
            "browser_type": self.browser_type.value,
        }
        
        if self.user_agent:
            config["user_agent"] = self.user_agent
        else:
            config["user_agent"] = self._get_default_user_agent()
        
        # Add extra args for stealth and anti-detection
        extra_args = []
        if self.stealth_mode or self.bypass_cloudflare:
            extra_args.extend([
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ])
        
        if self.disable_web_security:
            extra_args.extend([
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ])
        
        if extra_args:
            config["extra_args"] = extra_args
        
        return config
    
    def to_crawl_config(self) -> Dict[str, Any]:
        """Convert to Crawl4AI crawl config"""
        config = {
            "js_enabled": self.js_enabled,
            "wait_for": self.wait_for_timeout / 1000,  # Convert to seconds
            "remove_overlay": self.remove_overlay,
            "bypass_cloudflare": self.bypass_cloudflare,
            "page_timeout": self.page_timeout,
            "screenshot": self.screenshot,
            "extract_media": self.extract_media,
            "cache_enabled": self.cache_enabled,
        }
        
        if self.wait_for_selector:
            config["wait_for_selector"] = self.wait_for_selector
        
        if self.proxy_url:
            config["proxy"] = self._get_proxy_config()
        
        return config
    
    def _get_default_user_agent(self) -> str:
        """Get default user agent based on browser type"""
        user_agents = {
            BrowserType.CHROMIUM: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            BrowserType.FIREFOX: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            BrowserType.WEBKIT: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
        }
        return user_agents.get(self.browser_type, user_agents[BrowserType.CHROMIUM])
    
    def _get_proxy_config(self) -> Dict[str, Any]:
        """Get proxy configuration"""
        if not self.proxy_url:
            return {}
        
        config = {"server": self.proxy_url}
        if self.proxy_username and self.proxy_password:
            config["username"] = self.proxy_username
            config["password"] = self.proxy_password
        
        return config
    
    @classmethod
    def get_preset(cls, mode: ScraperMode) -> "ScraperSettings":
        """Get preset settings for a scraping mode"""
        presets = {
            ScraperMode.FAST: cls(
                js_enabled=False,
                headless=True,
                screenshot=False,
                extract_media=False,
                wait_for_timeout=0,
                page_timeout=10000,
                cache_enabled=True,
            ),
            ScraperMode.STANDARD: cls(
                js_enabled=True,
                headless=True,
                screenshot=False,
                extract_media=False,
                wait_for_timeout=2000,
                page_timeout=30000,
                cache_enabled=True,
            ),
            ScraperMode.THOROUGH: cls(
                js_enabled=True,
                headless=True,
                screenshot=True,
                extract_media=True,
                wait_for_timeout=5000,
                page_timeout=60000,
                cache_enabled=False,
                extract_structured_data=True,
            ),
            ScraperMode.STEALTH: cls(
                js_enabled=True,
                headless=True,
                stealth_mode=True,
                bypass_cloudflare=True,
                remove_overlay=True,
                wait_for_timeout=3000,
                page_timeout=45000,
                delay_between_requests=2000,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            ),
        }
        return presets.get(mode, presets[ScraperMode.STANDARD])


class UserScraperPreferences(BaseModel):
    """User-specific scraper preferences stored in database"""
    user_id: str
    default_mode: ScraperMode = ScraperMode.STANDARD
    custom_settings: Optional[ScraperSettings] = None
    proxy_config: Optional[Dict[str, Any]] = None
    rate_limits: Dict[str, int] = Field(default_factory=dict)  # Domain-specific rate limits
    blocked_domains: list[str] = Field(default_factory=list)
    allowed_domains: list[str] = Field(default_factory=list)