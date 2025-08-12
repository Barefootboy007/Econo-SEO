# Core Functions Specification - RAG Content Migration System

## Overview

This document outlines the core functions required to implement the RAG Agent for Website Content Migration & Enhancement. Updated to include RSK integrations (Clerk auth, Polar payments, shadcn/ui) and React-based architecture decisions.

## Function Categories

### 1. Core Infrastructure Functions

These functions establish the foundation for user management, workspace organization, and system operations.

#### Authentication & User Management (Clerk Integration)
```python
# Backend API endpoints for Clerk webhook handling
async def sync_clerk_user(clerk_user_data: dict) -> UUID
    """Sync Clerk user data to Supabase on sign-up/update"""
    
async def get_user_by_clerk_id(clerk_id: str) -> User
    """Retrieve user from Supabase by Clerk ID"""
    
async def check_user_subscription(user_id: UUID) -> SubscriptionStatus
    """Check user's current subscription status from Polar"""
    
async def enforce_usage_limits(user_id: UUID, action: str) -> bool
    """Check if user can perform action based on subscription tier"""
```

```typescript
// Frontend React hooks for auth
function useUser(): ClerkUser | null
function useSubscription(): SubscriptionData
function useUsageLimits(): UsageLimits
```

#### Subscription & Payment Management (Polar.sh Integration)
```python
async def create_checkout_session(user_id: UUID, plan: str) -> CheckoutURL
    """Create Polar checkout session for subscription"""
    
async def handle_subscription_webhook(event: dict) -> None
    """Process Polar webhook events (subscription created/updated/cancelled)"""
    
async def update_user_subscription(user_id: UUID, subscription_data: dict)
    """Update user's subscription status in database"""
    
async def track_feature_usage(user_id: UUID, feature: str, amount: int)
    """Track usage for billing purposes"""
```

#### Database Management
```python
async def create_website_entry(url: str, domain: str, user_id: UUID) -> UUID
    """Create a new website entry in the database"""
    
async def update_website_status(website_id: UUID, status: str)
    """Update website crawling/processing status"""
    
async def get_website_by_id(website_id: UUID) -> Website
    """Retrieve website details by ID"""
    
async def list_websites(user_id: UUID, filters: dict) -> List[Website]
    """List all websites for a user with optional filters"""
    
async def check_website_ownership(website_id: UUID, user_id: UUID) -> bool
    """Verify user owns the website resource"""
```

### 2. Scraping Pipeline Functions

Core functionality for web scraping, URL processing, and content extraction.

#### URL Validation & Processing
```python
async def validate_url(url: str) -> ValidationResult
    """Validate URL format and accessibility"""
    
async def detect_sitemap(url: str) -> Optional[List[str]]
    """Detect and parse sitemap.xml if available"""
    
async def extract_urls_from_sitemap(sitemap_url: str) -> List[str]
    """Extract all URLs from a sitemap"""
    
async def detect_page_type(url: str, html: str) -> PageType
    """Detect page type (product, category, blog, etc.)"""
```

#### Core Scraping with Usage Limits
```python
async def scrape_single_page(url: str, config: ScrapeConfig, user_id: UUID) -> ScrapedPage
    """Scrape a single page with usage limit checking"""
    
async def scrape_bulk_pages(urls: List[str], config: ScrapeConfig, user_id: UUID) -> List[ScrapedPage]
    """Scrape multiple pages with subscription tier limits"""
    
async def check_scraping_quota(user_id: UUID, page_count: int) -> bool
    """Check if user has remaining scraping quota"""
    
async def increment_scraping_usage(user_id: UUID, page_count: int)
    """Update user's monthly scraping usage"""
    
async def convert_html_to_markdown(html: str, page_type: PageType) -> str
    """Convert HTML content to clean Markdown"""
    
async def extract_metadata(html: str) -> PageMetadata
    """Extract meta tags, title, description from HTML"""
```

