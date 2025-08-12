# MCP (Model Context Protocol) Setup Guide for SEO Optimizer

## 📌 Important: Read This First

**After completing this setup, you MUST restart Claude Desktop for the MCP servers to be recognized.**

---

## 🎯 What is MCP and Why Do You Need It?

MCP (Model Context Protocol) allows Claude to:
- Directly access your project files
- Connect to your Supabase database
- Execute Python code
- Clone GitHub repositories
- Test web scraping functionality
- Remember project context between sessions

---

## 📋 Pre-Setup Checklist

Before starting, ensure you have:
- [ ] Node.js installed (version 16 or higher)
- [ ] Python installed (version 3.11 or higher)
- [ ] Git installed
- [ ] A GitHub account
- [ ] A Supabase account (or ready to create one)
- [ ] Administrator access on your Windows machine

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Install Node.js (if not already installed)

1. Check if Node.js is installed:
```powershell
node --version
```

2. If not installed, download from: https://nodejs.org/
   - Choose the LTS version
   - Run the installer
   - Restart PowerShell after installation

### Step 2: Install MCP Servers (UPDATED - Use Available Packages)

Since the official MCP servers are not yet published to npm, we'll use alternative approaches:

#### Option A: Use npx directly (Recommended for now)
The MCP servers will be run with `npx` when Claude starts them, so no installation needed.

#### Option B: Clone and install locally (If Option A doesn't work)
```powershell
# Create a directory for MCP servers
mkdir C:\MCP-Servers
cd C:\MCP-Servers

# Clone the MCP repository
git clone https://github.com/modelcontextprotocol/servers.git
cd servers

# Install dependencies
npm install

# The servers are now available locally
```

### Step 3: Alternative Python Integration

Since `mcp-server-python` doesn't exist, we'll use a different approach:

```powershell
# Install Python packages that will help with development
pip install fastapi uvicorn sqlalchemy supabase crawl4ai

# These are the actual packages we need for the project
pip install python-dotenv celery redis
```

### Step 4: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "SEO Optimizer MCP"
4. Select scopes:
   - [x] repo (Full control of private repositories)
   - [x] read:org (Read org and team membership)
5. Click "Generate token"
6. **COPY THE TOKEN NOW** (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`

### Step 5: Set Up Supabase (if not done yet)

1. Go to: https://supabase.com
2. Sign up/Login
3. Create a new project:
   - Project name: `seo-optimizer`
   - Database Password: **[Create a strong password and save it!]**
   - Region: Choose closest to you
4. Wait for project to be created (takes 2-3 minutes)
5. Once created, go to Settings → Database
6. Copy the "Connection string" (URI)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres`

### Step 6: Configure Environment Variables

#### Option A: Set temporarily (for testing)

Open PowerShell and run:
```powershell
# Set GitHub token
$env:GITHUB_TOKEN = "ghp_your_actual_token_here"

# Set Supabase connection
$env:SUPABASE_DATABASE_URL = "postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres"
```

#### Option B: Set permanently (recommended)

1. Press `Win + X` → Select "System"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Add these variables:
   - Variable name: `GITHUB_TOKEN`
   - Variable value: `ghp_your_actual_token_here`
6. Click "New" again and add:
   - Variable name: `SUPABASE_DATABASE_URL`
   - Variable value: `postgresql://postgres:your_password@db.your_project.supabase.co:5432/postgres`
7. Click "OK" on all windows
8. **Restart PowerShell** for changes to take effect

### Step 7: Verify MCP Configuration File

The `.mcp.json` file should already be in your project folder:
```
C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser\.mcp.json
```

Verify it exists and contains the MCP server configurations.

### Step 8: Test Your Setup

Open a new PowerShell window and test:

```powershell
# Test Node.js
node --version
# Should show: v18.x.x or higher

# Test npm
npm --version
# Should show: 9.x.x or higher

# Test Python
python --version
# Should show: Python 3.11.x or higher

# Test environment variables
echo $env:GITHUB_TOKEN
# Should show: ghp_xxxxx...

echo $env:SUPABASE_DATABASE_URL
# Should show: postgresql://...

# Test if MCP servers are installed
npx @modelcontextprotocol/server-filesystem --version
# Should not error
```

### Step 9: Restart Claude Desktop

**THIS IS CRITICAL:**

1. **Completely close Claude Desktop**
   - Right-click the Claude icon in system tray
   - Select "Quit Claude"
   
2. **Wait 10 seconds**

3. **Start Claude Desktop again**

4. **Open your project chat**

5. **Test MCP is working** by asking:
   - "Can you see my project files?"
   - "What MCP servers are available?"

---

## 🔍 Troubleshooting

### If MCP servers don't work after restart:

1. **Check Claude's MCP configuration location:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Make sure it includes your project's `.mcp.json`

2. **Check PowerShell execution policy:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. **Verify npm global packages location:**
```powershell
npm list -g --depth=0
```

4. **Check if servers are accessible:**
```powershell
where npx
where npm
where python
```

### Common Issues:

**Issue**: "npm not found"
- **Solution**: Restart PowerShell or reinstall Node.js

**Issue**: "GITHUB_TOKEN not set"
- **Solution**: Set environment variable permanently (Step 6, Option B)

**Issue**: "Cannot connect to Supabase"
- **Solution**: Check your connection string and password

**Issue**: "MCP server not starting"
- **Solution**: Run Claude Desktop as Administrator

---

## ✅ Setup Validation Checklist

Before restarting Claude, confirm:

- [ ] All npm packages installed without errors
- [ ] Python MCP server installed
- [ ] GitHub token created and saved
- [ ] Supabase project created
- [ ] Environment variables set
- [ ] `.mcp.json` file exists in project folder
- [ ] All test commands work

---

## 📝 What to Tell Claude After Restart

After restarting Claude with MCP configured, you can say:

```
I've set up MCP servers for my SEO optimizer project. The configuration includes:
- filesystem access to: C:\Users\UKGC\Documents\1_man_Agency\Product Developement\Ecom optimsiser
- GitHub integration with token
- Supabase PostgreSQL connection
- Python execution capability

Can you verify the MCP servers are working and then help me start Phase 0 of the project setup?
```

---

## 🎉 Success Indicators

You'll know MCP is working when Claude can:
1. List files in your project directory
2. Read your TODO.md and PRD files directly
3. Execute Python code snippets
4. Access GitHub repositories
5. Connect to your Supabase database (once tables are created)

---

## 📚 Next Steps After MCP Setup

1. **Phase 0**: Clone FastAPI template
2. **Configure project**: Set up folder structure
3. **Install dependencies**: Python and npm packages
4. **Start development**: Follow the PRD phases

---

## 💾 Save This Information

Before restarting Claude, save:
1. Your GitHub token (securely)
2. Your Supabase password
3. Your Supabase connection string
4. This guide for reference

---

**Remember: You MUST restart Claude Desktop after completing this setup for MCP to work!**

Good luck with your setup! See you after the restart! 🚀