# Product Requirements Document (PRD)
## SEO Optimization Platform - MVP (Phases 0-4)

---

## 📊 CURRENT PROJECT STATUS

### ✅ Phase 0: COMPLETED (Day 1-2)
- **FastAPI Template**: Successfully cloned and configured
- **Backend Dependencies**: All Python packages installed (FastAPI, Crawl4AI, Supabase client, etc.)
- **Frontend Dependencies**: All npm packages installed (React, TypeScript, Radix UI)
- **Backend Server**: Running successfully at http://localhost:8000
- **Frontend Server**: Running successfully at http://localhost:5173
- **API Documentation**: Accessible at http://localhost:8000/docs

### 🚧 Phase 1: IN PROGRESS (Day 3-5)
**Next Immediate Steps:**
1. Create Supabase project at https://supabase.com
2. Get Supabase credentials (URL, anon key, service key)
3. Update backend/.env with Supabase connection
4. Modify database configuration to use Supabase
5. Begin creating scraping API endpoints

### ⏳ Phases 2-4: PENDING
- Phase 2: Database Schema Setup (Days 6-7)
- Phase 3: Crawl4AI Integration (Days 8-10)
- Phase 4: Frontend UI Development (Days 11-13)

**Completion: 25% of MVP**

---

## 1. Executive Summary

### Product Overview
An SEO optimization SaaS platform that scrapes websites, stores content in a centralized database, and provides AI-powered optimization tools for improving SEO performance. The MVP focuses on establishing core infrastructure: web scraping, content storage, and basic UI interaction.

### MVP Scope (Phases 0-4)
- **Duration**: 13 days
- **Goal**: Functional scraping → storage → display pipeline
- **Success Criteria**: Can scrape a website, store in database, and view in UI
- **Non-Goals**: Payment processing, authentication, all 8 SEO tools (only foundation)

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Template**: https://github.com/fastapi/full-stack-fastapi-template
- **Async Support**: asyncio for concurrent operations
- **API Version**: v1 with RESTful + WebSocket endpoints

#### Frontend  
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Tailwind CSS based)
- **State Management**: Zustand or Context API
- **HTTP Client**: Axios or Fetch API
- **WebSocket Client**: socket.io-client

#### Database
- **Provider**: Supabase (PostgreSQL as a service)
- **Extensions**: pgvector (for future RAG features)
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic

#### Web Scraping
- **Library**: Crawl4AI 0.6.2+
- **Browser Engine**: Playwright (Chromium)
- **Markdown Conversion**: Built-in Crawl4AI converter

#### Background Tasks
- **Queue**: Celery 5.4+
- **Broker**: Redis (local for MVP, Upstash for production)
- **Monitoring**: Flower (Celery monitoring tool)

#### Real-time Communication
- **Protocol**: WebSocket
- **Library**: python-socketio (backend), socket.io-client (frontend)
- **Events**: Progress updates, status changes, errors

---

## 3. Phase 0: Project Setup & Structure (Day 1-2)

### 3.1 Objectives
Establish a clean, scalable project foundation using the FastAPI full-stack template with proper configuration for our use case.

### 3.2 Detailed Requirements

#### 3.2.1 Project Initialization
```bash
# Commands to execute
git clone https://github.com/fastapi/full-stack-fastapi-template seo-optimizer
cd seo-optimizer

# Cookiecutter configuration answers:
# - project_name: "SEO Optimizer"
# - project_slug: "seo_optimizer"
# - domain: "seooptimizer.local" (for development)
# - backend_cors_origins: ["http://localhost:3000", "http://localhost:5173"]
```

#### 3.2.2 Directory Structure
```
seo-optimizer/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── api_v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── scraping.py      # NEW: Scraping endpoints
│   │   │   │   │   ├── content.py       # NEW: Content management
│   │   │   │   │   ├── health.py        # Health check
│   │   │   │   │   └── websocket.py     # NEW: WebSocket endpoint
│   │   │   │   └── api.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py                # Add Supabase config
│   │   │   ├── celery_app.py           # NEW: Celery configuration
│   │   │   └── security.py
│   │   ├── crud/
│   │   │   ├── crud_website.py         # NEW: Website CRUD
│   │   │   ├── crud_page.py            # NEW: Page CRUD
│   │   │   └── crud_content.py         # NEW: Content CRUD
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py              # Modify for Supabase
│   │   │   └── init_db.py
│   │   ├── models/
│   │   │   ├── website.py              # NEW: Website model
│   │   │   ├── page.py                 # NEW: Page model
│   │   │   └── content.py              # NEW: Content model
│   │   ├── schemas/
│   │   │   ├── website.py              # NEW: Website schemas
│   │   │   ├── page.py                 # NEW: Page schemas
│   │   │   └── content.py              # NEW: Content schemas
│   │   ├── services/                   # NEW: Service layer
│   │   │   ├── scraping/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── crawler.py          # Crawl4AI integration
│   │   │   │   └── markdown_converter.py
│   │   │   ├── storage/
│   │   │   │   ├── __init__.py
│   │   │   │   └── document_storage.py
│   │   │   └── websocket/
│   │   │       ├── __init__.py
│   │   │       └── progress_manager.py
│   │   └── main.py
│   ├── requirements.txt                 # Add our dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── scraping/               # NEW: Scraping components
│   │   │   │   ├── ScrapingForm.tsx
│   │   │   │   ├── ProgressDisplay.tsx
│   │   │   │   └── ScrapingHistory.tsx
│   │   │   └── content/                # NEW: Content components
│   │   │       ├── ContentList.tsx
│   │   │       ├── ContentViewer.tsx
│   │   │       └── ContentCard.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts         # NEW: WebSocket hook
│   │   │   └── useApi.ts               # NEW: API hook
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts            # NEW: WebSocket service
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
├── docker-compose.yml                   # Modify for our stack
└── README.md
```

#### 3.2.3 Environment Configuration
```env
# backend/.env
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REDIS_URL=redis://localhost:6379
ENVIRONMENT=development
DEBUG=true

# frontend/.env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.2.4 Dependencies to Install

**Backend (requirements.txt additions):**
```txt
crawl4ai==0.6.2
celery==5.4.0
redis==5.2.1
python-socketio[asyncio]==5.11.0
supabase==2.10.1
pgvector==0.3.6
python-multipart==0.0.6
httpx==0.27.2
beautifulsoup4==4.12.3
markdown==3.7
python-dotenv==1.0.1
```

**Frontend (package.json additions):**
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.456.0",
    "socket.io-client": "^4.8.1",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "@supabase/supabase-js": "^2.47.0",
    "recharts": "^2.13.0"
  }
}
```

