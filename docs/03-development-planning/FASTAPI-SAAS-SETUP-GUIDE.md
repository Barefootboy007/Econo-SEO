# FastAPI SaaS Setup Guide - SEO Optimization Platform

## Overview
This guide provides a step-by-step process to build a production-ready SaaS platform using FastAPI (backend) and React + shadcn/ui (frontend) with authentication, payments, and content management capabilities.

## Tech Stack
- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React + Vite + TypeScript + shadcn/ui
- **Database**: Supabase (PostgreSQL + pgvector)
- **Authentication**: Clerk
- **Payments**: Polar.sh
- **Queue**: Redis + Celery
- **Scraping**: Crawl4AI
- **Styling**: Tailwind CSS + shadcn/ui components

## Project Structure
```
seo-optimization-saas/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── payments/
│   │   │   ├── scraping/
│   │   │   ├── content/
│   │   │   └── dashboard/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── services/
│   │   ├── workers/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── dashboard/
│   │   │   ├── content/
│   │   │   └── scraping/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── api/
│   ├── package.json
│   └── .env
└── docker-compose.yml
```

## Development Phases

### Phase 1: Foundation Setup (Days 1-3)

#### Day 1: Project Initialization

**1. Backend Setup**
```bash
# Create project structure
mkdir seo-optimization-saas
cd seo-optimization-saas

# Setup FastAPI backend
mkdir backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install core dependencies
pip install fastapi uvicorn[standard] python-dotenv sqlalchemy asyncpg
pip install supabase pydantic python-multipart
pip install celery redis crawl4ai beautifulsoup4

# Create basic FastAPI app
```

**backend/app/main.py:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="SEO Optimization API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
```

**2. Frontend Setup**
```bash
# In project root
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install UI dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn-ui@latest init
# Choose: TypeScript, Tailwind CSS config, CSS variables

# Install additional dependencies
npm install @tanstack/react-query axios react-router-dom
npm install @clerk/clerk-react recharts lucide-react
npm install @hookform/resolvers react-hook-form zod
```

**3. Setup shadcn/ui components**
```bash
# Install essential shadcn components for dashboards
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add chart
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
```

#### Day 2: Database & Supabase Setup

**1. Setup Supabase Project**
- Create account at supabase.com
- Create new project
- Copy connection strings

**2. Database Schema**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Users table (synced from Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'inactive',
    polar_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Websites table
CREATE TABLE websites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- Pages table for scraped content
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    page_type TEXT,
    title TEXT,
    meta_description TEXT,
    raw_html TEXT,
    markdown_content TEXT,
    structured_data JSONB,
    last_scraped TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content versions for optimization history
CREATE TABLE content_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    version_type TEXT, -- 'original', 'optimized', 'manual_edit'
    title TEXT,
    meta_description TEXT,
    content TEXT,
    optimization_model TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping jobs queue
CREATE TABLE scraping_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    urls JSONB,
    progress REAL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own websites" ON websites
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own pages" ON pages
    FOR ALL USING (website_id IN (
        SELECT id FROM websites WHERE user_id = auth.uid()
    ));
```

**3. Backend Database Connection**

**backend/app/core/database.py:**
```python
from supabase import create_client, Client
from app.core.config import settings

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

class Database:
    @staticmethod
    async def get_user_by_clerk_id(clerk_id: str):
        response = supabase.table('users').select("*").eq('clerk_id', clerk_id).single().execute()
        return response.data
    
    @staticmethod
    async def create_user(user_data: dict):
        response = supabase.table('users').insert(user_data).execute()
        return response.data
```

#### Day 3: Environment Configuration

**backend/.env:**
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Clerk
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Polar.sh
POLAR_SECRET_KEY=your_polar_secret_key
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI (for content optimization)
OPENAI_API_KEY=your_openai_key
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Phase 2: Authentication & User Management (Days 4-6)

#### Day 4: Clerk Integration

**1. Backend Clerk Webhook Handler**

**backend/app/api/auth/clerk.py:**
```python
from fastapi import APIRouter, Request, HTTPException
from app.services.clerk import verify_webhook, sync_user_to_database

router = APIRouter()

@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request):
    """Handle Clerk webhook events for user sync"""
    payload = await request.body()
    headers = request.headers
    
    # Verify webhook signature
    if not verify_webhook(payload, headers):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = await request.json()
    
    # Handle different event types
    if event["type"] == "user.created" or event["type"] == "user.updated":
        user_data = event["data"]
        await sync_user_to_database(user_data)
    
    return {"status": "success"}

@router.get("/validate-session")
async def validate_session(authorization: str = Header(None)):
    """Validate Clerk session token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    
    # Verify JWT token from Clerk
    user = await verify_clerk_token(authorization.replace("Bearer ", ""))
    return {"user": user}
```

