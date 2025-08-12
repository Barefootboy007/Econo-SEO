# Definitive Tech Stack for RAG Content Migration System

## Overview

This document provides the definitive technology stack for the RAG Content Migration System, resolving conflicts found across various documentation files and establishing a clear, consistent architecture aligned with MVP goals.

## Tech Stack Conflicts Resolved

### Frontend Framework Conflict
- **ROADMAP-RAG-CONTENT-MIGRATION.md**: Suggests Next.js 14+
- **FRONTEND-FRAMEWORK-DECISION.md**: Recommends keeping React + Vite
- **Archon Current**: Uses React 18.3.1 + Vite 5.2.0

**✅ DECISION: React + Vite**
- Leverage existing Archon codebase
- Faster time to MVP
- No SEO requirements for authenticated SaaS

### State Management Conflict
- **ROADMAP**: Suggests Zustand
- **Archon Current**: Uses Context API
- **RSK**: No specific state management

**✅ DECISION: Zustand for new features, keep Context for existing**
- Gradual migration approach
- Better performance for complex state

### File Structure Conflict
- **FILE-STRUCTURE-SCALABILITY.md**: Suggests Next.js app directory structure
- **Current Archon**: Traditional React structure

**✅ DECISION: Adapt scalable structure for React**
- Use feature-based organization
- Keep proven patterns from Archon

## Definitive Tech Stack

### Frontend

#### Core Framework
```
Framework: React 18.3.1
Build Tool: Vite 5.2.0
Language: TypeScript 5.0+
Styling: Tailwind CSS 3.4+
UI Components: shadcn/ui (replacing Archon custom components)
```

#### State & Data Management
```
State Management: Zustand 4.5+ (new features)
Data Fetching: TanStack Query v5
Forms: React Hook Form + Zod
WebSocket: Socket.IO Client 4.7+
```

#### Authentication & Payments
```
Authentication: Clerk React SDK
Payments: Polar.sh integration
```

#### Development Tools
```
Linting: ESLint 8+
Formatting: Prettier 3+
Testing: Vitest + React Testing Library
E2E Testing: Playwright
```

### Backend

#### Core Framework
```
Framework: FastAPI 0.109+
Language: Python 3.11+
Server: Uvicorn (ASGI)
```

#### Web Scraping
```
Primary Engine: Crawl4AI 0.6.2
Browser Automation: Playwright (via Crawl4AI)
HTML Processing: BeautifulSoup4
Markdown Conversion: Crawl4AI built-in
```

#### Task Queue & Caching
```
Queue System: Database queue (MVP) → Redis + Celery (Scale)
Caching: Redis (when scaling)
Background Jobs: FastAPI BackgroundTasks (MVP) → Celery (Scale)
```

#### AI/LLM Integration
```
Embeddings: OpenAI text-embedding-3-small
Primary LLM: OpenAI GPT-4/GPT-3.5
LLM Router: Custom implementation
Vector Operations: pgvector
RAG Framework: Custom (not LangChain/LlamaIndex for MVP)
```

#### Authentication & Security
```
Auth Validation: Clerk webhook validation
API Security: FastAPI dependencies
Rate Limiting: slowapi (MVP) → Redis-based (Scale)
CORS: FastAPI CORSMiddleware
```

### Database

#### Primary Database
```
Provider: Supabase
Database: PostgreSQL 15+
Extensions: pgvector, uuid-ossp
```

#### Storage Strategy
```
Structured Data: PostgreSQL tables
Vector Storage: pgvector in same database
File Storage: Supabase Storage (MVP) → S3 (Scale)
Embeddings: 1536 dimensions (OpenAI standard)
```

#### Key Tables
```sql
- users (synced from Clerk)
- websites
- scraping_jobs
- content_versions
- content_embeddings
- usage_tracking
- extraction_templates
```

### Infrastructure

#### Development
```
Containerization: Docker + Docker Compose
Environment Management: .env files
Package Management: 
  - Frontend: npm/pnpm
  - Backend: pip + requirements.txt (MVP) → Poetry (Scale)
```

#### Production (MVP)
```
Frontend Hosting: Vercel/Netlify (static)
Backend Hosting: Railway/Render
Database: Supabase (managed)
Monitoring: Sentry (errors) + Supabase Analytics
```

#### Production (Scale)
```
Container Orchestration: Kubernetes
CI/CD: GitHub Actions
CDN: CloudFlare
Object Storage: S3-compatible
Message Queue: Redis Cluster
```

### Third-Party Services

