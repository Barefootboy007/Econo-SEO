# Archon V2 Alpha - Reference Implementation

## ⚠️ Important Note
This is the **reference codebase** for Archon V2 Alpha, which serves as the foundation for the RAG Content Migration System. This is NOT the active development codebase, but rather a reference implementation to guide our development.

## 📚 Purpose

This complete Archon V2 codebase is maintained here as a reference for:
- Understanding existing architecture patterns
- Reusing proven components
- Learning from implementation decisions
- Extracting tested functionality

## 🏗️ Architecture Overview

### Frontend (React + Vite)
Located in `archon-ui-main/`:
- **UI Components**: Reusable components in `src/components/`
- **Services**: API integration patterns in `src/services/`
- **Contexts**: State management patterns
- **Hooks**: Custom React hooks for various functionalities

### Backend (FastAPI + Python)
Located in `python/`:
- **Server**: Main FastAPI application with modular services
- **MCP Integration**: Model Context Protocol server implementation
- **Agents**: Document, RAG, and task agents
- **Services**: Embeddings, knowledge base, crawling, storage

### Documentation
Located in `docs/`:
- Docusaurus-based documentation site
- API references
- Architecture guides
- Component documentation

## 🔑 Key Components to Leverage

### For RAG Content Migration System:

#### Web Scraping & Crawling
- `python/src/server/services/rag/crawling_service.py` - Core crawling logic
- `python/src/server/services/knowledge/crawl_orchestration_service.py` - Orchestration patterns
- Progress tracking and WebSocket broadcasting patterns

#### Content Processing
- `python/src/server/utils/document_processing.py` - Document parsing
- `python/src/server/services/knowledge/code_extraction_service.py` - Content extraction
- Markdown conversion pipelines

#### RAG Pipeline
- `python/src/server/services/embeddings/` - Embedding services
- `python/src/server/services/search/vector_search_service.py` - Vector search
- `python/src/agents/rag_agent.py` - RAG agent implementation

#### UI Components
- Knowledge base components in `archon-ui-main/src/components/knowledge-base/`
- Progress cards and real-time updates
- Project management interfaces

#### API Patterns
- FastAPI route organization in `python/src/server/fastapi/`
- WebSocket/SocketIO integration
- Authentication and middleware patterns

## 📂 Structure

```
archon-reference-implementation/
├── archon-ui-main/          # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API service layers
│   │   ├── pages/          # Main application pages
│   │   └── hooks/          # Custom React hooks
│   └── test/               # Frontend tests
│
├── python/                  # Python backend
│   ├── src/
│   │   ├── server/         # FastAPI server
│   │   ├── agents/         # AI agents
│   │   └── mcp/           # MCP server
│   └── tests/             # Backend tests
│
├── docs/                   # Documentation site
└── migration/             # Database migrations
```

## 🚀 Components Already Analyzed

The following analysis documents in `../archon-integration/` provide insights into reusable components:

1. **[Components Reuse Analysis](../archon-integration/ARCHON-COMPONENTS-REUSE-ANALYSIS.md)** - What can be directly reused
2. **[Frontend Analysis](../archon-integration/ARCHON-FRONTEND-ANALYSIS.md)** - UI component analysis
3. **[Scraping Tech Stack](../archon-integration/ARCHON-SCRAPING-TECH-STACK.md)** - Web scraping implementation
4. **[RSK Components](../archon-integration/RSK-COMPONENTS-TO-INTEGRATE.md)** - Specific components to integrate

## 💡 Usage Guidelines

### Do:
- ✅ Reference patterns and architectures
- ✅ Copy and adapt components as needed
- ✅ Learn from implementation decisions
- ✅ Use as a guide for best practices

### Don't:
- ❌ Modify this reference codebase directly
- ❌ Run this code in production
- ❌ Confuse with active development code

## 🔗 Related Documentation

- [Master PRD](../../01-product-vision/MASTER-PRODUCT-REQUIREMENTS-DOCUMENT.md) - Product requirements
- [Tech Stack](../DEFINITIVE-TECH-STACK.md) - Technology decisions
- [RAG System Docs](../RAG-SYSTEM-DOCUMENTATION.md) - RAG architecture

## 📝 Notes

This reference implementation includes:
- Complete working MCP server
- Functional web scraping pipeline
- RAG system with embeddings
- Multi-LLM support
- Real-time progress tracking
- Comprehensive test suites

Use this as a foundation to build the RAG Content Migration System while adapting and improving based on specific requirements.