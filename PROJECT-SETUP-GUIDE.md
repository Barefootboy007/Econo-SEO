# SEO Optimizer Platform - Complete Setup Guide

## 🚀 Quick Restart Guide (Start Here When You Return!)

### To Resume Development:

1. **Start Backend** (Terminal 1):
```powershell
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\backend"
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start Frontend** (Terminal 2):
```powershell
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\frontend"
npm run dev
```

3. **Check Everything Works**:
- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:5173

4. **Continue Where You Left Off**:
- ✅ Phase 0: COMPLETED
- 🚧 Phase 1: IN PROGRESS - Next step is creating Supabase project
- See TODO.md for detailed next steps

---

## 📋 Project Overview

Building an SEO optimization SaaS platform with:
- **Backend**: FastAPI + Python 3.12
- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (PostgreSQL with pgvector)
- **Web Scraping**: Crawl4AI
- **Background Tasks**: Celery + Redis
- **Real-time Updates**: WebSockets

---

## ✅ Completed Setup Steps

### Phase 0: Project Foundation

#### 1. FastAPI Template Setup
```powershell
# Template already cloned to:
# C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\

# Project structure:
Ecom optimsiser/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docs/            # Your documentation
│   ├── notes.md
│   ├── 07-workflows/n8n/  # Your n8n workflows
├── TODO.md
├── PRD-PHASE-0-4-MVP.md
└── PROJECT-SETUP-GUIDE.md  # This file
```

#### 2. Backend Dependencies Installed

Navigate to backend and activate virtual environment:
```powershell
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\backend"
python -m venv venv
.\venv\Scripts\activate
```

All these packages are installed:
```powershell
# Core FastAPI packages
pip install fastapi uvicorn sqlalchemy alembic pydantic
pip install sqlmodel pydantic-settings

# Database packages
pip install psycopg2-binary psycopg[binary] asyncpg
pip install supabase

# Authentication & Security
pip install python-jose[cryptography] passlib[bcrypt]
pip install python-multipart

# Email & Notifications
pip install emails jinja2
pip install email-validator

# HTTP & OAuth
pip install httpx httpx-oauth

# Web Scraping
pip install crawl4ai beautifulsoup4 lxml

# Background Tasks
pip install celery redis

# Monitoring & Utils
pip install sentry-sdk[fastapi]
pip install tenacity python-dotenv
```

#### 3. Frontend Dependencies Installed

Navigate to frontend:
```powershell
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\frontend"
npm install
```

Additional UI packages installed:
```powershell
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-select
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
```

---

## 🚀 Starting the Application

### Start Backend
```powershell
# Terminal 1
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\backend"
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend URLs:**
- API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Alternative API Docs: http://localhost:8000/redoc

### Start Frontend
```powershell
# Terminal 2
cd "C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\frontend"
npm run dev
```

**Frontend URL:**
- Application: http://localhost:5173

---

## 🔧 Environment Configuration

### Root .env File (Already Exists!)

The project has a **root `.env` file** that's already configured. Location: `Ecom optimsiser/.env`

**Current Configuration:**
```env
# Domain
DOMAIN=localhost

# Frontend URL
FRONTEND_HOST=http://localhost:5173

# Environment: local, staging, production
ENVIRONMENT=local

# Project Info (Updated)
PROJECT_NAME="SEO Optimizer Platform"
STACK_NAME=seo-optimizer-platform

# Backend
BACKEND_CORS_ORIGINS="http://localhost,http://localhost:5173,https://localhost,https://localhost:5173"
SECRET_KEY=changethis  # ⚠️ CHANGE THIS!
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis  # ⚠️ CHANGE THIS!

# Email (Optional for MVP)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=info@example.com
SMTP_TLS=True
SMTP_SSL=False
SMTP_PORT=587

# Postgres (Will be replaced with Supabase)
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changethis

# Supabase Configuration (To be filled after creating Supabase project)
# SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative: Direct database URL for Supabase
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Redis Configuration (for Celery background tasks)
# REDIS_URL=redis://localhost:6379

# Crawl4AI Configuration
CRAWL4AI_HEADLESS=true
CRAWL4AI_TIMEOUT=30000

# Sentry (Error tracking - optional)
SENTRY_DSN=

# Docker (if using Docker)
DOCKER_IMAGE_BACKEND=backend
DOCKER_IMAGE_FRONTEND=frontend
```

### Backend .env (Optional)

The backend can read from the root `.env` file. If you have issues, create `backend/.env` with the same content as above.

### Frontend .env (If Needed)

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:8000
```

### ⚠️ Important Security Notes:

1. **NEVER commit `.env` files to git** - They're already in .gitignore
2. **Change these immediately:**
   - `SECRET_KEY` - Generate a secure random string
   - `FIRST_SUPERUSER_PASSWORD` - Use a strong password
3. **Keep credentials safe** - Store Supabase keys securely

---

## 📊 Next Steps: Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Configure:
   - **Name**: seo-optimizer
   - **Database Password**: [Create strong password and save it!]
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier for development

### 2. Get Supabase Credentials

After project creation (takes 2-3 minutes):

1. Go to **Settings → API**
2. Copy these values:
   - `Project URL`: https://xxxxx.supabase.co
   - `anon public`: eyJ... (public key)
   - `service_role`: eyJ... (secret key)

3. Go to **Settings → Database**
4. Copy the connection string

### 3. Update Backend .env with Supabase

Update your `backend/.env`:
```env
# Replace the PostgreSQL settings with Supabase
POSTGRES_SERVER=db.xxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-supabase-password
POSTGRES_DB=postgres