#### Required for MVP
```
OpenAI API: LLM and embeddings
Clerk: Authentication
Polar.sh: Payments and subscriptions
Supabase: Database and storage
Sentry: Error tracking
```

#### Optional/Future
```
Proxy Service: BrightData/ScraperAPI (when needed)
Email Service: Resend/SendGrid
Analytics: PostHog/Plausible
CDN: CloudFlare
```

## Architecture Decisions

### 1. Monorepo Structure
```
project-root/
├── frontend/          # React + Vite app
├── backend/           # FastAPI app
├── database/          # Migrations and schemas
├── shared/            # Shared types and utilities
└── infrastructure/    # Docker and deployment configs
```

### 2. API Design
```
Style: RESTful with WebSocket for real-time
Versioning: URL-based (/api/v1/)
Documentation: OpenAPI/Swagger auto-generated
Response Format: JSON with consistent schema
```

### 3. Security Architecture
```
Authentication Flow: Clerk → JWT → FastAPI validation
Data Isolation: Row Level Security in Supabase
API Security: Rate limiting + API key validation
Secrets Management: Environment variables (MVP) → Vault (Scale)
```

### 4. Scraping Architecture
```
MVP Approach:
- Single worker process
- Database queue
- Simple retry logic
- No proxy support

Scale Approach:
- Multiple workers
- Redis queue with priorities  
- Smart retry with backoff
- Proxy rotation support
```

### 5. Data Flow
```
1. User Request → API Gateway
2. API → Job Queue
3. Worker → Crawl4AI → Parse → Store
4. Store → Generate Embeddings → pgvector
5. Optimize → LLM API → Store Version
6. Export → Transform → Download
```

## Technology Justifications

### Why These Choices?

#### React + Vite over Next.js
- 40+ existing components in Archon
- No SEO requirements for SaaS dashboard
- Faster development with existing codebase
- Better separation of concerns

#### Crawl4AI for Scraping
- Already integrated in Archon
- Handles JavaScript rendering
- Built-in Markdown conversion
- Proven reliability

#### Supabase for Database
- Managed PostgreSQL with pgvector
- Built-in auth (backup option)
- Real-time subscriptions
- Row Level Security
- Generous free tier

#### Clerk for Authentication
- Zero auth code to write
- Professional UI components
- Webhook-based user sync
- Social login support

#### FastAPI for Backend
- Native async support
- Automatic API documentation
- Fast performance
- Easy integration with Python ML libraries

## Migration Path from MVP to Scale

### Phase 1: MVP (0-100 users)
```
- Everything in Supabase
- Single backend server
- Database queue
- Basic monitoring
```

### Phase 2: Growth (100-1000 users)
```
- Add Redis for queue
- Move to Celery workers
- Add CDN for static assets
- Implement caching layer
```

### Phase 3: Scale (1000+ users)
```
- Kubernetes deployment
- Multiple worker pools
- S3 for content storage
- Global proxy network
- Multi-region deployment
```

## Cost Estimates

### MVP Monthly Costs
```
Supabase: $25 (Pro tier)
Clerk: $25 (up to 1000 users)
OpenAI: $100-500 (usage-based)
Hosting: $50 (Vercel + Railway)
Monitoring: $0 (free tiers)
Total: ~$200-600/month
```

### Scale Monthly Costs
```
Database: $200+ (managed PostgreSQL)
Clerk: $50+ (growth tier)
OpenAI: $1000+ (usage-based)
Infrastructure: $500+ (K8s + CDN)
Monitoring: $100+
Total: ~$2000+/month
```

## Development Priorities

### Week 1-2: Foundation
1. Fork Archon and clean up
2. Integrate Clerk authentication
3. Set up Supabase schema
4. Basic scraping with Crawl4AI

### Week 3-4: Core Features  
1. Content version management
2. Basic LLM optimization
3. Simple export functionality
4. Usage tracking

### Week 5-6: Polish
1. Polar.sh payment integration
2. Error handling
3. Performance optimization
4. Documentation

### Week 7-8: Launch Prep
1. Testing and bug fixes
2. Monitoring setup
3. Documentation
4. Beta user onboarding

## Conclusion

This tech stack provides:
- **Fast MVP delivery** by leveraging Archon's existing code
- **Proven technologies** that work at scale
- **Clear upgrade paths** without major rewrites
- **Cost-effective** operation for a bootstrapped SaaS

The key is starting simple with room to grow. Every technology choice has a clear migration path to handle increased scale without requiring fundamental architecture changes.