#### Progress Tracking
```python
async def create_scraping_job(website_id: UUID, urls: List[str]) -> JobID
    """Create a new scraping job with tracking"""
    
async def update_scraping_progress(job_id: JobID, progress: float, current_url: str)
    """Update job progress for real-time tracking"""
    
async def emit_progress_update(job_id: JobID, data: dict) -> None
    """Send progress update via WebSocket"""
    
async def get_scraping_status(job_id: JobID) -> JobStatus
    """Get current status of scraping job"""
```

### 3. Content Processing Functions

Functions for processing, chunking, and storing scraped content.

#### Chunking & Storage
```python
async def chunk_content(content: str, chunk_size: int = 1000) -> List[ContentChunk]
    """Split content into semantic chunks for processing"""
    
async def store_original_content(page_id: UUID, content: str, metadata: dict)
    """Store original scraped content in database"""
    
async def store_content_chunks(page_id: UUID, chunks: List[ContentChunk])
    """Store content chunks with metadata"""
```

#### Embedding Generation
```python
async def generate_embeddings(texts: List[str]) -> List[List[float]]
    """Generate vector embeddings for text chunks"""
    
async def store_embeddings(chunk_ids: List[UUID], embeddings: List[List[float]])
    """Store embeddings in pgvector"""
    
async def batch_process_embeddings(pages: List[Page]) -> None
    """Process embeddings for multiple pages efficiently"""
```

#### CSS-Based Extraction (New Feature)
```python
async def create_extraction_schema(page_type: PageType) -> ExtractionSchema
    """Create CSS selector schema for page type"""
    
async def extract_structured_data(html: str, schema: ExtractionSchema) -> dict
    """Extract structured data using CSS selectors"""
    
async def validate_extracted_data(data: dict, schema: ExtractionSchema) -> ValidationResult
    """Validate extracted data against schema"""
    
async def store_extracted_data(page_id: UUID, data: dict)
    """Store structured extraction results"""
```

### 4. AI Enhancement Functions

LLM integration and content optimization capabilities.

#### LLM Router & Management with Tier Limits
```python
async def select_optimal_llm(task_type: str, content_length: int, user_tier: str) -> LLMProvider
    """Select best LLM based on task, content, and user tier"""
    
async def check_llm_access(user_id: UUID, model: str) -> bool
    """Check if user tier has access to requested model"""
    
async def route_llm_request(content: str, prompt: str, model: str, user_id: UUID) -> str
    """Route request with tier validation"""
    
async def track_llm_usage(model: str, tokens: int, cost: float, user_id: UUID)
    """Track LLM usage for billing and analytics"""
```

#### Content Optimization
```python
async def optimize_content(original_content: str, optimization_type: str, model: str, user_id: UUID) -> str
    """Optimize content with tier-appropriate model"""
    
async def generate_optimization_prompt(content: str, page_type: PageType, goal: str) -> str
    """Generate appropriate prompt for content type"""
    
async def create_optimized_version(page_id: UUID, optimized_content: str, model: str) -> UUID
    """Create and store optimized content version"""
    
async def batch_optimize_content(page_ids: List[UUID], optimization_config: dict, user_id: UUID)
    """Optimize multiple pages with quota checking"""
```

#### RAG Pipeline
```python
async def retrieve_relevant_chunks(query: str, top_k: int = 5) -> List[ContentChunk]
    """Retrieve relevant content chunks using vector search"""
    
async def generate_with_context(prompt: str, context: List[ContentChunk]) -> str
    """Generate content with retrieved context"""
    
async def rerank_results(chunks: List[ContentChunk], query: str) -> List[ContentChunk]
    """Rerank search results for relevance"""
```

### 5. Content Management Functions

Version control, editing, and content organization features.

#### Version Control
```python
async def link_content_versions(original_id: UUID, optimized_id: UUID)
    """Link original and optimized content versions"""
    
async def get_content_history(page_id: UUID) -> List[ContentVersion]
    """Get version history for a page"""
    
async def rollback_content(version_id: UUID) -> ContentVersion
    """Rollback to previous content version"""
    
async def compare_versions(version1_id: UUID, version2_id: UUID) -> VersionDiff
    """Compare two content versions"""
```

