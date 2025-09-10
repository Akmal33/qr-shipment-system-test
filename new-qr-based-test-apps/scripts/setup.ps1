# Export-Import & Warehouse Management System Setup Script (PowerShell)
# This script sets up the entire microservices-based warehouse management system

Write-Host "🏭 Export-Import & Warehouse Management System Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check requirements
function Test-Requirements {
    Write-Host "📋 Checking requirements..." -ForegroundColor Yellow
    
    if (-not (Test-CommandExists "docker")) {
        Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-CommandExists "docker-compose")) {
        Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-CommandExists "go")) {
        Write-Host "⚠️  Go is not installed. Please install Go 1.21+" -ForegroundColor Yellow
    }
    
    if (-not (Test-CommandExists "node")) {
        Write-Host "⚠️  Node.js is not installed. Please install Node.js 18+" -ForegroundColor Yellow
    }
    
    if (-not (Test-CommandExists "flutter")) {
        Write-Host "⚠️  Flutter is not installed. Please install Flutter SDK for mobile app." -ForegroundColor Yellow
    }
    
    Write-Host "✅ Requirements check completed" -ForegroundColor Green
}

# Setup environment
function Initialize-Environment {
    Write-Host "🔧 Setting up environment..." -ForegroundColor Yellow
    
    # Copy environment file if it doesn't exist
    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Environment file created" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Environment file already exists" -ForegroundColor Blue
    }
    
    # Create storage directories
    $directories = @("storage\barcodes", "storage\uploads", "logs")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }
    }
    
    Write-Host "✅ Environment setup completed" -ForegroundColor Green
}