### 3.3 Acceptance Criteria
- [ ] FastAPI template successfully cloned and configured
- [ ] Project runs with `docker-compose up` or manual start
- [ ] Frontend accessible at http://localhost:5173
- [ ] Backend API docs at http://localhost:8000/docs
- [ ] All dependencies installed without conflicts
- [ ] Environment variables configured (using .env.example as template)

---

## 4. Phase 1: FastAPI Backend Base (Day 3-5)

### 4.1 Objectives
Create a robust, scalable backend API with proper structure, error handling, and real-time communication capabilities.

### 4.2 Detailed Requirements

#### 4.2.1 API Endpoints Structure

**Base URL**: `/api/v1`

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/health` | GET | Health check | None | `{"status": "healthy", "timestamp": "..."}` |
| `/scrape/initiate` | POST | Start scraping | `{"url": "string", "options": {}}` | `{"job_id": "uuid", "status": "started"}` |
| `/scrape/status/{job_id}` | GET | Get scrape status | None | `{"status": "processing", "progress": 45}` |
| `/scrape/cancel/{job_id}` | POST | Cancel scraping | None | `{"status": "cancelled"}` |
| `/websites` | GET | List websites | None | `{"items": [...], "total": 10}` |
| `/websites/{id}` | GET | Get website details | None | `{"id": "...", "url": "...", "pages": [...]}` |
| `/pages` | GET | List all pages | None | `{"items": [...], "total": 50}` |
| `/pages/{id}` | GET | Get page details | None | `{"id": "...", "content": "...", "metadata": {}}` |
| `/ws` | WebSocket | Real-time updates | N/A | Event streams |

#### 4.2.2 Database Models (SQLAlchemy)

**Website Model:**
```python
class Website(Base):
    __tablename__ = "websites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    url = Column(String, nullable=False, unique=True)
    domain = Column(String, nullable=False, index=True)
    title = Column(String)
    description = Column(Text)
    favicon_url = Column(String)
    status = Column(Enum(WebsiteStatus), default=WebsiteStatus.PENDING)
    total_pages = Column(Integer, default=0)
    pages_scraped = Column(Integer, default=0)
    scrape_started_at = Column(DateTime(timezone=True))
    scrape_completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    pages = relationship("Page", back_populates="website", cascade="all, delete-orphan")
```

**Page Model:**
```python
class Page(Base):
    __tablename__ = "pages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    website_id = Column(UUID(as_uuid=True), ForeignKey("websites.id"), nullable=False)
    url = Column(Text, nullable=False)
    path = Column(String)  # URL path for easy filtering
    title = Column(String)
    meta_description = Column(Text)
    meta_keywords = Column(Text)
    h1_tag = Column(Text)
    word_count = Column(Integer)
    status = Column(Enum(PageStatus), default=PageStatus.PENDING)
    scraped_at = Column(DateTime(timezone=True))
    error_message = Column(Text)  # If scraping failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    website = relationship("Website", back_populates="pages")
    content_versions = relationship("ContentVersion", back_populates="page", cascade="all, delete-orphan")
```

**ContentVersion Model:**
```python
class ContentVersion(Base):
    __tablename__ = "content_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey("pages.id"), nullable=False)
    version_type = Column(Enum(VersionType), nullable=False)  # ORIGINAL or OPTIMIZED
    content_markdown = Column(Text)
    content_html = Column(Text)
    content_plain = Column(Text)
    structured_data = Column(JSON)  # Store extracted structured data
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # For optimized versions
    optimization_type = Column(String)  # meta_update, content_rewrite, etc.
    llm_model = Column(String)  # gpt-4, deepseek, etc.
    optimization_prompt = Column(Text)
    parent_version_id = Column(UUID(as_uuid=True), ForeignKey("content_versions.id"))
    
    # Relationships
    page = relationship("Page", back_populates="content_versions")
    parent_version = relationship("ContentVersion", remote_side=[id])
```

#### 4.2.3 Pydantic Schemas

**Request Schemas:**
```python
class ScrapingRequest(BaseModel):
    url: HttpUrl
    options: ScrapingOptions = ScrapingOptions()
    
class ScrapingOptions(BaseModel):
    max_pages: int = 50
    include_subdomains: bool = False
    follow_links: bool = True
    max_depth: int = 3
    wait_time: int = 1  # seconds between requests
    timeout: int = 30  # seconds per page
    extract_metadata: bool = True
    convert_to_markdown: bool = True

class WebsiteCreate(BaseModel):
    url: HttpUrl
    title: Optional[str] = None
    description: Optional[str] = None
```

**Response Schemas:**
```python
class ScrapingResponse(BaseModel):
    job_id: UUID
    status: str
    message: str
    website_id: Optional[UUID] = None
    
class ProgressUpdate(BaseModel):
    job_id: UUID
    status: str  # pending, processing, completed, failed
    progress: int  # 0-100
    current_url: Optional[str] = None
    pages_scraped: int = 0
    total_pages: Optional[int] = None
    errors: List[str] = []
    
class WebsiteResponse(BaseModel):
    id: UUID
    url: str
    domain: str
    title: Optional[str]
    description: Optional[str]
    status: str
    total_pages: int
    pages_scraped: int
    created_at: datetime
    updated_at: Optional[datetime]
    
class PageResponse(BaseModel):
    id: UUID
    website_id: UUID
    url: str
    title: Optional[str]
    meta_description: Optional[str]
    word_count: Optional[int]
    status: str
    scraped_at: Optional[datetime]
    has_original_content: bool
    has_optimized_content: bool
