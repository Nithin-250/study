# StudyGenius Setup Script
Write-Host "🧠 StudyGenius Setup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Check if Node.js is installed
$nodeInstalled = $false
try {
    $nodeVersion = & node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is already installed: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    Write-Host "❌ Node.js is not found" -ForegroundColor Red
}

if (-not $nodeInstalled) {
    Write-Host "" 
    Write-Host "📦 Attempting to install Node.js..." -ForegroundColor Yellow
    
    try {
        winget install OpenJS.NodeJS
        Write-Host "✅ Node.js installation completed!" -ForegroundColor Green
        Write-Host "🔄 Please restart PowerShell and run: npm run dev" -ForegroundColor Yellow
        Write-Host "📱 Then open http://localhost:5173 in your browser" -ForegroundColor Cyan
        exit
    } catch {
        Write-Host "❌ Automatic installation failed" -ForegroundColor Red
        Write-Host "📥 Please manually install Node.js:" -ForegroundColor Yellow
        Write-Host "   1. Go to https://nodejs.org" -ForegroundColor White
        Write-Host "   2. Download and install the LTS version" -ForegroundColor White
        Write-Host "   3. Restart PowerShell" -ForegroundColor White
        Write-Host "   4. Run: npm run dev" -ForegroundColor White
        exit 1
    }
}

# Check if npm is available  
try {
    $npmVersion = & npm --version 2>$null
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    Write-Host "Please install Node.js first" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "📱 Your website will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔗 MongoDB connection configured for your cluster" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start development server" -ForegroundColor Red
    Write-Host "Try running: npm run dev" -ForegroundColor Yellow
}
