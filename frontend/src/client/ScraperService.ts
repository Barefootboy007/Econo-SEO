// Custom service for scraper endpoints
// This integrates with the existing OpenAPI client infrastructure

import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

export type ScraperSettings = {
  browser_type: string
  headless: boolean
  viewport_width: number
  viewport_height: number
  user_agent?: string | null
  js_enabled: boolean
  wait_for_selector?: string | null
  wait_for_timeout: number
  bypass_cloudflare: boolean
  remove_overlay: boolean
  disable_web_security: boolean
  stealth_mode: boolean
  page_timeout: number
  screenshot: boolean
  extract_media: boolean
  cache_enabled: boolean
  proxy_type: string
  proxy_url?: string | null
  proxy_username?: string | null
  proxy_password?: string | null
  extract_markdown: boolean
  extract_links: boolean
  extract_images: boolean
  extract_structured_data: boolean
  delay_between_requests: number
  max_retries: number
}

export type ScraperPresets = {
  fast: ScraperSettings
  standard: ScraperSettings
  thorough: ScraperSettings
  stealth: ScraperSettings
}

export class ScraperService {
  /**
   * Get current user's scraper settings
   */
  public static getSettings(): CancelablePromise<ScraperSettings> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/scraper/settings",
    })
  }

  /**
   * Update user's scraper settings
   */
  public static updateSettings(
    requestBody: ScraperSettings
  ): CancelablePromise<ScraperSettings> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/scraper/settings",
      body: requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Get available scraper presets
   */
  public static getPresets(): CancelablePromise<ScraperPresets> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/scraper/settings/presets",
    })
  }
}