```

#### 4.2.4 Celery Task Configuration

**celery_app.py:**
```python
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "seo_optimizer",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.scraping", "app.tasks.optimization"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)
```

**Scraping Task:**
```python
@celery_app.task(bind=True)
def scrape_website_task(self, website_id: str, options: dict):
    """Background task for website scraping"""
    try:
        # Update task state
        self.update_state(
            state="PROCESSING",
            meta={"current": 0, "total": 100, "status": "Initializing..."}
        )
        
        # Initialize scraper
        scraper = WebsiteScraper(website_id, options)
        
        # Progress callback
        def progress_callback(current, total, message):
            self.update_state(
                state="PROCESSING",
                meta={"current": current, "total": total, "status": message}
            )
            # Send WebSocket update
            send_websocket_update(website_id, current, total, message)
        
        # Execute scraping
        result = scraper.scrape(progress_callback)
        
        return {"status": "completed", "pages_scraped": result["pages_scraped"]}
        
    except Exception as e:
        self.update_state(
            state="FAILURE",
            meta={"exc_type": type(e).__name__, "exc_message": str(e)}
        )
        raise
```

#### 4.2.5 WebSocket Implementation

**WebSocket Manager:**
```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_text(message)
            
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(client_id)
```

**Progress Updates via WebSocket:**
```python
async def send_scraping_progress(job_id: str, progress: ProgressUpdate):
    message = {
        "type": "scraping_progress",
        "data": progress.dict()
    }
    await manager.broadcast(json.dumps(message))
```

#### 4.2.6 Error Handling & Validation

**Custom Exception Classes:**
```python
class ScrapingException(Exception):
    """Base exception for scraping errors"""
    pass

class InvalidURLException(ScrapingException):
    """Raised when URL is invalid or inaccessible"""
    pass

class ScrapingTimeoutException(ScrapingException):
    """Raised when scraping times out"""
    pass

class RateLimitException(ScrapingException):
    """Raised when rate limit is hit"""
    pass
```

**Global Exception Handler:**
```python
@app.exception_handler(ScrapingException)
async def scraping_exception_handler(request: Request, exc: ScrapingException):
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.__class__.__name__,
            "message": str(exc),
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

**Request Validation Middleware:**
```python
@app.middleware("http")
async def validate_request(request: Request, call_next):
    # Log request
    logger.info(f"{request.method} {request.url.path}")
    
    # Add request ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Process request
    response = await call_next(request)
    
    # Add headers
    response.headers["X-Request-ID"] = request_id
    
    return response
```

### 4.3 Acceptance Criteria
- [ ] All API endpoints return correct responses
- [ ] Database models created and migrated successfully
- [ ] Celery worker processes tasks in background
- [ ] WebSocket connections work for real-time updates
- [ ] Error handling returns meaningful messages
- [ ] API documentation auto-generated at /docs
- [ ] Request validation works for all endpoints
- [ ] Health check endpoint confirms all services running

---

## 5. Phase 2: Supabase Database Setup (Day 6-7)

### 5.1 Objectives
Configure Supabase as the primary database with proper schema, security, and optimization for multi-tenant SaaS.

### 5.2 Detailed Requirements

#### 5.2.1 Supabase Project Setup

**Steps:**
1. Create account at https://supabase.com
2. Create new project with:
   - Project name: "seo-optimizer"
   - Database password: Strong, stored securely
   - Region: Closest to target users
   - Pricing plan: Free tier for MVP

#### 5.2.2 Database Schema Creation

**SQL Migration Scripts:**

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search

-- Create enum types
CREATE TYPE website_status AS ENUM ('pending', 'scraping', 'completed', 'failed');
CREATE TYPE page_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE version_type AS ENUM ('original', 'optimized');

-- Create websites table
CREATE TABLE websites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID,  -- For future multi-tenancy
    url TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    title TEXT,
    description TEXT,
    favicon_url TEXT,
    status website_status DEFAULT 'pending',
    total_pages INTEGER DEFAULT 0,
    pages_scraped INTEGER DEFAULT 0,
    scrape_started_at TIMESTAMPTZ,
    scrape_completed_at TIMESTAMPTZ,
    last_error TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pages table
CREATE TABLE pages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    path TEXT,
    title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    h1_tag TEXT,
    word_count INTEGER,
    status page_status DEFAULT 'pending',
    scraped_at TIMESTAMPTZ,
    error_message TEXT,
    page_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(website_id, url)
);

-- Create content_versions table
CREATE TABLE content_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    version_type version_type NOT NULL,
    version_number INTEGER DEFAULT 1,
    content_markdown TEXT,
    content_html TEXT,
    content_plain TEXT,
    structured_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- For optimized versions
    optimization_type TEXT,
    llm_model TEXT,
    optimization_prompt TEXT,
    parent_version_id UUID REFERENCES content_versions(id),
    improvement_score NUMERIC(3,2),  -- 0.00 to 1.00
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,  -- For future user tracking
    
    UNIQUE(page_id, version_type, version_number)
);

-- Create scraping_jobs table for tracking
CREATE TABLE scraping_jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    job_id TEXT UNIQUE NOT NULL,  -- Celery task ID
    status TEXT DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_url TEXT,
    pages_processed INTEGER DEFAULT 0,
    total_pages INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_log JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_websites_domain ON websites(domain);
CREATE INDEX idx_websites_status ON websites(status);
CREATE INDEX idx_websites_user_id ON websites(user_id);

CREATE INDEX idx_pages_website_id ON pages(website_id);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_url ON pages(url);
CREATE INDEX idx_pages_path ON pages(path);

CREATE INDEX idx_content_versions_page_id ON content_versions(page_id);
CREATE INDEX idx_content_versions_type ON content_versions(version_type);
CREATE INDEX idx_content_versions_active ON content_versions(is_active);

CREATE INDEX idx_scraping_jobs_website_id ON scraping_jobs(website_id);
CREATE INDEX idx_scraping_jobs_job_id ON scraping_jobs(job_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);

-- Add text search indexes
CREATE INDEX idx_pages_title_search ON pages USING gin(to_tsvector('english', title));
CREATE INDEX idx_pages_meta_search ON pages USING gin(to_tsvector('english', meta_description));
CREATE INDEX idx_content_plain_search ON content_versions USING gin(to_tsvector('english', content_plain));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to websites
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 5.2.3 Row Level Security (RLS) Setup

