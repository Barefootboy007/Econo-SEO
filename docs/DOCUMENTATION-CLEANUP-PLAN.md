# Documentation Cleanup Plan - SEO Optimization SaaS

## Overview
This document identifies which files to keep, modify, or remove based on the current project direction: **FastAPI + React + Supabase** for an SEO optimization SaaS with 8 core tools.

## 📁 Directory Assessment

### ✅ **KEEP** - Essential Documentation

#### 01-product-vision/
- **KEEP**: `notes.md` (your core vision)
- **REMOVE**: All RAG-focused docs (Phase 4, not MVP):
  - `MASTER-PRD-RAG-CONTENT-MIGRATION.md`
  - `MASTER-PRODUCT-REQUIREMENTS-DOCUMENT.md` 
  - `CRITICAL-ASSESSMENT-USER-PERSPECTIVES.md`
  - `USE-CASE-SCENARIOS.md`

#### 02-technical-architecture/
- **KEEP & USE**:
  - ✅ `DEFINITIVE-TECH-STACK.md` (your chosen stack)
  - ✅ `SCRAPING-ARCHITECTURE-DETAILED-PLAN.md` (excellent queue design)
  - ✅ `API.md` (if it matches FastAPI structure)
  
- **REMOVE** (not aligned with current direction):
  - ❌ `FILE-STRUCTURE-SCALABILITY.md` (Next.js focused)
  - ❌ `RAG-SYSTEM-DOCUMENTATION.md` (Phase 4, not MVP)
  - ❌ Entire `archon-integration/` folder (you're not using Archon)
  - ❌ Entire `archon-reference-implementation/` folder (200+ files of Archon code you don't need)

#### 03-development-planning/
- **KEEP**:
  - ✅ `FASTAPI-SAAS-SETUP-GUIDE.md` (new guide we just created)
  - ✅ `DEVELOPMENT-STEPS-MVP.md` (if aligned with FastAPI)
  
- **REMOVE** (outdated/conflicting):
  - ❌ `ROADMAP-RAG-CONTENT-MIGRATION.md` (RAG focus, not MVP)
  - ❌ `IMPLEMENTATION-ROADMAP-MVP.md` (likely outdated)
  - ❌ `IMPLEMENTATION-ROADMAP-MVP-REVISED.md` (likely outdated)
  - ❌ `CRITICAL-DECISION-POINTS.md` (decisions already made)
  - ❌ `PHASE-2-FEATURES-ROADMAP.md` (reassess after MVP)

#### 04-features-specs/
- **KEEP BUT MODIFY**:
  - 📝 `CORE-FUNCTIONS-SPECIFICATION.md` (remove RAG/Archon references, focus on 8 tools)
  - ✅ `CSS-EXTRACTION-PAGE-TYPE-DETECTION.md` (useful for scraping)
  - ✅ `scraper dashboard.md` (adapt for React/shadcn)
  
- **REMOVE**:
  - ❌ `URL quality rating.md` (if not relevant)
  - ❌ `scraping-extra.md` (if redundant)

#### 05-business-strategy/
- **KEEP**:
  - ✅ `HYBRID-PRICING-MODEL.md` (pricing strategy)
  
- **REVIEW**:
  - 📝 `AI-feedback.md` (keep if valuable insights)

#### 06-research/
- **REMOVE ALL** (decisions made):
  - ❌ `FRONTEND-FRAMEWORK-DECISION.md` (you chose React)
  - ❌ `background-research.md`
  - ❌ `third-party-scrapers.md`

#### 07-workflows/n8n/
- **KEEP ALL** ✅ (these are your 8 SEO tools to convert):
  - `blog-page-updator.json`
  - `category-page-creator.json`
  - `category-page-rewriter.json`
  - `content-writer.json`
  - `metadata-updatorr.json`
  - `product-rewriter.json`
  - `service-page-writer`
  - `README.md`

#### context-engineering/
- **REMOVE ENTIRE FOLDER** ❌ (Claude-specific, not related to your project)

---

## 🎯 Action Plan

### Step 1: Immediate Deletion (Save ~90% space)
```bash
# Remove Archon implementation (hundreds of files)
rm -rf docs/02-technical-architecture/archon-reference-implementation/
rm -rf docs/02-technical-architecture/archon-integration/

# Remove context-engineering (not needed)
rm -rf docs/context-engineering/

# Remove RAG-focused docs
rm docs/01-product-vision/MASTER-*.md
rm docs/02-technical-architecture/RAG-*.md
```

### Step 2: Archive Old Planning Docs
```bash
# Create archive folder
mkdir docs/archive

# Move outdated planning docs
mv docs/03-development-planning/ROADMAP-*.md docs/archive/
mv docs/03-development-planning/IMPLEMENTATION-*.md docs/archive/
mv docs/06-research/ docs/archive/
```

### Step 3: Create New Focused Structure
```
docs/
├── 00-project-overview/
│   └── README.md (from notes.md)
├── 01-technical-specs/
│   ├── tech-stack.md (from DEFINITIVE-TECH-STACK.md)
│   ├── scraping-architecture.md
│   └── api-specification.md
├── 02-implementation/
│   ├── FASTAPI-SAAS-SETUP-GUIDE.md
│   └── mvp-checklist.md
├── 03-seo-tools/
│   ├── workflows/ (n8n files)
│   └── tool-specifications.md
├── 04-business/
│   └── pricing-model.md
└── archive/ (old docs for reference)
```

### Step 4: Create Missing Documentation
Create these NEW files focused on your actual project:

1. **`docs/00-project-overview/README.md`**
   - Your 8 SEO tools overview
   - Target audience (agencies, e-commerce)
   - MVP vs future phases

2. **`docs/03-seo-tools/tool-specifications.md`**
   - API endpoint for each tool
   - Input/output schemas
   - Python implementation plan

3. **`docs/02-implementation/mvp-checklist.md`**
   - Week-by-week development plan
   - Testing requirements
   - Launch checklist

---

## 📊 Impact Analysis

### Before Cleanup:
- **Total Files**: ~500+ (mostly Archon code)
- **Relevant Files**: ~20
- **Confusion Level**: High
- **Development Speed**: Slow

### After Cleanup:
- **Total Files**: ~30
- **Relevant Files**: 30 (100% relevant)
- **Confusion Level**: Zero
- **Development Speed**: Fast

### Space Saved:
- Archon implementation: ~5MB of irrelevant code
- Context engineering: ~2MB of Claude configs
- Old research: ~1MB of outdated decisions

---

## ✅ Final Recommendations

### KEEP (Core Project Files):
1. `notes.md` - Your vision
2. `DEFINITIVE-TECH-STACK.md` - Your tech choices
3. `SCRAPING-ARCHITECTURE-DETAILED-PLAN.md` - Queue design
4. `FASTAPI-SAAS-SETUP-GUIDE.md` - Implementation guide
5. All n8n workflows (your 8 tools)
6. `HYBRID-PRICING-MODEL.md` - Business model

### DELETE (No Longer Relevant):
1. All Archon code/documentation
2. All RAG/AI documentation (Phase 4)
3. All framework decision docs (already decided)
4. Context engineering folder
5. Old roadmaps and implementation plans

### MODIFY:
1. `CORE-FUNCTIONS-SPECIFICATION.md` - Remove Archon/RAG, focus on 8 tools
2. Reorganize remaining docs into cleaner structure

---

## 🚀 Next Steps

1. **Clean up documentation** (30 minutes)
2. **Start with Phase 1** of FASTAPI-SAAS-SETUP-GUIDE.md
3. **Focus on converting** first n8n workflow to Python
4. **Build MVP** with just 2-3 tools first
5. **Add remaining tools** incrementally

This cleanup will remove ~95% of irrelevant documentation and let you focus on building your actual product!