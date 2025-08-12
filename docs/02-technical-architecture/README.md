# Technical Architecture

This section contains all technical documentation including system design, technology choices, and architectural decisions.

## 📁 Documents in this Section

### Core Architecture
- **[Definitive Tech Stack](DEFINITIVE-TECH-STACK.md)**
  - Complete technology stack decisions
  - Frontend: React + Vite
  - Backend: FastAPI + Python
  - Database: Supabase (PostgreSQL + pgvector)

- **[RAG System Documentation](RAG-SYSTEM-DOCUMENTATION.md)**
  - RAG pipeline architecture
  - Embedding strategies
  - Vector search implementation
  - LLM integration patterns

- **[Scraping Architecture Detailed Plan](SCRAPING-ARCHITECTURE-DETAILED-PLAN.md)**
  - Web scraping system design
  - Crawl4AI + Playwright integration
  - Fallback strategies
  - Resource management

### Implementation Details
- **[File Structure & Scalability](FILE-STRUCTURE-SCALABILITY.md)**
  - Project organization
  - Module structure
  - Scaling considerations

- **[API Documentation](API.md)**
  - REST API endpoints
  - WebSocket events
  - Authentication flow
  - Rate limiting

- **[Database Schema](schema.md)**
  - PostgreSQL table structure
  - pgvector configuration
  - Row-level security policies

### Archon Integration
Leveraging existing Archon v2 components:

#### Analysis Documents
- **[Components Reuse Analysis](archon-integration/ARCHON-COMPONENTS-REUSE-ANALYSIS.md)**
- **[Frontend Analysis](archon-integration/ARCHON-FRONTEND-ANALYSIS.md)**
- **[Scraping Tech Stack](archon-integration/ARCHON-SCRAPING-TECH-STACK.md)**
- **[RSK Components to Integrate](archon-integration/RSK-COMPONENTS-TO-INTEGRATE.md)**

#### Reference Implementation
- **[Archon V2 Alpha Reference](archon-reference-implementation/)**
  - Complete working codebase
  - Frontend (React + Vite) implementation
  - Backend (FastAPI) with MCP server
  - Proven patterns and components to build upon
  - See [Reference README](archon-reference-implementation/REFERENCE-README.md) for details

## 🎯 Purpose

Technical documentation for:
- System design decisions
- Implementation guidelines
- Architecture patterns
- Integration specifications

## 👥 Intended Audience

- Backend developers
- Frontend developers
- DevOps engineers
- Technical architects

## 🔧 Key Technologies

- **Frontend**: React 18.3.1, Vite 5.2.0, shadcn/ui
- **Backend**: FastAPI 0.109+, Python 3.11+
- **Database**: PostgreSQL 15+, pgvector
- **Scraping**: Crawl4AI, Playwright
- **AI/LLM**: OpenAI, Claude, DeepSeek