```sql
-- Enable RLS on tables
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- For MVP, allow all authenticated users to see their own data
-- (We'll refine this when we add authentication)

-- Websites policies
CREATE POLICY "Users can view their own websites" ON websites
    FOR SELECT USING (true);  -- Temporarily allow all for MVP

CREATE POLICY "Users can insert their own websites" ON websites
    FOR INSERT WITH CHECK (true);  -- Temporarily allow all for MVP

CREATE POLICY "Users can update their own websites" ON websites
    FOR UPDATE USING (true);  -- Temporarily allow all for MVP

-- Similar policies for other tables (simplified for MVP)
CREATE POLICY "View all pages" ON pages FOR SELECT USING (true);
CREATE POLICY "Insert all pages" ON pages FOR INSERT WITH CHECK (true);
CREATE POLICY "Update all pages" ON pages FOR UPDATE USING (true);

CREATE POLICY "View all content" ON content_versions FOR SELECT USING (true);
CREATE POLICY "Insert all content" ON content_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Update all content" ON content_versions FOR UPDATE USING (true);

CREATE POLICY "View all jobs" ON scraping_jobs FOR SELECT USING (true);
CREATE POLICY "Insert all jobs" ON scraping_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Update all jobs" ON scraping_jobs FOR UPDATE USING (true);
```

#### 5.2.4 Database Functions & Procedures

```sql
-- Function to get website statistics
CREATE OR REPLACE FUNCTION get_website_stats(website_uuid UUID)
RETURNS TABLE(
    total_pages BIGINT,
    scraped_pages BIGINT,
    optimized_pages BIGINT,
    average_word_count NUMERIC,
    last_scrape TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id) as total_pages,
        COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.id END) as scraped_pages,
        COUNT(DISTINCT CASE WHEN cv.version_type = 'optimized' THEN cv.page_id END) as optimized_pages,
        AVG(p.word_count)::NUMERIC as average_word_count,
        MAX(p.scraped_at) as last_scrape
    FROM pages p
    LEFT JOIN content_versions cv ON cv.page_id = p.id
    WHERE p.website_id = website_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old scraping jobs
CREATE OR REPLACE FUNCTION cleanup_old_jobs()
RETURNS void AS $$
BEGIN
    DELETE FROM scraping_jobs 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql;
```

#### 5.2.5 Supabase Client Configuration

**Python Client Setup:**
```python
# app/db/supabase.py
from supabase import create_client, Client
from app.core.config import settings

class SupabaseClient:
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            cls._instance = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY  # Use service key for backend
            )
        return cls._instance
    
    @classmethod
    def get_async_client(cls):
        # For async operations
        from supabase import create_async_client
        return create_async_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )

# Usage example
supabase = SupabaseClient.get_client()
```

**Database Service Layer:**
```python
# app/services/storage/database_service.py
from typing import List, Optional, Dict, Any
from uuid import UUID
from supabase import Client
from app.db.supabase import SupabaseClient

class DatabaseService:
    def __init__(self):
        self.client = SupabaseClient.get_client()
    
    async def create_website(self, url: str, domain: str) -> Dict[str, Any]:
        """Create a new website entry"""
        data = {
            "url": url,
            "domain": domain,
            "status": "pending"
        }
        
        result = self.client.table("websites").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_website(self, website_id: UUID) -> Optional[Dict[str, Any]]:
        """Get website by ID"""
        result = self.client.table("websites").select("*").eq("id", str(website_id)).execute()
        return result.data[0] if result.data else None
    
    async def update_website_status(self, website_id: UUID, status: str, **kwargs):
        """Update website status and optional fields"""
        data = {"status": status, **kwargs}
        
        result = self.client.table("websites").update(data).eq("id", str(website_id)).execute()
        return result.data[0] if result.data else None
    
    async def create_page(self, website_id: UUID, url: str, **kwargs) -> Dict[str, Any]:
        """Create a new page entry"""
        data = {
            "website_id": str(website_id),
            "url": url,
            **kwargs
        }
        
        result = self.client.table("pages").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def bulk_create_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Bulk create pages"""
        result = self.client.table("pages").insert(pages).execute()
        return result.data
    
    async def create_content_version(
        self, 
        page_id: UUID, 
        version_type: str,
        content_markdown: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Create a content version"""
        data = {
            "page_id": str(page_id),
            "version_type": version_type,
            "content_markdown": content_markdown,
            **kwargs
        }
        
        result = self.client.table("content_versions").insert(data).execute()
        return result.data[0] if result.data else None
    
    async def get_pages_by_website(self, website_id: UUID) -> List[Dict[str, Any]]:
        """Get all pages for a website"""
        result = self.client.table("pages").select("*").eq("website_id", str(website_id)).execute()
        return result.data
    
    async def get_content_versions(self, page_id: UUID) -> List[Dict[str, Any]]:
        """Get all content versions for a page"""
        result = (
            self.client.table("content_versions")
            .select("*")
            .eq("page_id", str(page_id))
            .order("created_at", desc=True)
            .execute()
        )
        return result.data
```

### 5.3 Acceptance Criteria
- [ ] Supabase project created and accessible
- [ ] All tables created with proper schema
- [ ] Indexes created for performance optimization
- [ ] RLS policies configured (basic for MVP)
- [ ] Database functions work correctly
- [ ] Python client connects successfully
- [ ] CRUD operations work for all tables
- [ ] pgvector extension enabled for future use

---

## 6. Phase 3: Crawl4AI Integration (Day 8-10)

### 6.1 Objectives
Integrate Crawl4AI for robust web scraping with markdown conversion, progress tracking, and error handling.

### 6.2 Detailed Requirements

#### 6.2.1 Crawl4AI Service Implementation

