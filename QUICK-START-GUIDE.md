# 🚀 Quick Start Guide - SEO Optimizer Platform

Get up and running in under 5 minutes!

---

## 📋 Prerequisites

- **Python 3.12+** installed
- **Node.js 18+** installed
- **Git** installed
- **Supabase account** (free tier is fine)
- **Windows PowerShell** (for Windows users)

---

## ⚡ Instant Start (If Already Set Up)

```powershell
# One command to start everything:
.\startup.ps1
```

This starts both backend (http://localhost:8000) and frontend (http://localhost:5173).

---

## 🔧 First Time Setup (10 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Barefootboy007/Econo-SEO.git
cd Econo-SEO
```

### Step 2: Configure Environment Variables

1. Copy the `.env.example` to `.env` (if not already done)
2. Update these critical values in `.env`:

```env
# REQUIRED - Update these!
SECRET_KEY=your-secure-random-key-here
FIRST_SUPERUSER_PASSWORD=your-strong-password
POSTGRES_PASSWORD=your-supabase-db-password

# These should already be set if cloned:
SUPABASE_URL=https://fwqirneazielesarezot.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Step 3: Install Dependencies

#### Backend Setup:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Setup:
```powershell
cd frontend
npm install
```

### Step 4: Database Setup

```powershell
cd backend
.\venv\Scripts\activate

# Run migrations
python -m alembic upgrade head

# Create superuser (uses credentials from .env)
python -m app.initial_data

# Test database connection
python test_db_connection.py
```

### Step 5: Start the Application

**Option A: Use the startup script (Windows)**
```powershell
.\startup.ps1
```

**Option B: Manual start**

Terminal 1 - Backend:
```powershell
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```powershell
cd frontend
npm run dev
```

---

## ✅ Verify Everything Works

1. **Backend API**: http://localhost:8000/docs
   - Should show FastAPI interactive documentation
   
2. **Frontend**: http://localhost:5173
   - Should show the React application
   
3. **Test Login**:
   - Email: `admin@seooptimizer.com`
   - Password: (whatever you set in .env as FIRST_SUPERUSER_PASSWORD)

---

## 🎯 Common Commands

### Daily Development

```powershell
# Start everything
.\startup.ps1

# Test database connection
cd backend && python test_db_connection.py

# Run backend only
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload

# Run frontend only
cd frontend
npm run dev

# Check logs
# Backend logs: Check terminal running uvicorn
# Frontend logs: Check terminal running npm
```

### Database Operations

```powershell
cd backend
.\venv\Scripts\activate

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Reset database (careful!)
alembic downgrade base
alembic upgrade head
python -m app.initial_data
```

### Git Operations

```powershell
# Save your work
git add .
git commit -m "Description of changes"
git push

# Get latest changes
git pull

# Check status
git status
```

---

## 🔍 Troubleshooting

### Backend won't start

```powershell
# Check if virtual environment is activated
# You should see (venv) in your prompt

# Reinstall dependencies
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend won't start

```powershell
# Clear cache and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Database connection issues

```powershell
# Test connection
cd backend
python test_db_connection.py

# Check .env file has correct:
# - POSTGRES_PASSWORD (your Supabase password)
# - POSTGRES_SERVER (should be db.fwqirneazielesarezot.supabase.co)
```

### Port already in use

```powershell
# Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Find and kill process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

---

## 📁 Project Structure

```
Ecom-optimiser/
├── backend/              # FastAPI backend
│   ├── app/             # Application code
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core functionality
│   │   ├── models.py    # Database models
│   │   └── main.py      # App entry point
│   ├── alembic/         # Database migrations
│   ├── tests/           # Backend tests
│   └── venv/            # Python virtual environment
│
├── frontend/            # React frontend
│   ├── src/            # Source code
│   │   ├── components/ # React components
│   │   ├── routes/     # Page routes
│   │   └── client/     # API client
│   └── node_modules/   # Node dependencies
│
├── docs/               # Documentation
├── .env               # Environment variables (not in git!)
├── .gitignore         # Git ignore rules
├── startup.ps1        # Quick start script
└── README.md          # Project documentation
```

---

## 🔐 Security Notes

- **Never commit `.env` file** - It contains secrets!
- **Change default passwords** before deploying
- **Keep `SECRET_KEY` secret** - It secures your JWT tokens
- **Use strong passwords** for database and admin account

---

## 📚 Useful Links

- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173
- **Supabase Dashboard**: https://supabase.com/dashboard
- **GitHub Repository**: https://github.com/Barefootboy007/Econo-SEO.git

---

## 🎯 Next Steps

Once everything is running:

1. **Test the API**: Go to http://localhost:8000/docs and try the endpoints
2. **Login to Frontend**: Use your admin credentials
3. **Start Development**: 
   - Create scraping endpoints in `backend/app/api/routes/`
   - Build UI components in `frontend/src/components/`
   - Check `TODO.md` for the development roadmap

---

## 💡 Pro Tips

1. **Use `startup.ps1`** - It handles all the startup complexity
2. **Keep terminals open** - One for backend, one for frontend
3. **Check logs often** - Most errors are clearly explained
4. **Test after changes** - Run `python test_db_connection.py` after .env changes
5. **Commit regularly** - Use Git to save your progress

---

## 🆘 Need Help?

1. Check `PROJECT-SETUP-GUIDE.md` for detailed setup
2. Review `TODO.md` for development tasks
3. Look at `PRD-PHASE-0-4-MVP.md` for project requirements
4. Backend logs show detailed error messages
5. Frontend console (F12 in browser) shows client-side errors

---

**Happy Coding! 🚀**

*Last Updated: December 11, 2024*