# Add Supabase specific settings
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_KEY=eyJ...your-service-key

# Or use direct connection string
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
```

### 4. Run Database Migrations

```powershell
cd backend
.\venv\Scripts\activate

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

---

## 🏗️ Phase 1-4 Implementation Plan

### Phase 1: FastAPI Backend (Days 3-5)
- [x] Basic API structure
- [ ] Create scraping endpoints
- [ ] Add WebSocket support
- [ ] Set up Celery workers
- [ ] Create custom API routes for SEO tools

### Phase 2: Supabase Database (Days 6-7)
- [ ] Create Supabase project
- [ ] Design database schema
- [ ] Enable pgvector extension
- [ ] Set up Row Level Security
- [ ] Create database service layer

### Phase 3: Crawl4AI Integration (Days 8-10)
- [ ] Create scraping service
- [ ] Implement markdown conversion
- [ ] Add progress tracking
- [ ] Store scraped content
- [ ] Test scraping workflow

### Phase 4: Basic Frontend (Days 11-13)
- [ ] Replace Chakra UI with shadcn/ui
- [ ] Create scraping interface
- [ ] Build content listing
- [ ] Add progress display
- [ ] Connect to backend API

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Backend Won't Start
```powershell
# Check if virtual environment is activated
# You should see (venv) in your prompt

# If not, activate it:
.\venv\Scripts\activate

# Check for missing packages:
pip list

# Reinstall all requirements if needed:
pip install -r requirements.txt
```

#### Module Not Found Errors
```powershell
# Install the missing module
pip install [module-name]

# Common missing modules:
pip install sentry-sdk[fastapi]
pip install sqlmodel
pip install pydantic-settings
pip install psycopg[binary]
pip install emails
```

#### Database Connection Errors
- This is expected until Supabase is configured
- The app will still run but database operations won't work
- Complete Supabase setup to resolve

#### Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F

# Or use different port
uvicorn app.main:app --reload --port 8001
```

#### Frontend Build Errors
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📝 Development Workflow

### Daily Development Process

1. **Start Backend**
   ```powershell
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Start Celery Worker** (when needed)
   ```powershell
   cd backend
   .\venv\Scripts\activate
   celery -A app.core.celery_app worker --loglevel=info
   ```

4. **Check API Documentation**
   - http://localhost:8000/docs

5. **Make Changes**
   - Backend changes auto-reload
   - Frontend changes hot-reload

---

## 📚 Key Files to Modify

### Backend Files
- `backend/app/api/routes/` - Add new API endpoints
- `backend/app/models.py` - Define database models
- `backend/app/schemas/` - Define Pydantic schemas
- `backend/app/services/` - Add business logic
- `backend/app/core/config.py` - Configuration settings

### Frontend Files
- `frontend/src/routes/` - Add new pages
- `frontend/src/components/` - Create React components
- `frontend/src/client/` - API client code
- `frontend/src/hooks/` - Custom React hooks

---

## 🔗 Useful Links

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- Supabase: https://supabase.com/docs
- Crawl4AI: https://crawl4ai.com/docs
- shadcn/ui: https://ui.shadcn.com

### Your Project Files
- Main TODO: `TODO.md`
- Detailed PRD: `PRD-PHASE-0-4-MVP.md`
- Your Notes: `docs/notes.md`
- n8n Workflows: `docs/07-workflows/n8n/`

---

## ✅ Setup Checklist

### Completed
- [x] FastAPI template cloned
- [x] Python virtual environment created
- [x] Backend dependencies installed
- [x] Frontend dependencies installed
- [x] Backend runs successfully
- [x] Frontend runs successfully
- [x] API documentation accessible

### To Do
- [ ] Create Supabase project
- [ ] Configure database connection
- [ ] Run database migrations
- [ ] Add Crawl4AI scraping service
- [ ] Create SEO tool endpoints
- [ ] Build scraping UI
- [ ] Implement first SEO tool

---

## 🎯 Success Indicators

You know the setup is complete when:
1. ✅ Backend runs without errors at http://localhost:8000
2. ✅ Frontend runs without errors at http://localhost:5173
3. ✅ API docs are accessible at http://localhost:8000/docs
4. ✅ No module import errors
5. ✅ Environment variables are configured
6. ⏳ Database connected (after Supabase setup)

---

## 💡 Tips

1. **Keep terminals open**: One for backend, one for frontend
2. **Use virtual environment**: Always activate before running backend
3. **Check logs**: Error messages usually tell you what's missing
4. **Save credentials**: Keep Supabase credentials secure
5. **Version control**: Consider initializing git after setup

---

*Last Updated: Current Date*
*Status: Backend and Frontend running, awaiting Supabase configuration*