**Base Crawler Service:**
```python
# app/services/scraping/crawler.py
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from typing import Dict, Any, Optional, List, Callable
import asyncio
from urllib.parse import urlparse, urljoin
import logging

logger = logging.getLogger(__name__)

class WebsiteScraper:
    def __init__(self, website_id: str, options: Dict[str, Any]):
        self.website_id = website_id
        self.options = options
        self.pages_scraped = 0
        self.pages_failed = 0
        self.errors = []
        
        # Configure browser
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=False,
            viewport_width=1920,
            viewport_height=1080,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
        
        # Configure markdown generator
        self.markdown_generator = DefaultMarkdownGenerator(
            content_source="html",
            options={
                "mark_code": True,
                "handle_code_in_pre": True,
                "body_width": 0,
                "skip_internal_links": False,
                "preserve_tags": True,
                "escape": False,
                "decode_unicode": True,
                "strip_empty_lines": False,
                "preserve_code_formatting": True
            }
        )
    
    async def scrape_website(self, url: str, progress_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """Main entry point for scraping a website"""
        try:
            # Parse URL and get domain
            parsed = urlparse(url)
            domain = parsed.netloc
            
            # Update progress
            if progress_callback:
                await progress_callback(0, 100, "Initializing crawler...")
            
            # Discover pages (sitemap or crawl)
            pages_to_scrape = await self._discover_pages(url, domain)
            total_pages = len(pages_to_scrape)
            
            if progress_callback:
                await progress_callback(10, 100, f"Found {total_pages} pages to scrape")
            
            # Initialize crawler
            async with AsyncWebCrawler(config=self.browser_config) as crawler:
                results = []
                
                for idx, page_url in enumerate(pages_to_scrape):
                    try:
                        # Calculate progress
                        progress = 10 + int((idx / total_pages) * 80)
                        
                        if progress_callback:
                            await progress_callback(
                                progress, 100, 
                                f"Scraping page {idx+1}/{total_pages}: {page_url}"
                            )
                        
                        # Scrape individual page
                        page_result = await self._scrape_page(crawler, page_url)
                        results.append(page_result)
                        self.pages_scraped += 1
                        
                        # Rate limiting
                        await asyncio.sleep(self.options.get("wait_time", 1))
                        
                    except Exception as e:
                        logger.error(f"Failed to scrape {page_url}: {str(e)}")
                        self.pages_failed += 1
                        self.errors.append({"url": page_url, "error": str(e)})
                        continue
            
            if progress_callback:
                await progress_callback(100, 100, "Scraping completed")
            
            return {
                "success": True,
                "pages_scraped": self.pages_scraped,
                "pages_failed": self.pages_failed,
                "results": results,
                "errors": self.errors
            }
            
        except Exception as e:
            logger.error(f"Website scraping failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "pages_scraped": self.pages_scraped,
                "pages_failed": self.pages_failed
            }
    
    async def _discover_pages(self, url: str, domain: str) -> List[str]:
        """Discover all pages to scrape from a website"""
        pages = [url]  # Start with the main URL
        
        # Check for sitemap
        sitemap_urls = await self._check_sitemap(url, domain)
        if sitemap_urls:
            pages.extend(sitemap_urls)
        else:
            # Crawl pages if no sitemap
            if self.options.get("follow_links", True):
                discovered = await self._crawl_pages(url, domain)
                pages.extend(discovered)
        
        # Limit pages if specified
        max_pages = self.options.get("max_pages", 50)
        return list(set(pages))[:max_pages]  # Remove duplicates and limit
    
    async def _check_sitemap(self, url: str, domain: str) -> List[str]:
        """Check for sitemap and extract URLs"""
        sitemap_urls = []
        common_sitemaps = [
            "/sitemap.xml",
            "/sitemap_index.xml",
            "/sitemap/sitemap.xml",
            "/sitemaps/sitemap.xml"
        ]
        
        for sitemap_path in common_sitemaps:
            sitemap_url = urljoin(url, sitemap_path)
            try:
                async with AsyncWebCrawler(config=self.browser_config) as crawler:
                    result = await crawler.arun(
                        url=sitemap_url,
                        config=CrawlerRunConfig(
                            cache_mode=CacheMode.DISABLED,
                            wait_until="networkidle",
                            page_timeout=10000
                        )
                    )
                    
                    if result.success and "xml" in result.html.lower():
                        # Parse sitemap (simplified - you'd want proper XML parsing)
                        import re
                        urls = re.findall(r'<loc>(.*?)</loc>', result.html)
                        sitemap_urls.extend([u for u in urls if domain in u])
                        break
                        
            except Exception as e:
                logger.debug(f"No sitemap at {sitemap_url}")
                continue
        
        return sitemap_urls
    
    async def _crawl_pages(self, start_url: str, domain: str) -> List[str]:
        """Crawl website to discover pages"""
        visited = set()
        to_visit = {start_url}
        discovered = []
        max_depth = self.options.get("max_depth", 3)
        current_depth = 0
        
        while to_visit and current_depth < max_depth:
            current_batch = list(to_visit)[:10]  # Process in batches
            to_visit = to_visit - set(current_batch)
            
            for url in current_batch:
                if url in visited:
                    continue
                    
                visited.add(url)
                
                try:
                    async with AsyncWebCrawler(config=self.browser_config) as crawler:
                        result = await crawler.arun(
                            url=url,
                            config=CrawlerRunConfig(
                                cache_mode=CacheMode.ENABLED,
                                wait_until="domcontentloaded",
                                page_timeout=15000
                            )
                        )
                        
                        if result.success:
                            discovered.append(url)
                            
                            # Extract links
                            if result.links:
                                for link in result.links:
                                    if domain in link and link not in visited:
                                        to_visit.add(link)
                                        
                except Exception as e:
                    logger.error(f"Failed to crawl {url}: {str(e)}")
                    continue
            
            current_depth += 1
        
        return discovered
    
    async def _scrape_page(self, crawler: AsyncWebCrawler, url: str) -> Dict[str, Any]:
        """Scrape individual page"""
        crawl_config = CrawlerRunConfig(
            cache_mode=CacheMode.ENABLED,
            stream=False,
            markdown_generator=self.markdown_generator,
            wait_until="networkidle",
            delay_before_return_html=1.0,
            scan_full_page=True,
            page_timeout=self.options.get("timeout", 30) * 1000,
            remove_overlay_elements=True,
            process_iframes=False
        )
        
        result = await crawler.arun(url=url, config=crawl_config)
        
        if not result.success:
            raise Exception(f"Crawl failed: {result.error}")
        
        # Extract metadata
        metadata = {}
        if self.options.get("extract_metadata", True):
            metadata = self._extract_metadata(result)
        
        return {
            "url": url,
            "title": result.title or "",
            "markdown": result.markdown_v2 or result.markdown or "",
            "html": result.html,
            "text": result.text or "",
            "metadata": metadata,
            "word_count": len((result.text or "").split()),
            "links": result.links or [],
            "images": result.images or []
        }
    
    def _extract_metadata(self, result) -> Dict[str, Any]:
        """Extract SEO metadata from crawled page"""
        from bs4 import BeautifulSoup
        
        metadata = {}
        
        try:
            soup = BeautifulSoup(result.html, 'html.parser')
            
            # Meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                metadata['description'] = meta_desc.get('content', '')
            
            # Meta keywords
            meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
            if meta_keywords:
                metadata['keywords'] = meta_keywords.get('content', '')
            
            # H1 tag
            h1 = soup.find('h1')
            if h1:
                metadata['h1'] = h1.get_text(strip=True)
            
            # Open Graph tags
            og_title = soup.find('meta', property='og:title')
            if og_title:
                metadata['og_title'] = og_title.get('content', '')
            
            og_description = soup.find('meta', property='og:description')
            if og_description:
                metadata['og_description'] = og_description.get('content', '')
            
            # Canonical URL
            canonical = soup.find('link', rel='canonical')
            if canonical:
                metadata['canonical_url'] = canonical.get('href', '')
                
        except Exception as e:
            logger.error(f"Failed to extract metadata: {str(e)}")
        
        return metadata
```

