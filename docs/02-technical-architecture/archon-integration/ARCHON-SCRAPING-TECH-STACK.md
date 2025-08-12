# Archon Web Scraping Tech Stack - Complete Analysis

## Overview

Archon uses a sophisticated web scraping pipeline built on modern Python libraries and microservices architecture. The system is designed for high-performance, scalable web content extraction with built-in support for JavaScript-heavy sites, documentation platforms, and e-commerce websites.

## Core Technology Stack

### 1. Web Scraping Library: Crawl4AI

**Library**: `crawl4ai==0.6.2`

Crawl4AI is the primary web scraping engine that provides:
- **Async/await support** for concurrent crawling
- **Headless browser automation** using Playwright under the hood
- **JavaScript rendering** for dynamic content
- **Built-in Markdown conversion** with customizable strategies
- **Smart caching** to avoid redundant requests
- **Memory-adaptive dispatching** for resource management

### 2. Browser Automation

**Configuration**:
```python
browser_config = BrowserConfig(
    headless=True,
    verbose=False,
    viewport_width=1920,
    viewport_height=1080,
    user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser_type="chromium",
    extra_args=[
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
    ]
)
```

### 3. Content Processing Pipeline

#### HTML to Markdown Conversion
- **Library**: `crawl4ai.markdown_generation_strategy.DefaultMarkdownGenerator`
- **Configuration**:
  ```python
  DefaultMarkdownGenerator(
      content_source="html",
      options={
          "mark_code": True,
          "handle_code_in_pre": True,
          "body_width": 0,  # No line wrapping
          "skip_internal_links": True,
          "include_raw_html": False,
          "escape": False,
          "decode_unicode": True,
          "strip_empty_lines": False,
          "preserve_code_formatting": True
      }
  )
  ```

#### Document Processing
- **PDF Processing**: `pypdf2>=3.0.1`, `pdfplumber>=0.11.6`
- **Word Documents**: `python-docx>=1.1.2`
- **Markdown**: `markdown>=3.8`

### 4. Vector Embeddings & RAG

#### Embedding Generation
- **Primary Model**: OpenAI `text-embedding-3-small`
- **Dimensions**: 1536
- **Batch Processing**: Up to 20 texts per API call
- **Rate Limiting**: Token bucket algorithm
- **Fallback**: Zero embeddings on failure

#### Vector Storage
- **Database**: PostgreSQL with pgvector extension (via Supabase)
- **Chunking Strategy**: Contextual chunking with overlap
- **Similarity Search**: Cosine similarity
- **Reranking**: `sentence-transformers>=4.1.0` with CrossEncoder

### 5. Real-time Progress Tracking

- **WebSocket**: `python-socketio[asyncio]>=5.11.0`
- **Progress Events**:
  - `crawl:progress` - Real-time crawling updates
  - `crawl:complete` - Crawl completion
  - `crawl:error` - Error notifications
- **Progress Stages**:
  1. Starting (0-5%)
  2. Analyzing (5-10%)
  3. Crawling (10-40%)
  4. Processing (40-60%)
  5. Storing (60-80%)
  6. Indexing (80-95%)
  7. Complete (95-100%)

## Complete Scraping Flow

### 1. API Entry Point
```
POST /api/knowledge-items/crawl
```

### 2. Request Validation
```python
class CrawlRequest(BaseModel):
    url: str
    knowledge_type: str = 'general'
    tags: List[str] = []
    update_frequency: int = 7
    max_depth: int = 2
    extract_code_examples: bool = True
```

### 3. Crawl Orchestration

The flow is managed by `CrawlOrchestrationService`:

```python
# Step 1: Initialize crawler with progress tracking
progress_id = str(uuid.uuid4())
await start_crawl_progress(progress_id, initial_state)

# Step 2: Detect URL type (sitemap, markdown, regular page)
crawl_results, crawl_type = await self._crawl_by_url_type(url, request)

# Step 3: Process and store documents
storage_results = await self._process_and_store_documents(
    crawl_results, request, crawl_type
)

# Step 4: Extract code examples (if enabled)
if request.get('extract_code_examples', True):
    code_examples_count = await self._extract_and_store_code_examples(
        crawl_results, storage_results['url_to_full_document']
    )

# Step 5: Generate embeddings and index
await self._generate_and_store_embeddings(processed_documents)
```

### 4. URL Type Detection

Archon intelligently detects and handles different URL types:

#### Sitemap Detection
```python
if url.endswith('sitemap.xml') or 'sitemap' in urlparse(url).path:
    # Parse XML sitemap and extract all URLs
    # Crawl up to 50 URLs concurrently
```

#### Documentation Site Detection
```python
doc_patterns = [
    'docs.', 'documentation.', '/docs/', '/documentation/',
    'readthedocs', 'gitbook', 'docusaurus', 'vitepress',
    'docsify', 'mkdocs', 'copilotkit'
]
```

Documentation sites get special handling:
- Custom wait selectors for content loading
- Extended timeouts (45 seconds)
- Full page scanning for lazy-loaded content
- Image preservation
- Code block detection

### 5. Crawling Configuration

#### Regular Sites
```python
CrawlerRunConfig(
    cache_mode=CacheMode.ENABLED,
    stream=False,
    markdown_generator=self._get_markdown_generator(),
    wait_until='networkidle',
    delay_before_return_html=1.0,
    scan_full_page=True
)
```

