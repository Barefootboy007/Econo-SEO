# SEO Optimizer Platform - Quick Start Script
# Run this PowerShell script to start the development environment

Write-Host "SEO Optimizer Platform - Starting Development Environment" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Check if running in the correct directory
$currentPath = Get-Location
if (-not (Test-Path ".\backend" -PathType Container) -or -not (Test-Path ".\frontend" -PathType Container)) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $currentPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Step 1: Environment Configuration" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check if .env file exists
if (Test-Path ".\.env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Read current configuration
    $envContent = Get-Content ".\.env"
    $secretKey = ($envContent | Select-String "SECRET_KEY=").Line.Split('=')[1]
    $superuserPassword = ($envContent | Select-String "FIRST_SUPERUSER_PASSWORD=").Line.Split('=')[1]
    
    if ($secretKey -eq "changethis" -or $superuserPassword -eq "changethis") {
        Write-Host "⚠️  WARNING: Using default credentials! Please update these in .env file:" -ForegroundColor Yellow
        Write-Host "   - SECRET_KEY (current: $secretKey)" -ForegroundColor Yellow
        Write-Host "   - FIRST_SUPERUSER_PASSWORD (current: $superuserPassword)" -ForegroundColor Yellow
        Write-Host ""
        
        $continue = Read-Host "Do you want to continue with default credentials? (y/n)"
        if ($continue -ne 'y') {
            Write-Host "Please update .env file and run again" -ForegroundColor Yellow
            exit 0
        }
    }
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Step 2: Supabase Configuration" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Check if Supabase is configured
$supabaseUrl = ($envContent | Select-String "^SUPABASE_URL=" -Pattern).Line
if ($supabaseUrl -match "^#" -or $supabaseUrl -eq $null) {
    Write-Host "⚠️  Supabase not configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set up Supabase:" -ForegroundColor White
    Write-Host "1. Go to https://supabase.com and create a new project" -ForegroundColor White
    Write-Host "2. After creation, go to Settings → API" -ForegroundColor White
    Write-Host "3. Copy your project URL and keys" -ForegroundColor White
    Write-Host "4. Update the .env file with:" -ForegroundColor White
    Write-Host "   SUPABASE_URL=https://your-project.supabase.co" -ForegroundColor Gray
    Write-Host "   SUPABASE_ANON_KEY=your-anon-key" -ForegroundColor Gray
    Write-Host "   SUPABASE_SERVICE_KEY=your-service-key" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Continuing without Supabase (limited functionality)..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Supabase configuration found" -ForegroundColor Green
}

Write-Host "`n🚀 Step 3: Starting Services" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Function to check if port is in use
function Test-Port {
    param($Port)
    $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $tcpConnection -ne $null
}

# Check if ports are available
if (Test-Port 8000) {
    Write-Host "⚠️  Port 8000 is already in use!" -ForegroundColor Yellow
    $killProcess = Read-Host "Do you want to kill the process using port 8000? (y/n)"
    if ($killProcess -eq 'y') {
        $process = Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess -Unique
        Stop-Process -Id $process -Force
        Write-Host "✅ Process killed" -ForegroundColor Green
    }
}

if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 is already in use!" -ForegroundColor Yellow
    $killProcess = Read-Host "Do you want to kill the process using port 5173? (y/n)"
    if ($killProcess -eq 'y') {
        $process = Get-NetTCPConnection -LocalPort 5173 | Select-Object -ExpandProperty OwningProcess -Unique
        Stop-Process -Id $process -Force
        Write-Host "✅ Process killed" -ForegroundColor Green
    }
}

Write-Host "`nStarting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$currentPath\backend'
    Write-Host 'Activating Python virtual environment...' -ForegroundColor Yellow
    .\venv\Scripts\activate
    Write-Host 'Starting FastAPI backend on http://localhost:8000' -ForegroundColor Green
    Write-Host 'API Documentation: http://localhost:8000/docs' -ForegroundColor Cyan
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"@

Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
    cd '$currentPath\frontend'
    Write-Host 'Starting React frontend on http://localhost:5173' -ForegroundColor Green
    npm run dev
"@

Write-Host "`n✅ Services Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Create Supabase project if not done" -ForegroundColor White
Write-Host "   2. Update .env with Supabase credentials" -ForegroundColor White
Write-Host "   3. Check TODO.md for development tasks" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")