#### Editing & Updates
```python
async def update_content_version(version_id: UUID, content: str, user_id: UUID)
    """Update content with user edits"""
    
async def save_draft(page_id: UUID, content: str) -> UUID
    """Save content as draft"""
    
async def publish_content(draft_id: UUID) -> UUID
    """Publish draft content"""
    
async def add_content_comment(version_id: UUID, comment: str, user_id: UUID)
    """Add comment to content version"""
```

#### Search & Filtering
```python
async def search_content(query: str, filters: dict, user_id: UUID) -> List[Page]
    """Search user's content with filters"""
    
async def filter_by_page_type(page_type: PageType, user_id: UUID) -> List[Page]
    """Filter user's pages by type"""
    
async def get_pages_by_optimization_status(status: str, user_id: UUID) -> List[Page]
    """Get user's pages by optimization status"""
```

### 6. Export & Integration Functions

Export capabilities and third-party platform integrations.

#### Export Formats with Quota Management
```python
async def check_export_quota(user_id: UUID, page_count: int) -> bool
    """Check if user can export based on tier limits"""
    
async def export_to_csv(page_ids: List[UUID], field_mapping: dict, user_id: UUID) -> bytes
    """Export pages to CSV with quota check"""
    
async def export_to_markdown(page_ids: List[UUID], include_metadata: bool, user_id: UUID) -> bytes
    """Export as Markdown files with tier limits"""
    
async def export_to_json(page_ids: List[UUID], user_id: UUID) -> dict
    """Export as structured JSON"""
    
async def generate_wordpress_xml(pages: List[Page], user_id: UUID) -> str
    """Generate WordPress WXR import file (Pro tier+)"""
    
async def generate_shopify_csv(products: List[Page], user_id: UUID) -> bytes
    """Generate Shopify products CSV (Pro tier+)"""
```

#### Field Mapping & Transformation
```python
async def create_export_mapping(source_fields: List[str], target_format: str) -> FieldMapping
    """Create field mapping for export format"""
    
async def transform_content_for_platform(content: dict, platform: str) -> dict
    """Transform content for target platform"""
    
async def validate_export_data(data: dict, platform: str) -> ValidationResult
    """Validate data meets platform requirements"""
```

#### Integration APIs (Pro/Enterprise)
```python
async def push_to_wordpress(pages: List[Page], wp_config: dict, user_id: UUID) -> List[Result]
    """Push content to WordPress via REST API (Pro tier+)"""
    
async def sync_with_shopify(products: List[Page], shop_config: dict, user_id: UUID) -> SyncResult
    """Sync products with Shopify store (Pro tier+)"""
    
async def webhook_notify(event: str, data: dict, webhook_url: str)
    """Send webhook notifications (Enterprise)"""
```

### 7. React Frontend Functions (New Section)

Frontend-specific functions for the React + Vite application.

#### Authentication Hooks (Clerk)
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { subscription, isLoading } = useSubscription();
  
  return {
    user,
    subscription,
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded || isLoading,
    tier: subscription?.tier || 'free'
  };
}

// hooks/useProtectedRoute.ts
export function useProtectedRoute(requiredTier?: SubscriptionTier) {
  const { isAuthenticated, tier } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
    } else if (requiredTier && !hasAccess(tier, requiredTier)) {
      navigate('/upgrade');
    }
  }, [isAuthenticated, tier, requiredTier]);
}
```

#### Content Management Hooks
```typescript
// hooks/useContent.ts
export function useContent(websiteId: string) {
  const { data, loading, error } = useQuery({
    queryKey: ['content', websiteId],
    queryFn: () => api.getWebsiteContent(websiteId)
  });
  
  return { content: data, loading, error };
}