#### Documentation Sites
```python
CrawlerRunConfig(
    cache_mode=cache_mode,
    stream=False,
    markdown_generator=self._get_markdown_generator(),
    wait_for=wait_selector,  # Site-specific selector
    wait_until='domcontentloaded',  # or 'networkidle'
    page_timeout=45000,  # 45 seconds
    delay_before_return_html=2.0,
    wait_for_images=True,
    scan_full_page=True,
    exclude_all_images=False,
    remove_overlay_elements=True,
    process_iframes=True
)
```

### 6. Content Storage

#### Database Schema
```sql
-- Main content table
CREATE TABLE crawled_pages (
    id UUID PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    content TEXT,
    markdown TEXT,
    html TEXT,
    chunk_number INTEGER,
    metadata JSONB,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Code examples table
CREATE TABLE code_examples (
    id UUID PRIMARY KEY,
    crawled_page_id UUID REFERENCES crawled_pages(id),
    summary TEXT,
    code TEXT,
    language TEXT,
    embedding vector(1536),
    metadata JSONB
);
```

### 7. Embedding Generation Process

```python
async def create_embeddings_batch_async(texts: List[str]):
    # 1. Validate and clean texts
    validated_texts = [str(text) for text in texts]
    
    # 2. Split into batches (max 20 per OpenAI limit)
    batch_size = 20
    all_embeddings = []
    
    # 3. Process each batch with rate limiting
    for batch in batches:
        async with rate_limited_operation(batch_tokens):
            response = await client.embeddings.create(
                model="text-embedding-3-small",
                input=batch,
                dimensions=1536
            )
            all_embeddings.extend(response.embeddings)
    
    return all_embeddings
```

### 8. Code Extraction

Archon extracts code blocks using sophisticated selectors:

```python
CODE_BLOCK_SELECTORS = [
    # Editor-specific
    ".milkdown-code-block pre",
    ".monaco-editor .view-lines",
    ".cm-editor .cm-content",
    
    # Documentation frameworks
    "pre[class*='language-']",  # Prism.js
    "pre code.hljs",             # highlight.js
    ".shiki",                    # Shiki
    "div[class*='language-'] pre", # VitePress
    
    # Generic
    "pre code",
    ".code-block",
    ".highlight pre"
]
```

### 9. Parallel Processing

#### Batch Crawling
```python
async def crawl_batch_with_progress(urls: List[str], max_concurrent: int = 10):
    # Use asyncio.gather for parallel crawling
    tasks = []
    for url in urls:
        task = self.crawl_page(url)
        tasks.append(task)
    
    # Process with concurrency limit
    results = await asyncio.gather(*tasks, return_exceptions=True)
```

#### Embedding Generation
```python
# Parallel embedding generation with ThreadPoolExecutor
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(generate_embedding, text) for text in texts]
    embeddings = [f.result() for f in concurrent.futures.as_completed(futures)]
```

## Performance Optimizations

### 1. Caching Strategy
- **Browser Cache**: Reuse crawled pages within session
- **Supabase Cache**: Store crawled content for reuse
- **Embedding Cache**: Avoid re-computing identical embeddings

### 2. Concurrency Limits
- **Global Crawl Limit**: 3 concurrent crawls per server
- **Batch Crawl Limit**: 10 concurrent page fetches
- **Embedding Batch Size**: 20 texts per API call

### 3. Resource Management
- **Memory Adaptive Dispatcher**: Adjusts based on available memory
- **Semaphore Control**: Prevents resource exhaustion
- **Timeout Management**: Prevents hanging operations

## Error Handling

### 1. Retry Logic
```python
for attempt in range(retry_count):
    try:
        result = await crawler.arun(url=url, config=crawl_config)
        if result.success:
            return result
    except Exception as e:
        if attempt < retry_count - 1:
            await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

### 2. Fallback Strategies
- **Zero Embeddings**: Return zero vectors on API failure
- **Partial Results**: Continue with successful crawls
- **Graceful Degradation**: Disable features on failure

## Monitoring & Logging

### 1. Structured Logging
- **Library**: Custom logfire configuration
- **Log Levels**: INFO, WARNING, ERROR with context
- **Performance Tracking**: Operation timing with spans

### 2. Progress Tracking
```python
progress_data = {
    'progressId': progress_id,
    'status': 'crawling',
    'percentage': 25,
    'currentUrl': current_url,
    'totalPages': total_pages,
    'processedPages': processed_pages,
    'logs': ['Started crawling...', 'Processing page 1...'],
    'eta': 'Calculating...'
}
```

## Integration Points

### 1. FastAPI Backend
- Modular router system
- Dependency injection
- Async request handling
- WebSocket support

### 2. Supabase Integration
- PostgreSQL with pgvector
- Real-time subscriptions
- Row-level security
- Storage for large files

### 3. Multi-LLM Support
- Provider abstraction layer
- Dynamic model selection
- Rate limiting per provider
- Cost tracking

## Security Considerations

### 1. Input Validation
- URL validation and sanitization
- Content size limits
- Request rate limiting
- CORS configuration

### 2. Browser Security
```python
extra_args=[
    '--disable-web-security',  # Required for some sites
    '--no-sandbox',            # Docker compatibility
    '--disable-setuid-sandbox' # Security tradeoff
]
```

## Scalability Features

### 1. Horizontal Scaling
- Stateless crawler instances
- Redis for distributed locks
- Load balancer ready
- Container-friendly (Docker)

### 2. Vertical Scaling
- Configurable worker counts
- Memory-based auto-scaling
- Dynamic batch sizing
- Resource pooling

This architecture provides a robust, scalable foundation for web scraping that can handle everything from simple static pages to complex JavaScript-heavy applications while maintaining high performance and reliability.