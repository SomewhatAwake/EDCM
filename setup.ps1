Write-Host "Elite Dangerous Fleet Carrier Companion App Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install server dependencies
Write-Host ""
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✓ Server dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install server dependencies" -ForegroundColor Red
    exit 1
}

# Install client dependencies
Write-Host ""
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location ..\client
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✓ Client dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install client dependencies" -ForegroundColor Red
    exit 1
}

# Set up environment files
Write-Host ""
Write-Host "Setting up environment files..." -ForegroundColor Yellow
Set-Location ..\server

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  Please configure your Elite Dangerous paths in server/.env" -ForegroundColor Yellow
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}

# Create directories
Write-Host ""
Write-Host "Creating required directories..." -ForegroundColor Yellow
if (-not (Test-Path data)) {
    New-Item -ItemType Directory -Path data
    Write-Host "✓ Created data directory" -ForegroundColor Green
}
if (-not (Test-Path logs)) {
    New-Item -ItemType Directory -Path logs
    Write-Host "✓ Created logs directory" -ForegroundColor Green
}

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "Setup completed successfully! 🚀" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure server/.env with your Elite Dangerous installation paths" -ForegroundColor White
Write-Host "2. Configure client/src/config.js with your server URL (if needed)" -ForegroundColor White
Write-Host "3. Start the server:" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "4. In a new terminal, start the client:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npx react-native run-android" -ForegroundColor Gray
Write-Host ""
Write-Host "You can also use VS Code tasks (Ctrl+Shift+P -> Tasks: Run Task)" -ForegroundColor Yellow
Write-Host ""