#### 6.2.2 Scraping API Integration

**Scraping Endpoint Implementation:**
```python
# app/api/api_v1/endpoints/scraping.py
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from app.schemas.scraping import ScrapingRequest, ScrapingResponse, ScrapingStatus
from app.services.scraping.crawler import WebsiteScraper
from app.services.storage.database_service import DatabaseService
from app.tasks.scraping import scrape_website_task
from app.core.celery_app import celery_app
from uuid import UUID, uuid4
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/initiate", response_model=ScrapingResponse)
async def initiate_scraping(
    request: ScrapingRequest,
    background_tasks: BackgroundTasks,
    db: DatabaseService = Depends()
):
    """Initiate website scraping"""
    try:
        # Validate URL
        url = str(request.url)
        parsed = urlparse(url)
        domain = parsed.netloc
        
        if not domain:
            raise HTTPException(status_code=400, detail="Invalid URL provided")
        
        # Check if website already exists
        existing = await db.get_website_by_url(url)
        if existing and existing['status'] == 'scraping':
            raise HTTPException(
                status_code=409, 
                detail="Website is already being scraped"
            )
        
        # Create or update website entry
        if existing:
            website = await db.update_website_status(
                existing['id'], 
                'pending'
            )
            website_id = existing['id']
        else:
            website = await db.create_website(url, domain)
            website_id = website['id']
        
        # Create scraping job
        job_id = str(uuid4())
        await db.create_scraping_job(website_id, job_id)
        
        # Queue scraping task
        task = scrape_website_task.apply_async(
            args=[website_id, request.options.dict()],
            task_id=job_id
        )
        
        return ScrapingResponse(
            job_id=job_id,
            status="started",
            message="Scraping initiated successfully",
            website_id=website_id
        )
        
    except Exception as e:
        logger.error(f"Failed to initiate scraping: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}", response_model=ScrapingStatus)
async def get_scraping_status(
    job_id: str,
    db: DatabaseService = Depends()
):
    """Get scraping job status"""
    try:
        # Get job from database
        job = await db.get_scraping_job(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Get Celery task status
        task = celery_app.AsyncResult(job_id)
        
        status_mapping = {
            "PENDING": "pending",
            "STARTED": "processing",
            "PROCESSING": "processing",
            "SUCCESS": "completed",
            "FAILURE": "failed",
            "RETRY": "processing",
            "REVOKED": "cancelled"
        }
        
        status = status_mapping.get(task.state, "unknown")
        
        # Get progress info
        progress_info = {}
        if task.state == "PROCESSING":
            progress_info = task.info or {}
        
        return ScrapingStatus(
            job_id=job_id,
            status=status,
            progress=progress_info.get("current", job.get("progress", 0)),
            total_pages=progress_info.get("total", job.get("total_pages")),
            pages_scraped=job.get("pages_processed", 0),
            current_url=progress_info.get("status", job.get("current_url")),
            errors=job.get("error_log", []),
            started_at=job.get("started_at"),
            completed_at=job.get("completed_at")
        )
        
    except Exception as e:
        logger.error(f"Failed to get status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cancel/{job_id}")
async def cancel_scraping(
    job_id: str,
    db: DatabaseService = Depends()
):
    """Cancel scraping job"""
    try:
        # Revoke Celery task
        celery_app.control.revoke(job_id, terminate=True)
        
        # Update job status
        await db.update_scraping_job_status(job_id, "cancelled")
        
        return {"status": "cancelled", "message": "Scraping job cancelled"}
        
    except Exception as e:
        logger.error(f"Failed to cancel job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
```

#### 6.2.3 Progress Tracking via WebSocket

**WebSocket Progress Updates:**
```python
# app/services/websocket/progress_manager.py
from typing import Dict, Any
import json
import asyncio
from app.websocket import manager

class ProgressManager:
    def __init__(self):
        self.active_jobs: Dict[str, Dict[str, Any]] = {}
    
    async def start_job(self, job_id: str, website_id: str):
        """Register a new scraping job"""
        self.active_jobs[job_id] = {
            "website_id": website_id,
            "status": "started",
            "progress": 0,
            "pages_scraped": 0
        }
        
        await self.broadcast_progress(job_id)
    
    async def update_progress(
        self, 
        job_id: str, 
        progress: int, 
        message: str,
        pages_scraped: int = None,
        total_pages: int = None,
        current_url: str = None
    ):
        """Update job progress"""
        if job_id not in self.active_jobs:
            return
        
        job = self.active_jobs[job_id]
        job["progress"] = progress
        job["message"] = message
        job["status"] = "processing"
        
        if pages_scraped is not None:
            job["pages_scraped"] = pages_scraped
        if total_pages is not None:
            job["total_pages"] = total_pages
        if current_url is not None:
            job["current_url"] = current_url
        
        await self.broadcast_progress(job_id)
    
    async def complete_job(self, job_id: str, pages_scraped: int):
        """Mark job as completed"""
        if job_id not in self.active_jobs:
            return
        
        job = self.active_jobs[job_id]
        job["status"] = "completed"
        job["progress"] = 100
        job["pages_scraped"] = pages_scraped
        job["message"] = f"Successfully scraped {pages_scraped} pages"
        
        await self.broadcast_progress(job_id)
        
        # Remove from active jobs after a delay
        await asyncio.sleep(5)
        del self.active_jobs[job_id]
    
    async def fail_job(self, job_id: str, error: str):
        """Mark job as failed"""
        if job_id not in self.active_jobs:
            return
        
        job = self.active_jobs[job_id]
        job["status"] = "failed"
        job["error"] = error
        job["message"] = f"Scraping failed: {error}"
        
        await self.broadcast_progress(job_id)
        
        # Remove from active jobs after a delay
        await asyncio.sleep(5)
        del self.active_jobs[job_id]
    
    async def broadcast_progress(self, job_id: str):
        """Broadcast progress to all connected clients"""
        if job_id not in self.active_jobs:
            return
        
        job = self.active_jobs[job_id]
        
        message = {
            "type": "scraping_progress",
            "data": {
                "job_id": job_id,
                "website_id": job["website_id"],
                "status": job["status"],
                "progress": job["progress"],
                "pages_scraped": job.get("pages_scraped", 0),
                "total_pages": job.get("total_pages"),
                "current_url": job.get("current_url"),
                "message": job.get("message", ""),
                "error": job.get("error")
            }
        }
        
        await manager.broadcast(json.dumps(message))

# Global progress manager instance
progress_manager = ProgressManager()
```