// hooks/useOptimization.ts
export function useOptimization() {
  const mutation = useMutation({
    mutationFn: api.optimizeContent,
    onSuccess: (data) => {
      toast.success('Content optimized successfully');
      queryClient.invalidateQueries(['content']);
    }
  });
  
  return mutation;
}
```

#### Progress Tracking (WebSocket)
```typescript
// hooks/useScrapingProgress.ts
export function useScrapingProgress(jobId: string) {
  const [progress, setProgress] = useState<Progress>({ percentage: 0 });
  
  useEffect(() => {
    const socket = io();
    
    socket.on(`scraping:${jobId}`, (data: Progress) => {
      setProgress(data);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [jobId]);
  
  return progress;
}
```

### 8. Analytics & Monitoring Functions

Usage tracking, performance monitoring, and reporting capabilities.

#### Usage Tracking & Billing
```python
async def track_user_action(user_id: UUID, action: str, metadata: dict)
    """Track user actions for analytics and billing"""
    
async def calculate_llm_costs(user_id: UUID, date_range: DateRange) -> CostBreakdown
    """Calculate LLM usage costs by model and tier"""
    
async def get_usage_metrics(user_id: UUID) -> UsageMetrics
    """Get comprehensive usage metrics for billing"""
    
async def generate_usage_report(user_id: UUID, billing_period: str) -> UsageReport
    """Generate detailed usage report for user"""
```

#### Performance Monitoring
```python
async def log_operation_performance(operation: str, duration: float, success: bool)
    """Log operation performance metrics"""
    
async def get_system_health() -> HealthStatus
    """Get overall system health status"""
    
async def alert_on_threshold(metric: str, value: float, threshold: float)
    """Alert when metric exceeds threshold"""
```

#### Reporting
```python
async def generate_optimization_report(website_id: UUID) -> Report
    """Generate content optimization report"""
    
async def calculate_content_quality_score(page_id: UUID) -> QualityScore
    """Calculate content quality metrics"""
    
async def generate_roi_report(website_id: UUID, before_after: bool) -> ROIMetrics
    """Generate ROI report for optimization"""
```

## Subscription Tiers & Feature Access

### Tier Structure
```typescript
enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter',      // $29/month
  PRO = 'pro',             // $99/month
  ENTERPRISE = 'enterprise' // Custom pricing
}

interface TierLimits {
  pagesPerMonth: number;
  llmModels: string[];
  exportFormats: string[];
  apiAccess: boolean;
  prioritySupport: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  [SubscriptionTier.FREE]: {
    pagesPerMonth: 10,
    llmModels: ['gpt-3.5-turbo'],
    exportFormats: ['markdown', 'csv'],
    apiAccess: false,
    prioritySupport: false
  },
  [SubscriptionTier.STARTER]: {
    pagesPerMonth: 100,
    llmModels: ['gpt-3.5-turbo', 'claude-3-haiku'],
    exportFormats: ['markdown', 'csv', 'json'],
    apiAccess: false,
    prioritySupport: false
  },
  [SubscriptionTier.PRO]: {
    pagesPerMonth: 1000,
    llmModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'],
    exportFormats: ['markdown', 'csv', 'json', 'wordpress', 'shopify'],
    apiAccess: true,
    prioritySupport: true
  },
  [SubscriptionTier.ENTERPRISE]: {
    pagesPerMonth: Infinity,
    llmModels: ['all'],
    exportFormats: ['all'],
    apiAccess: true,
    prioritySupport: true
  }
};
```

## MVP Implementation Priority (Updated)

### Phase 0: Foundation Setup (Week 1)
1. **Fork and Clean Archon**
   - Remove MCP, project management, test features
   - Keep React + Vite frontend structure
   - Keep FastAPI backend core

2. **Integrate RSK Components**
   - Add Clerk authentication
   - Add shadcn/ui components
   - Set up Polar.sh integration

### Phase 1: Core Functions with Auth (Weeks 2-3)
1. **Authentication & User Management**
   - `sync_clerk_user()`
   - `check_user_subscription()`
   - Protected routes in React

2. **Basic Scraping with Limits**
   - `scrape_single_page()` with quota
   - `check_scraping_quota()`
   - Progress tracking UI

### Phase 2: Content Processing (Weeks 4-5)
1. **Storage & Processing**
   - `chunk_content()`
   - `generate_embeddings()`
   - `store_original_content()`

2. **Basic UI**
   - Content listing
   - Search functionality
   - Scraping progress

### Phase 3: Optimization & Payments (Weeks 6-7)
1. **LLM Integration**
   - `optimize_content()` with tier limits
   - `check_llm_access()`
   - Optimization UI

2. **Subscription Management**
   - Pricing page
   - Checkout flow
   - Usage dashboard

### Phase 4: Export & Polish (Week 8)
1. **Export Functions**
   - `export_to_markdown()`
   - `export_to_csv()`
   - Export UI with limits

2. **Polish & Launch**
   - Error handling
   - Loading states
   - Documentation

## Implementation Notes

### Authentication Flow
```typescript
// App.tsx
function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/content" element={<ContentManager />} />
              <Route path="/optimize" element={<Optimizer />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
```

### Usage Enforcement
```python
# Decorator for tier-based access
def require_tier(min_tier: SubscriptionTier):
    def decorator(func):
        async def wrapper(*args, user_id: UUID, **kwargs):
            subscription = await check_user_subscription(user_id)
            if not has_tier_access(subscription.tier, min_tier):
                raise InsufficientTierError(f"Requires {min_tier} or higher")
            return await func(*args, user_id=user_id, **kwargs)
        return wrapper
    return decorator

# Usage
@require_tier(SubscriptionTier.PRO)
async def generate_wordpress_xml(pages: List[Page], user_id: UUID) -> str:
    # Implementation
```

### Error Handling
All functions should implement comprehensive error handling:
```python
try:
    # Function logic
except ValidationError as e:
    # Handle validation errors
except APIError as e:
    # Handle external API errors
except Exception as e:
    # Log unexpected errors
    raise
```

### Async Patterns
Use async/await throughout for scalability:
```python
async with aiohttp.ClientSession() as session:
    tasks = [scrape_page(url, session) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
```

### Rate Limiting
Implement rate limiting for external APIs:
```python
@rate_limit(calls=10, period=60)  # 10 calls per minute
async def call_llm_api(prompt: str) -> str:
    # API call logic
```

### Caching Strategy
Use Redis for caching frequently accessed data:
```python
@cache(ttl=3600)  # Cache for 1 hour
async def get_cached_embeddings(text: str) -> List[float]:
    # Embedding generation logic
```

## Testing Requirements

Each function should have corresponding tests:

1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test function interactions
3. **Load Tests**: Test performance under load
4. **Error Tests**: Test error handling paths

Example test structure:
```python
async def test_scrape_single_page():
    # Given
    url = "https://example.com/product"
    config = ScrapeConfig(timeout=30)
    
    # When
    result = await scrape_single_page(url, config)
    
    # Then
    assert result.status == "success"
    assert result.content is not None
    assert result.metadata.title is not None
```

## Security Considerations (Updated)

1. **Multi-tenant Isolation**: All queries filtered by user_id
2. **Resource Ownership**: Verify user owns resources before access
3. **Rate Limiting**: Per-tier rate limits
4. **API Key Scoping**: User-specific API keys for integrations
5. **Webhook Validation**: Verify Clerk and Polar webhooks
6. **Input Validation**: Validate all user inputs
7. **Data Sanitization**: Clean data before storage

## Performance Targets (Updated by Tier)

### Free Tier
- Single page scrape: < 10 seconds
- Content optimization: < 45 seconds (queued)
- Export: < 30 seconds (10 pages max)

### Pro Tier
- Single page scrape: < 5 seconds
- Content optimization: < 20 seconds (priority queue)
- Bulk export: < 60 seconds (1000 pages)
- API response: < 200ms

### Enterprise
- Dedicated resources
- SLA guarantees
- Custom performance targets

## Conclusion

This updated specification integrates RSK components (Clerk auth, Polar payments, shadcn/ui) while maintaining Archon's core strengths in web scraping and content processing. The tiered approach enables immediate monetization while providing a clear upgrade path for users. By following this structure and prioritizing MVP functions, the development team can build a robust, scalable SaaS solution for e-commerce content migration and enhancement.