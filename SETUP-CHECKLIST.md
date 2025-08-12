# SEO Optimizer Platform - Setup Checklist

## 🔐 Step 1: Secure Your Environment Variables

### Generate Secure Credentials

1. **Generate a secure SECRET_KEY:**
   ```python
   # Run this in Python to generate a secure key
   import secrets
   print(secrets.token_urlsafe(32))
   ```
   
2. **Create a strong admin password**
   - Use at least 12 characters
   - Include uppercase, lowercase, numbers, and symbols

3. **Update your .env file:**
   ```env
   SECRET_KEY=your-generated-secure-key-here
   FIRST_SUPERUSER=admin@yourdomain.com
   FIRST_SUPERUSER_PASSWORD=your-strong-password-here
   ```

## 🌊 Step 2: Create Supabase Project

### A. Create Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Configure:
   - **Organization**: Your org or personal
   - **Project name**: `seo-optimizer`
   - **Database Password**: Generate a strong password and SAVE IT!
   - **Region**: Choose closest to you (e.g., US East, EU Central)
   - **Pricing Plan**: Free tier is fine for development

### B. Get Your Credentials (after project creation - takes 2-3 minutes)

1. Go to **Settings → API** in Supabase dashboard
2. Copy these values:
   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public: eyJ...
   service_role: eyJ... (keep this secret!)
   ```

3. Go to **Settings → Database**
4. Copy the connection string under "Connection string" → "URI"

### C. Update .env File

Add these lines to your `.env` file:
```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_KEY=eyJ...your-service-key...

# Alternative: Direct database URL (optional, but useful)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Update the existing Postgres settings to use Supabase
POSTGRES_SERVER=db.xxxxxxxxxxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-database-password-from-step-4
```

## 🚀 Step 3: Start the Application

### Quick Start (PowerShell)
```powershell
# Run the startup script
.\startup.ps1
```

### Manual Start

#### Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

## ✅ Step 4: Verify Everything Works

1. **Backend API**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Should show FastAPI interactive documentation
   - Test the health endpoint

2. **Frontend**: [http://localhost:5173](http://localhost:5173)
   - Should show the React application
   - Try logging in with your superuser credentials

3. **Database Connection**:
   - Check backend logs for any database connection errors
   - If Supabase is configured, you should see successful connection messages

## 🛠️ Step 5: Initialize Database (After Supabase is configured)

```powershell
cd backend
.\venv\Scripts\activate

# Run database migrations
alembic upgrade head

# Initialize data (creates superuser)
python -m app.initial_data
```

## 📋 Status Check

- [ ] .env file exists with secure credentials
- [ ] SECRET_KEY is changed from default
- [ ] FIRST_SUPERUSER_PASSWORD is changed from default
- [ ] Supabase project created
- [ ] Supabase credentials added to .env
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access API documentation
- [ ] Can access frontend application
- [ ] Database connection successful (if Supabase configured)

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F
```

### Virtual Environment Issues
```powershell
# Recreate virtual environment
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Node Modules Issues
```powershell
# Reinstall frontend dependencies
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📝 Next Steps

After setup is complete:

1. **Phase 1 - Backend Development**:
   - Create scraping API endpoints
   - Set up WebSocket support
   - Configure Celery for background tasks

2. **Phase 2 - Database Schema**:
   - Create database migrations
   - Set up tables for websites, pages, content

3. **Phase 3 - Crawl4AI Integration**:
   - Integrate web scraping functionality
   - Add markdown conversion

4. **Phase 4 - Frontend Features**:
   - Build scraping interface
   - Create content management UI

See `TODO.md` and `PRD-PHASE-0-4-MVP.md` for detailed development tasks.

---

## 🆘 Need Help?

- Check `PROJECT-SETUP-GUIDE.md` for detailed instructions
- Review `PRD-PHASE-0-4-MVP.md` for technical specifications
- Backend logs: Check terminal running uvicorn
- Frontend logs: Check terminal running npm
- Database issues: Check Supabase dashboard logs