**2. Frontend Clerk Setup**

**frontend/src/main.tsx:**
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
```

**3. Protected Routes Component**

**frontend/src/components/auth/ProtectedRoute.tsx:**
```tsx
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />
  }
  
  return <>{children}</>
}
```

#### Day 5: User Dashboard with shadcn/ui

**1. Main Dashboard Layout**

**frontend/src/components/dashboard/DashboardLayout.tsx:**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "./Overview"
import { ScrapingJobs } from "./ScrapingJobs"
import { ContentManager } from "./ContentManager"
import { BillingSection } from "./BillingSection"

export function DashboardLayout() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scraping">Scraping Jobs</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20% from last month</p>
              </CardContent>
            </Card>
            {/* Add more metric cards */}
          </div>
          <Overview />
        </TabsContent>
        
        <TabsContent value="scraping">
          <ScrapingJobs />
        </TabsContent>
        
        <TabsContent value="content">
          <ContentManager />
        </TabsContent>
        
        <TabsContent value="billing">
          <BillingSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**2. Content Editor Component**

**frontend/src/components/content/ContentEditor.tsx:**
```tsx
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { api } from '@/lib/api'

interface ContentEditorProps {
  pageId: string
  initialContent: {
    title: string
    metaDescription: string
    content: string
  }
}