### 6.3 Acceptance Criteria
- [ ] Crawl4AI successfully installed and configured
- [ ] Can scrape a simple website (5-10 pages)
- [ ] Can scrape JavaScript-rendered pages
- [ ] Markdown conversion produces clean output
- [ ] Metadata extraction works (title, description, h1)
- [ ] Progress updates sent via WebSocket in real-time
- [ ] Scraped content stored in Supabase
- [ ] Error handling works for invalid URLs
- [ ] Rate limiting prevents overwhelming target sites
- [ ] Sitemap detection and parsing works

---

## 7. Phase 4: Basic Frontend (Day 11-13)

### 7.1 Objectives
Create a functional React frontend with shadcn/ui components for interacting with the scraping system.

### 7.2 Detailed Requirements

#### 7.2.1 Frontend Setup & Configuration

**Project Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/
│   │   ├── scraping/
│   │   └── content/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   │   └── utils.ts        # Utility functions
│   ├── types/
│   └── styles/
│       └── globals.css      # Tailwind styles
```

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### 7.2.2 Core Components Implementation

**Dashboard Layout:**
```tsx
// src/components/layout/Dashboard.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';

interface DashboardProps {
  children: React.ReactNode;
}

export const Dashboard: React.FC<DashboardProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};
```

**Scraping Form Component:**
```tsx
// src/components/scraping/ScrapingForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Globe } from 'lucide-react';
import { scrapingService } from '@/services/scraping';

export const ScrapingForm: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    maxPages: 50,
    followLinks: true,
    extractMetadata: true,
    convertToMarkdown: true,
    waitTime: 1
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await scrapingService.initiateScraping(url, options);
      
      toast({
        title: "Success",
        description: `Scraping started with job ID: ${response.job_id}`
      });
      
      // Reset form
      setUrl('');
      
      // Redirect to progress view or update state
      // navigate(`/scraping/${response.job_id}`);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to start scraping",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Start Website Scraping</CardTitle>
        <CardDescription>
          Enter a website URL to begin scraping and extracting content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Start Scraping
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-pages">
                Maximum Pages: {options.maxPages}
              </Label>
              <Slider
                id="max-pages"
                min={1}
                max={100}
                step={1}
                value={[options.maxPages]}
                onValueChange={([value]) => 
                  setOptions({ ...options, maxPages: value })
                }
                className="w-[200px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="follow-links">Follow Internal Links</Label>
              <Switch
                id="follow-links"
                checked={options.followLinks}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, followLinks: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="extract-metadata">Extract SEO Metadata</Label>
              <Switch
                id="extract-metadata"
                checked={options.extractMetadata}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, extractMetadata: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="markdown">Convert to Markdown</Label>
              <Switch
                id="markdown"
                checked={options.convertToMarkdown}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, convertToMarkdown: checked })
                }
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
```

**Progress Display Component:**
```tsx
// src/components/scraping/ProgressDisplay.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebSocket } from '@/hooks/useWebSocket';
import { CheckCircle2, XCircle, Loader2, Globe } from 'lucide-react';

interface ProgressDisplayProps {
  jobId: string;
  websiteId?: string;
}

