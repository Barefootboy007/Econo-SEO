# CLAUDE.md - Project Context for SEO Optimizer

## 🎯 PROJECT VISION

Building an **SEO Optimization SaaS Platform** that:
1. **Scrapes websites** using Crawl4AI (with multiple input methods)
2. **Stores content** in a multi-tenant database (Supabase with RLS)
3. **Applies AI-powered SEO tools** to optimize content
4. **Provides search & RAG** capabilities across all scraped content
5. **Exports optimized content** via CSV or direct CMS integration

### Core User Workflow:
1. **Input URLs**: Manual upload, sitemap parsing, or recursive crawling (like Screaming Frog)
2. **Scrape Content**: Using configurable Crawl4AI settings (stored per user)
3. **Store in Database**: Original content preserved, versions tracked
4. **Apply SEO Tools**: 8 AI-powered optimization tools (using user's API keys)
5. **Edit & Review**: Database-driven editor with real-time tool application
6. **Export Results**: CSV download or bulk upload to WordPress/CMS

### Key Architecture Decisions:
- **Multi-tenancy**: Row-Level Security (RLS) - users only see their own data
- **Concurrency**: Crawl4AI connection pooling (5-10 instances) for multiple users
- **Processing**: Hybrid approach - immediate for <10 URLs, batch for large crawls
- **Version Control**: Immutable content versions with full history tracking
- **API Keys**: Per-user encrypted storage for OpenAI/DeepSeek/etc
- **Search**: Page-based RAG using pgvector for semantic search
- **External Data**: GSC performance metrics drive optimization decisions
- **Integrations**: Google Search Console (OAuth), Analytics, Ahrefs/SEMrush, ScrapingDog (fallback)

## CRITICAL PROJECT FACTS

### Frontend Stack
- **Framework**: React with Vite (NOT Next.js!)
- **Port**: http://localhost:5173/ (NOT 3000!)
- **Routing**: Tanstack Router (routes in `src/routes/` directory)
- **UI Library**: shadcn/ui (NOT Chakra UI - that's old code being migrated)
- **Styling**: Tailwind CSS
- **Auth**: Clerk

### Backend Stack
- **Framework**: FastAPI
- **Port**: http://localhost:8000/
- **API Base**: /api/v1/
- **Scraping**: Crawl4AI (pure implementation, NO BeautifulSoup in our code)
- **Database**: Supabase (PostgreSQL)

## PROJECT RULES

1. **NO BeautifulSoup** - User explicitly stated to use only Crawl4AI for scraping
2. **Use shadcn/ui** - Project is migrating FROM Chakra UI TO shadcn/ui
3. **Frontend runs on port 5173** - This is Vite's default, not 3000
4. **Routes go in src/routes/** - Using Tanstack Router, not Next.js pages
5. **Follow the PRD and TODO list** - Stay focused on the documented requirements

## CURRENT PROJECT STATE

### Completed (75% MVP)
- ✅ Phase 0: Project setup with FastAPI + React + Supabase
- ✅ Phase 1: Backend base with authentication
- ✅ Phase 3: Crawl4AI integration with SEO extraction
- ✅ Phase 4: Frontend migration to shadcn/ui
- ✅ Scraper settings page with OpenAPI client integration

### Next Priority: Database Schema (Phase 2)
- 🎯 Create multi-tenant database tables
- 🎯 Implement Row-Level Security (RLS)
- 🎯 Enable pgvector for RAG/search

### Upcoming Work
- Crawler pool management (5-10 instances)
- WebSocket for real-time progress
- Celery + Redis for background tasks
- URL discovery methods (sitemap, recursive)
- SEO tools integration (8 tools)
- Content editor with version control
- Export/Import functionality

## ARCHITECTURE NOTES

### Scraping Architecture (from docs/02-technical-architecture/)
- Modular component design with API Gateway, Job Orchestrator, Scraper Workers
- Multi-tenancy with tier-based resource allocation:
  - Free: 10 pages/hour
  - Starter: 100 pages/hour  
  - Pro: 500 pages/hour
  - Enterprise: Unlimited
- Queue-based solution for concurrent users
- Following Archon architecture patterns for Crawl4AI configuration

### File Structure
```
frontend/
├── src/
│   ├── routes/          # Tanstack Router routes (NOT pages/)
│   │   ├── _layout/     # Layout routes
│   │   └── *.tsx        # Page routes
│   ├── components/
│   │   └── ui/          # shadcn/ui components
│   └── pages/           # WRONG - don't use this directory!
```

## COMMON MISTAKES TO AVOID

1. **Don't assume Next.js** - This is Vite + React
2. **Don't use port 3000** - Use 5173
3. **Don't put routes in pages/** - Use routes/
4. **Don't use Chakra UI** - Use shadcn/ui
5. **Don't import BeautifulSoup** - Use pure Crawl4AI
6. **Don't drift from requirements** - Follow PRD and TODO list

## KEY COMMANDS

```bash
# Frontend (runs on 5173)
cd frontend && npm run dev

# Backend (runs on 8000)
cd backend && .\venv\Scripts\activate && python -m uvicorn app.main:app --reload

# Add shadcn components
cd frontend && npx shadcn@latest add [component-name] --yes
```

## DATABASE SCHEMA OVERVIEW

### Multi-tenant Tables (all with user_id for RLS):
- `websites` - User's domains with crawl settings
- `pages` - Individual URLs per website
- `content_versions` - Version control (original/optimized/draft) with parent linking
- `seo_metadata` - Extracted SEO data per content version
- `scrape_jobs` - Track scraping progress
- `api_keys` - Encrypted user API keys
- `page_embeddings` - For RAG/semantic search

### External Data Tables:
- `external_connections` - OAuth tokens for GSC, GA, etc.
- `gsc_performance` - Daily Google Search Console metrics
- `gsc_page_insights` - Aggregated insights and opportunities
- `external_seo_metrics` - Ahrefs, SEMrush, Moz data
- `keyword_tracking` - Position tracking with history

### Processing Strategy:
- **Fast Path**: <10 URLs → immediate processing
- **Batch Path**: >10 URLs → background queue
- **Crawler Pool**: 5-10 Crawl4AI instances shared across users
- **Caching**: 24-hour TTL to avoid duplicate scraping
- **Data-Driven**: GSC metrics inform optimization prompts
- **Version Tracking**: Compare performance across content versions