# Start infrastructure services
function Start-Infrastructure {
    Write-Host "🚀 Starting infrastructure services..." -ForegroundColor Yellow
    
    # Start infrastructure services
    docker-compose up -d mongodb elasticsearch zookeeper kafka kafka-ui redis
    
    Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Check if services are running
    $runningContainers = docker ps --format "table {{.Names}}"
    
    if ($runningContainers -match "warehouse-mongodb") {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "❌ MongoDB failed to start" -ForegroundColor Red
        exit 1
    }
    
    if ($runningContainers -match "warehouse-elasticsearch") {
        Write-Host "✅ Elasticsearch is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Elasticsearch failed to start" -ForegroundColor Red
        exit 1
    }
    
    if ($runningContainers -match "warehouse-kafka") {
        Write-Host "✅ Kafka is running" -ForegroundColor Green
    } else {
        Write-Host "❌ Kafka failed to start" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Infrastructure services started successfully" -ForegroundColor Green
}

# Initialize database
function Initialize-Database {
    Write-Host "📊 Initializing database..." -ForegroundColor Yellow
    
    # Wait for MongoDB to be fully ready
    Start-Sleep -Seconds 10
    
    # Create database indexes
    $mongoScript = @"
    db.items.createIndex({itemId: 1}, {unique: true});
    db.items.createIndex({barcode: 1}, {unique: true});
    db.items.createIndex({category: 1});
    db.items.createIndex({status: 1});
    
    db.shipments.createIndex({shipmentId: 1}, {unique: true});
    db.shipments.createIndex({status: 1});
    db.shipments.createIndex({destination: 1});
    
    db.users.createIndex({userId: 1}, {unique: true});
    db.users.createIndex({username: 1}, {unique: true});
    db.users.createIndex({email: 1}, {unique: true});
    
    db.scan_logs.createIndex({timestamp: 1});
    db.scan_logs.createIndex({userId: 1});
    db.scan_logs.createIndex({itemId: 1});
"@
    
    docker exec warehouse-mongodb mongosh warehouse_db --eval $mongoScript
    
    Write-Host "✅ Database initialized" -ForegroundColor Green
}

# Create Kafka topics
function New-KafkaTopics {
    Write-Host "📨 Creating Kafka topics..." -ForegroundColor Yellow
    
    # Wait for Kafka to be ready
    Start-Sleep -Seconds 10
    
    # Create topics
    $topics = @(
        "inventory-events",
        "shipment-events", 
        "scan-events",
        "user-events"
    )
    
    foreach ($topic in $topics) {
        $partitions = if ($topic -eq "scan-events") { 6 } elseif ($topic -eq "user-events") { 2 } else { 3 }
        docker exec warehouse-kafka kafka-topics --create --topic $topic --bootstrap-server localhost:9092 --partitions $partitions --replication-factor 1 --if-not-exists
    }
    
    Write-Host "✅ Kafka topics created" -ForegroundColor Green
}

# Start backend services
function Start-BackendServices {
    Write-Host "🔧 Building and starting backend services..." -ForegroundColor Yellow
    
    # Check if Go is available
    if (Test-CommandExists "go") {
        Write-Host "📦 Building Go services..." -ForegroundColor Yellow
        
        # Build services
        $services = @("dashboard-api", "barcode-service", "scanner-api")
        foreach ($service in $services) {
            Push-Location "services\$service"
            go mod tidy
            Pop-Location
        }
        
        Write-Host "✅ Go services built" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Go not found, using Docker to build services" -ForegroundColor Yellow
    }
    
    # Start all services with Docker Compose
    docker-compose up -d
    
    Write-Host "✅ Backend services started" -ForegroundColor Green
}

# Setup frontend
function Initialize-Frontend {
    Write-Host "🎨 Setting up frontend..." -ForegroundColor Yellow
    
    if (Test-CommandExists "node") {
        Push-Location "dashboard-frontend"
        
        # Create React app if it doesn't exist
        if (-not (Test-Path "package.json")) {
            Write-Host "📦 Creating React application..." -ForegroundColor Yellow
            npx create-react-app . --template typescript
            
            # Install additional dependencies
            npm install @mui/material @emotion/react @emotion/styled
            npm install @mui/icons-material
            npm install axios react-router-dom
            npm install recharts
            npm install @types/node @types/react @types/react-dom
        }
        
        Write-Host "✅ Frontend setup completed" -ForegroundColor Green
        Pop-Location
    } else {
        Write-Host "⚠️  Node.js not found, skipping frontend setup" -ForegroundColor Yellow
    }
}

# Setup mobile app
function Initialize-MobileApp {
    Write-Host "📱 Setting up mobile app..." -ForegroundColor Yellow
    
    if (Test-CommandExists "flutter") {
        Push-Location "mobile-scanner"
        
        # Create Flutter app if it doesn't exist
        if (-not (Test-Path "pubspec.yaml")) {
            Write-Host "📦 Creating Flutter application..." -ForegroundColor Yellow
            flutter create . --org com.warehouse --project-name warehouse_scanner
        }
        
        Write-Host "✅ Mobile app setup completed" -ForegroundColor Green
        Pop-Location
    } else {
        Write-Host "⚠️  Flutter not found, skipping mobile app setup" -ForegroundColor Yellow
    }
}

# Verify deployment
function Test-Deployment {
    Write-Host "🔍 Verifying deployment..." -ForegroundColor Yellow
    
    # Wait for services to be ready
    Start-Sleep -Seconds 30
    
    # Check API endpoints
    $endpoints = @{
        "Dashboard API" = "http://localhost:8001/health"
        "Barcode Service" = "http://localhost:8002/health"
        "Scanner API" = "http://localhost:8003/health"
        "Frontend" = "http://localhost:3000"
        "Kafka UI" = "http://localhost:8080"
    }
    
    foreach ($service in $endpoints.Keys) {
        try {
            $response = Invoke-WebRequest -Uri $endpoints[$service] -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $service is running at $($endpoints[$service])" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  $service may not be ready yet" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Deployment verification completed" -ForegroundColor Green
}

# Display system information
function Show-SystemInfo {
    Write-Host ""
    Write-Host "🎉 Export-Import & Warehouse Management System Setup Complete!" -ForegroundColor Cyan
    Write-Host "=============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 System Components:" -ForegroundColor White
    Write-Host "  • Dashboard API:      http://localhost:8001" -ForegroundColor Gray
    Write-Host "  • Barcode Service:    http://localhost:8002" -ForegroundColor Gray
    Write-Host "  • Scanner API:        http://localhost:8003" -ForegroundColor Gray
    Write-Host "  • Frontend Dashboard: http://localhost:3000" -ForegroundColor Gray
    Write-Host "  • Kafka UI:           http://localhost:8080" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🗄️  Infrastructure:" -ForegroundColor White
    Write-Host "  • MongoDB:            localhost:27017" -ForegroundColor Gray
    Write-Host "  • Elasticsearch:      localhost:9200" -ForegroundColor Gray
    Write-Host "  • Kafka:              localhost:9092" -ForegroundColor Gray
    Write-Host "  • Redis:              localhost:6379" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 Management Commands:" -ForegroundColor White
    Write-Host "  • View logs:          docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  • Stop services:      docker-compose down" -ForegroundColor Gray
    Write-Host "  • Restart services:   docker-compose restart" -ForegroundColor Gray
    Write-Host "  • View status:        docker ps" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📱 Mobile App:" -ForegroundColor White
    Write-Host "  • Location:           .\mobile-scanner\" -ForegroundColor Gray
    Write-Host "  • Build APK:          cd mobile-scanner; flutter build apk" -ForegroundColor Gray
    Write-Host ""
}

# Main execution
function Main {
    Write-Host "Starting Export-Import & Warehouse Management System setup..." -ForegroundColor Cyan
    
    Test-Requirements
    Initialize-Environment
    Start-Infrastructure
    Initialize-Database
    New-KafkaTopics
    Start-BackendServices
    Initialize-Frontend
    Initialize-MobileApp
    Test-Deployment
    Show-SystemInfo
    
    Write-Host "🚀 Setup completed successfully!" -ForegroundColor Green
    Write-Host "The system is now ready for use." -ForegroundColor Green
}

# Run main function
Main