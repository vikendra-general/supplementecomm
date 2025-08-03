# BBN Nutrition E-commerce Setup Script for Windows
# This script helps set up MongoDB and the application on Windows

Write-Host "🚀 Setting up BBN Nutrition E-commerce Application" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js and npm are installed" -ForegroundColor Green

# Check if MongoDB is running
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:27017" -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MongoDB is not running. Please start MongoDB first." -ForegroundColor Yellow
    Write-Host "   You can start MongoDB with: mongod" -ForegroundColor Yellow
    Write-Host "   Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
npm install

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install
Set-Location ..

# Create .env file if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Blue
    @"
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
}

# Seed the database
Write-Host "🌱 Seeding the database..." -ForegroundColor Blue
Set-Location backend
node seed.js
Set-Location ..

Write-Host ""
Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin: admin@bbn-nutrition.com / Admin123!" -ForegroundColor White
Write-Host "   User:  testuser@example.com / Test123!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To start the application:" -ForegroundColor Cyan
Write-Host "   1. Start the backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "   2. Start the frontend: npm run dev" -ForegroundColor White
Write-Host "   3. Or use the combined command: npm run dev:full" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5001/api" -ForegroundColor White
Write-Host "   Admin Panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "📚 API Documentation: http://localhost:5001/api/docs" -ForegroundColor Cyan
Write-Host "" 