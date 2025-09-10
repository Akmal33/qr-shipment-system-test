#!/usr/bin/env pwsh
# PowerShell script to run the dashboard

Write-Host "Starting QR Generator Dashboard..." -ForegroundColor Green

# Navigate to dashboard directory
Push-Location "C:\testing ngoding - akmal\new-qr-based-test-apps\dashboard-frontend"

# Set environment variables
$env:PORT = 8084
$env:BROWSER = "none"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the application
Write-Host "Starting React app on port 8084..." -ForegroundColor Cyan
npm start

Pop-Location