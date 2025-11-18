# St. Patrick's Website Startup Script
Write-Host "🏛️  Starting St. Patrick's Catholic Church Website..." -ForegroundColor Green

# Check if XAMPP MySQL is running
Write-Host "🔍 Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Process mysqld -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL not running. Please start XAMPP MySQL service first!" -ForegroundColor Red
    Write-Host "   1. Open XAMPP Control Panel" -ForegroundColor Yellow
    Write-Host "   2. Start MySQL service" -ForegroundColor Yellow
    Write-Host "   3. Run this script again" -ForegroundColor Yellow
    pause
    exit
}

# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Hi-teQ\OneDrive\Desktop\st-patricks-makokoba\backend'; npm start"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend connection
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running on port 5000" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
}

# Start Frontend Server
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Hi-teQ\OneDrive\Desktop\st-patricks-makokoba'; npm start"

# Wait for frontend to start
Write-Host "⏳ Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🎉 Website should be starting up!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔗 Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "🗄️  Database: MySQL via XAMPP" -ForegroundColor Cyan

# Open website in browser
Write-Host "🌐 Opening website in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3001"

Write-Host "✅ All services started! Check the terminal windows for any errors." -ForegroundColor Green
pause
