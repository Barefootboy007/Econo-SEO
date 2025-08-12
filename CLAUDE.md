# CLAUDE.md - Project Context for Ecom Optimizer

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

### Completed
- ✅ Frontend migration to shadcn/ui (homepage, pricing, features, dashboard)
- ✅ Pure Crawl4AI scraper implementation
- ✅ Scraping API endpoints with rate limiting
- ✅ Authentication flow fixed

### In Progress
- 🔄 Creating scraper settings page (needs to be in routes/, not pages/)

### TODO
- WebSocket support for real-time scraping progress
- Celery + Redis for background tasks
- Frontend scraper settings page (properly integrated with Tanstack Router)

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

## CURRENT TASK CONTEXT

User wants a scraper settings page that:
1. Allows users to configure scraping behavior
2. Has presets (fast, standard, thorough, stealth)
3. Integrates with the existing app structure
4. Uses shadcn/ui components
5. Works with Tanstack Router (NOT Next.js pages)

The page was mistakenly created in `src/pages/` but needs to be in `src/routes/` to work with Tanstack Router.