export const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ jobId, websiteId }) => {
  const [progressData, setProgressData] = useState({
    status: 'pending',
    progress: 0,
    pagesScraped: 0,
    totalPages: null,
    currentUrl: '',
    message: 'Initializing...',
    logs: []
  });

  const { subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    // Subscribe to WebSocket updates
    const handleProgress = (data) => {
      if (data.job_id === jobId) {
        setProgressData({
          status: data.status,
          progress: data.progress,
          pagesScraped: data.pages_scraped,
          totalPages: data.total_pages,
          currentUrl: data.current_url,
          message: data.message,
          logs: [...progressData.logs, data.message]
        });
      }
    };

    subscribe('scraping_progress', handleProgress);

    return () => {
      unsubscribe('scraping_progress', handleProgress);
    };
  }, [jobId, subscribe, unsubscribe]);

  const getStatusIcon = () => {
    switch (progressData.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <Globe className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progressData.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Scraping Progress
          </CardTitle>
          <Badge className={getStatusColor()}>
            {progressData.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{progressData.progress}%</span>
          </div>
          <Progress value={progressData.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Pages Scraped</p>
            <p className="font-semibold">
              {progressData.pagesScraped}
              {progressData.totalPages && ` / ${progressData.totalPages}`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Current URL</p>
            <p className="font-semibold truncate" title={progressData.currentUrl}>
              {progressData.currentUrl || 'N/A'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Activity Log</p>
          <ScrollArea className="h-32 w-full rounded border p-2">
            <div className="space-y-1">
              {progressData.logs.map((log, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  {log}
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
```

**Content List Component:**
```tsx
// src/components/content/ContentList.tsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, Edit } from 'lucide-react';
import { contentService } from '@/services/content';
import { formatDistanceToNow } from 'date-fns';

export const ContentList: React.FC = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const data = await contentService.getPages();
      setPages(data.items);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scraped Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scraped</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">
                  {page.title || 'Untitled'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {page.url}
                </TableCell>
                <TableCell>{page.word_count || 0}</TableCell>
                <TableCell>
                  <Badge variant={page.status === 'completed' ? 'success' : 'secondary'}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {page.scraped_at 
                    ? formatDistanceToNow(new Date(page.scraped_at), { addSuffix: true })
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

#### 7.2.3 Service Layer Implementation

**API Service:**
```typescript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token when we implement authentication
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**WebSocket Service:**
```typescript
// src/services/websocket.ts
import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    
    this.socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Set up message handler
    this.socket.on('message', (data) => {
      const message = JSON.parse(data);
      const listeners = this.listeners.get(message.type);
      
      if (listeners) {
        listeners.forEach(listener => listener(message.data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  unsubscribe(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const wsService = new WebSocketService();
```

### 7.3 Acceptance Criteria
- [ ] React app runs without errors
- [ ] shadcn/ui components properly styled
- [ ] Dashboard layout responsive and functional
- [ ] Can input URL and submit scraping request
- [ ] Progress updates display in real-time
- [ ] Content list shows scraped pages
- [ ] WebSocket connection established
- [ ] API calls work correctly
- [ ] Error states handled gracefully
- [ ] Loading states shown appropriately

---

## 8. Success Metrics & Validation

### 8.1 MVP Success Criteria (End of Phase 4)

#### Technical Metrics
- [ ] **Scraping Success Rate**: >90% of attempted pages
- [ ] **Performance**: <5 seconds to start scraping job
- [ ] **Concurrent Jobs**: Support 3+ simultaneous scraping jobs
- [ ] **Content Storage**: Successfully store 100+ pages
- [ ] **WebSocket Reliability**: Real-time updates work consistently
- [ ] **API Response Time**: <500ms for read operations
- [ ] **Frontend Load Time**: <3 seconds initial load

#### Functional Capabilities
- [ ] Can scrape websites with 50+ pages
- [ ] Handles JavaScript-rendered content
- [ ] Extracts SEO metadata accurately
- [ ] Converts HTML to clean Markdown
- [ ] Stores multiple content versions
- [ ] Provides real-time progress updates
- [ ] Lists and displays scraped content

#### User Experience
- [ ] Intuitive URL submission process
- [ ] Clear progress visualization
- [ ] Responsive design works on desktop/tablet
- [ ] Error messages are helpful
- [ ] Can view scraped content easily

### 8.2 Testing Checklist

#### Phase 0 Tests
- [ ] Project structure created correctly
- [ ] All dependencies install without conflicts
- [ ] Environment variables configured
- [ ] Docker compose runs (if using)

#### Phase 1 Tests
- [ ] API documentation generates at /docs
- [ ] Health endpoint returns 200 OK
- [ ] Database models create tables correctly
- [ ] Celery worker starts and accepts tasks
- [ ] WebSocket connections establish

#### Phase 2 Tests
- [ ] Supabase tables created with correct schema
- [ ] Can perform CRUD operations on all tables
- [ ] Indexes improve query performance
- [ ] RLS policies work (basic level)

#### Phase 3 Tests
- [ ] Crawl4AI scrapes test website successfully
- [ ] Markdown conversion produces clean output
- [ ] Progress callbacks fire correctly
- [ ] Content saves to database
- [ ] Error handling works for bad URLs

#### Phase 4 Tests
- [ ] Frontend builds without errors
- [ ] All components render correctly
- [ ] Forms validate input properly
- [ ] WebSocket updates display in real-time
- [ ] Can navigate between pages
- [ ] Responsive design works

### 8.3 Known Limitations (MVP)

These are acceptable for MVP but should be addressed later:

1. **No Authentication**: Anyone can use the system
2. **No Payment Processing**: Free access only
3. **Limited SEO Tools**: Only scraping, no optimization yet
4. **Basic UI**: Functional but not polished
5. **No Export Features**: Can view but not export
6. **Single Tenant**: No user separation
7. **Limited Error Recovery**: Basic error handling only
8. **No Rate Limiting**: Could overwhelm target sites
9. **No Caching**: Re-scrapes same content
10. **Basic Search**: No advanced filtering

---

## 9. Risk Mitigation

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Crawl4AI fails on certain sites | High | Medium | Implement fallback scraper, test on variety of sites |
| Supabase connection issues | High | Low | Local PostgreSQL fallback, connection pooling |
| WebSocket disconnections | Medium | Medium | Implement reconnection logic, fallback to polling |
| Celery task failures | Medium | Medium | Implement retry logic, dead letter queue |
| Large websites timeout | Medium | High | Implement pagination, increase timeouts |
| Memory issues with large scrapes | High | Medium | Stream processing, limit concurrent pages |

### 9.2 Schedule Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Underestimated complexity | Delay launch | Start with simpler sites, iterate |
| Integration issues | Delay launch | Test integrations early and often |
| Dependency conflicts | Development blocked | Use virtual environments, pin versions |
| Learning curve for new tech | Slower development | Reference documentation, use examples |

---

## 10. Next Steps After MVP

Once Phases 0-4 are complete and validated:

1. **Immediate Next** (Week 3):
   - Implement first SEO tool (meta-updater)
   - Add CSV export functionality
   - Basic user feedback collection

2. **Following Week** (Week 4):
   - Convert remaining SEO tools
   - Implement bulk operations
   - Deploy to staging environment

3. **Post-MVP** (Week 5+):
   - Add authentication (Clerk)
   - Implement payments (after validation)
   - Advanced features based on user feedback

---

## Appendix A: Quick Reference

### A.1 Key Commands

```bash
# Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev

# Celery Worker
celery -A app.core.celery_app worker --loglevel=info

# Celery Flower (monitoring)
celery -A app.core.celery_app flower

# Database Migrations
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### A.2 Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Celery Flower**: http://localhost:5555
- **Supabase Dashboard**: https://app.supabase.com

### A.3 Environment Variables

```env
# Required for MVP
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://localhost:6379

# Optional for MVP
OPENAI_API_KEY=sk-...  # For future LLM features
DEEPSEEK_API_KEY=...   # For future LLM features
```

---

This PRD provides complete specifications for building the MVP (Phases 0-4) of your SEO optimization platform. Each phase has clear requirements, acceptance criteria, and implementation details to ensure successful development.