export function ContentEditor({ pageId, initialContent }: ContentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const handleSave = async () => {
    setIsLoading(true)
    try {
      await api.put(`/api/content/pages/${pageId}`, content)
      toast({
        title: "Success",
        description: "Content updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOptimize = async () => {
    setIsLoading(true)
    try {
      const response = await api.post(`/api/content/optimize/${pageId}`)
      setContent(response.data)
      toast({
        title: "Success",
        description: "Content optimized with AI",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            placeholder="Page title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={content.metaDescription}
            onChange={(e) => setContent({ ...content, metaDescription: e.target.value })}
            placeholder="Meta description"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content.content}
            onChange={(e) => setContent({ ...content, content: e.target.value })}
            placeholder="Page content"
            rows={15}
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading}>
            Save Changes
          </Button>
          <Button onClick={handleOptimize} variant="secondary" disabled={isLoading}>
            Optimize with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Day 6: API Integration Layer

**frontend/src/lib/api.ts:**
```typescript
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const api = {
  // Content endpoints
  getPages: (websiteId: string) => 
    apiClient.get(`/api/content/websites/${websiteId}/pages`),
  
  getPage: (pageId: string) => 
    apiClient.get(`/api/content/pages/${pageId}`),
  
  updatePage: (pageId: string, data: any) => 
    apiClient.put(`/api/content/pages/${pageId}`, data),
  
  optimizePage: (pageId: string, options: any) => 
    apiClient.post(`/api/content/pages/${pageId}/optimize`, options),
  
  // Scraping endpoints
  startScraping: (data: any) => 
    apiClient.post('/api/scraping/start', data),
  
  getScrapingJob: (jobId: string) => 
    apiClient.get(`/api/scraping/jobs/${jobId}`),
  
  // Dashboard endpoints
  getDashboardStats: () => 
    apiClient.get('/api/dashboard/stats'),
  
  getUsageMetrics: () => 
    apiClient.get('/api/dashboard/usage'),
}
```

### Phase 3: Payments & Subscriptions (Days 7-9)

#### Day 7: Polar.sh Integration

**1. Backend Webhook Handler**

**backend/app/api/payments/polar.py:**
```python
from fastapi import APIRouter, Request, HTTPException
from app.services.polar import verify_webhook, handle_subscription_event
from app.core.database import supabase

router = APIRouter()

@router.post("/webhooks/polar")
async def polar_webhook(request: Request):
    """Handle Polar.sh webhook events"""
    payload = await request.body()
    signature = request.headers.get("webhook-signature")
    
    if not verify_webhook(payload, signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = await request.json()
    
    # Handle subscription events
    if event["type"] in ["subscription.created", "subscription.updated"]:
        await handle_subscription_event(event)
    elif event["type"] == "subscription.cancelled":
        await handle_cancellation(event)
    
    return {"status": "success"}

async def handle_subscription_event(event):
    """Update user subscription in database"""
    customer_id = event["data"]["customer_id"]
    tier = event["data"]["product"]["name"].lower()  # 'starter', 'pro', etc.
    
    # Update user subscription
    supabase.table('users').update({
        'subscription_tier': tier,
        'subscription_status': 'active',
        'polar_customer_id': customer_id
    }).eq('email', event["data"]["customer"]["email"]).execute()
```

**2. Subscription Management UI**

**frontend/src/components/billing/SubscriptionManager.tsx:**
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["10 pages/month", "Basic optimization", "Email support"],
    stripePriceId: null,
  },
  {
    name: "Starter",
    price: "$29",
    features: ["100 pages/month", "Advanced optimization", "Priority support", "API access"],
    polarProductId: "prod_starter",
  },
  {
    name: "Pro",
    price: "$99",
    features: ["1000 pages/month", "All optimization models", "Custom integrations", "Dedicated support"],
    polarProductId: "prod_pro",
  },
]

export function SubscriptionManager({ currentPlan }: { currentPlan: string }) {
  const handleUpgrade = async (productId: string) => {
    // Redirect to Polar checkout
    const response = await api.post('/api/payments/create-checkout', { productId })
    window.location.href = response.data.checkoutUrl
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={currentPlan === plan.name.toLowerCase() ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold">{plan.price}</span>
              {plan.price !== "$0" && <span>/month</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {currentPlan === plan.name.toLowerCase() ? (
              <Badge>Current Plan</Badge>
            ) : (
              <Button 
                onClick={() => plan.polarProductId && handleUpgrade(plan.polarProductId)}
                className="w-full"
              >
                {plan.price === "$0" ? "Downgrade" : "Upgrade"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### Phase 4: Core SEO Tools (Days 10-15)

#### Day 10-11: Scraping Engine Integration

**backend/app/workers/scraping.py:**
```python
from celery import Celery
from crawl4ai import AsyncWebCrawler
import asyncio
from app.core.database import supabase

celery_app = Celery('scraping', broker='redis://localhost:6379')

@celery_app.task
async def scrape_website(job_id: str, urls: list):
    """Scrape multiple URLs and store in database"""
    
    # Update job status
    supabase.table('scraping_jobs').update({
        'status': 'running',
        'started_at': 'now()'
    }).eq('id', job_id).execute()
    
    async with AsyncWebCrawler() as crawler:
        for i, url in enumerate(urls):
            try:
                # Scrape page
                result = await crawler.arun(
                    url=url,
                    word_count_threshold=10,
                    excluded_tags=['nav', 'footer', 'header'],
                    wait_for="body",
                    screenshot=True
                )
                
                # Store in database
                supabase.table('pages').upsert({
                    'url': url,
                    'title': result.metadata.get('title'),
                    'meta_description': result.metadata.get('description'),
                    'raw_html': result.html,
                    'markdown_content': result.markdown,
                    'structured_data': result.structured_data,
                    'last_scraped': 'now()'
                }).execute()
                
                # Update progress
                progress = (i + 1) / len(urls) * 100
                supabase.table('scraping_jobs').update({
                    'progress': progress
                }).eq('id', job_id).execute()
                
            except Exception as e:
                # Log error but continue
                print(f"Error scraping {url}: {str(e)}")
    
    # Mark job complete
    supabase.table('scraping_jobs').update({
        'status': 'completed',
        'completed_at': 'now()',
        'progress': 100
    }).eq('id', job_id).execute()
```

#### Day 12-13: Content Optimization Tools

**backend/app/services/seo_tools.py:**
```python
from openai import OpenAI
from typing import Dict, List
import json

client = OpenAI()

class SEOTools:
    @staticmethod
    async def optimize_meta_tags(content: str, keywords: List[str]) -> Dict:
        """Generate optimized title and meta description"""
        prompt = f"""
        Optimize the following content for SEO:
        Content: {content[:1000]}
        Target Keywords: {', '.join(keywords)}
        
        Generate:
        1. SEO-optimized title (max 60 chars)
        2. Meta description (max 160 chars)
        3. 5 suggested H2 headings
        
        Return as JSON.
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    @staticmethod
    async def rewrite_content(content: str, page_type: str, tone: str) -> str:
        """Rewrite content based on page type and tone"""
        prompts = {
            "product": "Rewrite this as compelling product description focusing on benefits and features.",
            "service": "Rewrite this as a service page that builds trust and explains value.",
            "blog": "Rewrite this as an engaging blog post with clear sections and takeaways.",
            "category": "Rewrite this as a category page with clear navigation and product groupings."
        }
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"You are an SEO content specialist. Tone: {tone}"},
                {"role": "user", "content": f"{prompts.get(page_type, prompts['blog'])}\n\n{content}"}
            ]
        )
        
        return response.choices[0].message.content
    
    @staticmethod
    async def generate_location_pages(template: str, locations: List[str]) -> List[Dict]:
        """Generate location-specific pages"""
        pages = []
        for location in locations:
            prompt = f"Create a location page for {location} based on this template:\n{template}"
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}]
            )
            
            pages.append({
                "location": location,
                "content": response.choices[0].message.content
            })
        
        return pages
```

#### Day 14-15: Real-time Progress & WebSocket

**backend/app/api/websocket.py:**
```python
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        del self.active_connections[client_id]
    
    async def send_progress(self, client_id: str, data: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)

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

**frontend/src/hooks/useWebSocket.ts:**
```typescript
import { useEffect, useState } from 'react'

export function useWebSocket(jobId: string) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('pending')
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${jobId}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setProgress(data.progress)
      setStatus(data.status)
    }
    
    return () => ws.close()
  }, [jobId])
  
  return { progress, status }
}
```

### Phase 5: Testing & Deployment (Days 16-18)

#### Day 16: Testing Setup

**backend/tests/test_api.py:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_scraping_requires_auth():
    response = client.post("/api/scraping/start", json={"urls": ["https://example.com"]})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_content_optimization():
    # Test content optimization
    pass
```

#### Day 17-18: Docker & Deployment

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:8000
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=seo_saas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  celery:
    build: ./backend
    command: celery -A app.workers.scraping worker --loglevel=info
    depends_on:
      - redis
      - postgres

volumes:
  postgres_data:
```

## Key Implementation Notes

### Content Management Features
1. **WYSIWYG Editor**: Consider adding TipTap or Slate for rich text editing
2. **Version Control**: Track all content changes with diff viewing
3. **Bulk Operations**: Allow CSV import/export for mass updates
4. **Content Templates**: Save and reuse optimization templates

### Dashboard Analytics
Using shadcn/ui charts (recharts):
- Pages scraped over time
- Optimization success rates
- Usage metrics vs subscription limits
- Content quality scores

### API Structure
```
/api/v1/
├── /auth/          # Clerk webhooks
├── /payments/      # Polar webhooks
├── /scraping/      # Scraping operations
├── /content/       # Content CRUD
│   ├── /pages/
│   ├── /optimize/
│   └── /versions/
├── /seo-tools/     # Your 8 SEO tools
│   ├── /meta-updater/
│   ├── /service-writer/
│   ├── /location-writer/
│   ├── /product-writer/
│   ├── /product-rewriter/
│   ├── /category-rewriter/
│   ├── /content-writer/
│   └── /blog-updater/
└── /dashboard/     # Analytics & metrics
```

### Performance Considerations
1. **Pagination**: Implement cursor-based pagination for large datasets
2. **Caching**: Use Redis for frequently accessed content
3. **Rate Limiting**: Implement per-tier rate limits
4. **Background Jobs**: Use Celery for all heavy operations

### Security Best Practices
1. **API Keys**: User-specific API keys for programmatic access
2. **CORS**: Properly configure for production domain
3. **Input Validation**: Use Pydantic models for all inputs
4. **SQL Injection**: Use parameterized queries (Supabase handles this)
5. **XSS Prevention**: Sanitize all user-generated content

## Deployment Checklist

### Pre-Launch
- [ ] SSL certificates configured
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error tracking (Sentry) setup
- [ ] Rate limiting configured
- [ ] API documentation generated
- [ ] Terms of Service & Privacy Policy

### Launch Day
- [ ] DNS configuration
- [ ] CDN setup (Cloudflare)
- [ ] Monitoring alerts configured
- [ ] Support system ready
- [ ] Documentation published

### Post-Launch
- [ ] Usage analytics tracking
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Iterative improvements

## Cost Estimates

### Monthly Costs (0-100 users)
- Supabase: $25
- Clerk: $25
- Redis (Upstash): $10
- Hosting (Railway): $20
- OpenAI API: $50-200
- **Total**: ~$130-280/month

### Scaling Costs (100-1000 users)
- Supabase: $100
- Clerk: $50
- Redis: $50
- Hosting: $100
- OpenAI API: $500-2000
- **Total**: ~$800-2300/month

## Next Steps

1. **Week 1**: Complete Phase 1-2 (Foundation + Auth)
2. **Week 2**: Complete Phase 3-4 (Payments + Core Tools)
3. **Week 3**: Testing and bug fixes
4. **Week 4**: Deploy MVP and onboard beta users

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [Polar.sh Documentation](https://docs.polar.sh/)
- [Supabase Documentation](https://supabase.com/docs)
- [Crawl4AI Documentation](https://github.com/unclecode/crawl4ai)