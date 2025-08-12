# RAG Agent for Website Content Migration and Enhancement

## Executive Summary

A comprehensive web-based platform for migrating and enhancing e-commerce website content using AI-powered optimization. The system scrapes entire websites, converts content to Markdown, stores both original and optimized versions in a database, and provides export capabilities to various e-commerce platforms.

## System Overview

### Core Purpose
Transform static e-commerce content into optimized, SEO-friendly material while maintaining version control between original and enhanced content.

### Key Features
- **Multi-site Web Scraping**: Crawl entire e-commerce websites with sitemap support
- **Markdown Conversion**: Convert HTML to clean, structured Markdown
- **AI-Powered Optimization**: Use multiple LLMs for content enhancement
- **Version Control**: Link original and optimized content in database
- **In-Database Editing**: Edit content directly within the platform
- **Multi-Format Export**: Export to CSV, Markdown, WordPress, Shopify
- **Real-time Progress**: Track scraping and optimization progress
- **Modular Architecture**: Scalable microservices design

## Technical Architecture

### Technology Stack

#### Frontend (Web Dashboard)
- **Framework**: Next.js 14+ with App Router
- **UI Components**: Radix UI, Shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: Zustand/TanStack Query
- **Real-time**: Socket.IO client
- **Deployment**: Vercel

#### Backend (API & Processing)
- **Framework**: FastAPI (Python)
- **RAG Pipeline**: LangChain/LlamaIndex
- **Web Scraping**: Built on Archon's crawling service
- **Task Queue**: Celery with Redis
- **Real-time**: Socket.IO server
- **Vector Store**: pgvector (Supabase)

#### Database (Supabase)
- **Primary DB**: PostgreSQL with pgvector
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **Auth**: Supabase Auth

#### AI/LLM Integration
- **Primary Models**: DeepSeek, Claude, GPT-4
- **Embeddings**: OpenAI text-embedding-3-small
- **Model Router**: Dynamic model selection based on task
- **Rate Limiting**: Token bucket algorithm

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Dashboard (Next.js)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Scraping   │  │  Optimization │  │    Export/Import      │ │
│  │   Manager    │  │    Studio     │  │      Manager          │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   WebSocket/REST API   │
                    └───────────┬───────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                     Backend Services (FastAPI)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Crawler    │  │  RAG Pipeline │  │   Export Service      │ │
│  │   Service    │  │    Service    │  │                       │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ LLM Router  │  │  Embedding    │  │   Task Queue          │ │
│  │             │  │   Service     │  │   (Celery)            │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │      Supabase         │
                    │  ┌─────────────────┐  │
                    │  │   PostgreSQL    │  │
                    │  │   + pgvector    │  │
                    │  └─────────────────┘  │
                    │  ┌─────────────────┐  │
                    │  │     Storage     │  │
                    │  └─────────────────┘  │
                    └───────────────────────┘
```

## Data Flow

### 1. Website Scraping Flow
```
User Input URL → Validate URL → Extract Sitemap → 
Queue Pages → Crawl Pages → Convert to Markdown → 
Store Original → Generate Embeddings → Index Content
```

### 2. Content Optimization Flow
```
Select Content → Choose LLM → Generate Prompts → 
Process with AI → Store Optimized → Link Versions → 
Update Embeddings → Enable Editing
```

### 3. Export Flow
```
Select Content → Choose Format → Transform Data → 
Validate Output → Generate Files → Upload/Download
```

## Database Schema

### Core Tables

#### `websites`
```sql
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `pages`
```sql
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID REFERENCES websites(id),
    url TEXT NOT NULL,
    title VARCHAR(255),
    meta_description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    scraped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `content_versions`
```sql
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES pages(id),
    version_type VARCHAR(50) NOT NULL, -- 'original' or 'optimized'
    content_markdown TEXT,
    content_json JSONB,
    llm_model VARCHAR(100),
    optimization_prompt TEXT,
    parent_version_id UUID REFERENCES content_versions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `content_embeddings`
