#!/usr/bin/env pwsh
# PowerShell script to run the analytics dashboard on port 8085

Write-Host "Starting Analytics Dashboard..." -ForegroundColor Green

# Navigate to analytics dashboard directory
Push-Location "C:\testing ngoding - akmal\new-qr-based-test-apps\analytics-dashboard"

# Set environment variables
$env:PORT = 8085
$env:BROWSER = "none"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the application
Write-Host "Starting Analytics Dashboard on port 8085..." -ForegroundColor Cyan
npm start

Pop-Location