```sql
CREATE TABLE content_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_version_id UUID REFERENCES content_versions(id),
    embedding vector(1536),
    chunk_index INTEGER,
    chunk_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Scraping Endpoints
- `POST /api/scraping/start` - Initiate website scraping
- `GET /api/scraping/status/{job_id}` - Get scraping progress
- `POST /api/scraping/stop/{job_id}` - Stop ongoing scrape
- `GET /api/scraping/results/{website_id}` - Get scraped pages

### Content Management
- `GET /api/content/pages` - List all pages with content
- `GET /api/content/{page_id}/versions` - Get content versions
- `POST /api/content/{page_id}/optimize` - Optimize page content
- `PUT /api/content/version/{version_id}` - Edit content version
- `POST /api/content/bulk-optimize` - Bulk optimization

### RAG Operations
- `POST /api/rag/search` - Semantic search across content
- `POST /api/rag/embed` - Generate embeddings for content
- `GET /api/rag/similar/{content_id}` - Find similar content

### Export/Import
- `POST /api/export/csv` - Export to CSV format
- `POST /api/export/markdown` - Export as Markdown files
- `POST /api/export/wordpress` - Generate WordPress import
- `POST /api/export/shopify` - Generate Shopify products

### LLM Management
- `GET /api/llm/models` - List available models
- `POST /api/llm/test` - Test model connectivity
- `GET /api/llm/usage` - Get usage statistics

## Key Features Implementation

### 1. Multi-LLM Support
```python
class LLMRouter:
    def __init__(self):
        self.models = {
            'deepseek': DeepSeekClient(),
            'claude': ClaudeClient(),
            'openai': OpenAIClient(),
            'groq': GroqClient()  # Free tier models
        }
    
    async def optimize_content(self, content, model_name, prompt):
        model = self.models.get(model_name)
        return await model.generate(prompt, content)
```

### 2. Content Version Linking
```python
class ContentVersionManager:
    async def create_optimized_version(self, original_id, optimized_content, llm_model):
        return await self.db.content_versions.create({
            'parent_version_id': original_id,
            'version_type': 'optimized',
            'content_markdown': optimized_content,
            'llm_model': llm_model
        })
```

### 3. Real-time Progress Updates
```python
@socketio.on('scraping_progress')
async def handle_progress(sid, data):
    await sio.emit('progress_update', {
        'job_id': data['job_id'],
        'progress': data['progress'],
        'current_url': data['url'],
        'pages_scraped': data['count']
    })
```

## Building on Archon

### What We Use from Archon
1. **Crawling Service** - Core web scraping functionality
2. **Markdown Conversion** - HTML to Markdown pipeline
3. **RAG Infrastructure** - Embedding and search capabilities
4. **Multi-LLM Support** - Agent architecture for different models
5. **FastAPI Structure** - Modular service organization

### Extensions Needed
1. **E-commerce Scrapers** - Product-specific extractors
2. **Content Optimizer** - SEO and conversion optimization
3. **Version Control** - Link original/optimized content
4. **Export Pipelines** - Platform-specific formatters
5. **Bulk Operations** - Batch processing capabilities

## Deployment

### Development Environment
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Production Deployment
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway/Render
- **Database**: Supabase (managed)
- **Redis**: Upstash Redis

### Environment Variables
```env
# Backend
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key
REDIS_URL=your_redis_url

# Frontend
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=your_api_url
```

## Security Considerations

1. **API Authentication**: JWT tokens via Supabase Auth
2. **Rate Limiting**: Per-user and per-model limits
3. **Input Validation**: Strict URL and content validation
4. **Data Encryption**: At-rest encryption in Supabase
5. **CORS Policy**: Restrictive CORS for API endpoints

## Monitoring & Analytics

1. **Application Monitoring**: Sentry for error tracking
2. **Performance Metrics**: Prometheus + Grafana
3. **Usage Analytics**: Custom dashboard for LLM usage
4. **Cost Tracking**: Per-model cost aggregation

## Future Enhancements

1. **AI Features**
   - Auto-categorization of products
   - Image alt-text generation
   - Multi-language translation
   - A/B testing content variants

2. **Platform Integrations**
   - WooCommerce export
   - BigCommerce support
   - Custom CMS adapters
   - API-first headless commerce

3. **Advanced RAG**
   - Fine-tuned embeddings for e-commerce
   - Hybrid search (keyword + semantic)
   - Query expansion and rewriting
   - Relevance feedback loops

4. **Collaboration**
   - Multi-user workspaces
   - Content approval workflows
   - Change history and rollback
   - Comments and annotations