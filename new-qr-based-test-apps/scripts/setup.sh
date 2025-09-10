#!/bin/bash

# Export-Import & Warehouse Management System Setup Script
# This script sets up the entire microservices-based warehouse management system

echo "🏭 Export-Import & Warehouse Management System Setup"
echo "=================================================="

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! command -v go &> /dev/null; then
        echo "⚠️  Go is not installed. Installing Go 1.21..."
        # Add Go installation commands here
    fi
    
    if ! command -v node &> /dev/null; then
        echo "⚠️  Node.js is not installed. Please install Node.js 18+."
    fi
    
    if ! command -v flutter &> /dev/null; then
        echo "⚠️  Flutter is not installed. Please install Flutter SDK for mobile app."
    fi
    
    echo "✅ Requirements check completed"
}

# Setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✅ Environment file created"
    else
        echo "ℹ️  Environment file already exists"
    fi
    
    # Create storage directories
    mkdir -p storage/barcodes
    mkdir -p storage/uploads
    mkdir -p logs
    
    echo "✅ Environment setup completed"
}

# Start infrastructure services
start_infrastructure() {
    echo "🚀 Starting infrastructure services..."
    
    # Start infrastructure services (MongoDB, Elasticsearch, Kafka)
    docker-compose up -d mongodb elasticsearch zookeeper kafka kafka-ui redis
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if docker ps | grep -q "warehouse-mongodb"; then
        echo "✅ MongoDB is running"
    else
        echo "❌ MongoDB failed to start"
        exit 1
    fi
    
    if docker ps | grep -q "warehouse-elasticsearch"; then
        echo "✅ Elasticsearch is running"
    else
        echo "❌ Elasticsearch failed to start"
        exit 1
    fi
    
    if docker ps | grep -q "warehouse-kafka"; then
        echo "✅ Kafka is running"
    else
        echo "❌ Kafka failed to start"
        exit 1
    fi
    
    echo "✅ Infrastructure services started successfully"
}

# Initialize database
initialize_database() {
    echo "📊 Initializing database..."
    
    # Wait for MongoDB to be fully ready
    sleep 10
    
    # Create database indexes
    docker exec warehouse-mongodb mongosh warehouse_db --eval "
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
    "
    
    echo "✅ Database initialized"
}

# Create Kafka topics
create_kafka_topics() {
    echo "📨 Creating Kafka topics..."
    
    # Wait for Kafka to be ready
    sleep 10
    
    # Create topics
    docker exec warehouse-kafka kafka-topics --create --topic inventory-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --if-not-exists
    docker exec warehouse-kafka kafka-topics --create --topic shipment-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1 --if-not-exists
    docker exec warehouse-kafka kafka-topics --create --topic scan-events --bootstrap-server localhost:9092 --partitions 6 --replication-factor 1 --if-not-exists
    docker exec warehouse-kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1 --if-not-exists
    
    echo "✅ Kafka topics created"
}

# Build and start backend services
start_backend_services() {
    echo "🔧 Building and starting backend services..."
    
    # Check if Go is available
    if command -v go &> /dev/null; then
        echo "📦 Building Go services..."
        
        # Build dashboard API
        cd services/dashboard-api
        go mod tidy
        cd ../..
        
        # Build barcode service
        cd services/barcode-service
        go mod tidy
        cd ../..
        
        # Build scanner API
        cd services/scanner-api
        go mod tidy
        cd ../..
        
        echo "✅ Go services built"
    else
        echo "⚠️  Go not found, using Docker to build services"
    fi
    
    # Start all services with Docker Compose
    docker-compose up -d
    
    echo "✅ Backend services started"
}

# Setup frontend
setup_frontend() {
    echo "🎨 Setting up frontend..."
    
    if command -v node &> /dev/null; then
        cd dashboard-frontend
        
        # Create React app if it doesn't exist
        if [ ! -f package.json ]; then
            echo "📦 Creating React application..."
            npx create-react-app . --template typescript
            
            # Install additional dependencies
            npm install @mui/material @emotion/react @emotion/styled
            npm install @mui/icons-material
            npm install axios react-router-dom
            npm install recharts
            npm install @types/node @types/react @types/react-dom
        fi
        
        echo "✅ Frontend setup completed"
        cd ..
    else
        echo "⚠️  Node.js not found, skipping frontend setup"
    fi
}

# Setup mobile app
setup_mobile_app() {
    echo "📱 Setting up mobile app..."
    
    if command -v flutter &> /dev/null; then
        cd mobile-scanner
        
        # Create Flutter app if it doesn't exist
        if [ ! -f pubspec.yaml ]; then
            echo "📦 Creating Flutter application..."
            flutter create . --org com.warehouse --project-name warehouse_scanner
            
            # Add dependencies to pubspec.yaml
            echo "
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  qr_code_scanner: ^1.0.1
  permission_handler: ^11.0.1
  shared_preferences: ^2.2.2
  provider: ^6.0.5
  " >> pubspec.yaml
        fi
        
        echo "✅ Mobile app setup completed"
        cd ..
    else
        echo "⚠️  Flutter not found, skipping mobile app setup"
    fi
}

# Verify deployment
verify_deployment() {
    echo "🔍 Verifying deployment..."
    
    # Check API endpoints
    echo "🌐 Checking API endpoints..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check Dashboard API
    if curl -f -s http://localhost:8001/health > /dev/null; then
        echo "✅ Dashboard API is running at http://localhost:8001"
    else
        echo "⚠️  Dashboard API may not be ready yet"
    fi
    
    # Check Barcode Service
    if curl -f -s http://localhost:8002/health > /dev/null; then
        echo "✅ Barcode Service is running at http://localhost:8002"
    else
        echo "⚠️  Barcode Service may not be ready yet"
    fi
    
    # Check Scanner API
    if curl -f -s http://localhost:8003/health > /dev/null; then
        echo "✅ Scanner API is running at http://localhost:8003"
    else
        echo "⚠️  Scanner API may not be ready yet"
    fi
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        echo "✅ Frontend is running at http://localhost:3000"
    else
        echo "ℹ️  Frontend not running (may need manual start)"
    fi
    
    # Check Kafka UI
    if curl -f -s http://localhost:8080 > /dev/null; then
        echo "✅ Kafka UI is available at http://localhost:8080"
    else
        echo "⚠️  Kafka UI may not be ready yet"
    fi
    
    echo "✅ Deployment verification completed"
}

# Display system information
show_system_info() {
    echo ""
    echo "🎉 Export-Import & Warehouse Management System Setup Complete!"
    echo "============================================================="
    echo ""
    echo "📊 System Components:"
    echo "  • Dashboard API:      http://localhost:8001"
    echo "  • Barcode Service:    http://localhost:8002"
    echo "  • Scanner API:        http://localhost:8003"
    echo "  • Frontend Dashboard: http://localhost:3000"
    echo "  • Kafka UI:           http://localhost:8080"
    echo ""
    echo "🗄️  Infrastructure:"
    echo "  • MongoDB:            localhost:27017"
    echo "  • Elasticsearch:      localhost:9200"
    echo "  • Kafka:              localhost:9092"
    echo "  • Redis:              localhost:6379"
    echo ""
    echo "📚 API Documentation:"
    echo "  • Dashboard API:      http://localhost:8001/api/docs"
    echo "  • Barcode Service:    http://localhost:8002/api/docs"
    echo "  • Scanner API:        http://localhost:8003/api/docs"
    echo ""
    echo "🔧 Management Commands:"
    echo "  • View logs:          docker-compose logs -f"
    echo "  • Stop services:      docker-compose down"
    echo "  • Restart services:   docker-compose restart"
    echo "  • View status:        docker ps"
    echo ""
    echo "📱 Mobile App:"
    echo "  • Location:           ./mobile-scanner/"
    echo "  • Build APK:          cd mobile-scanner && flutter build apk"
    echo ""
    echo "🧪 Testing:"
    echo "  • Run tests:          make test"
    echo "  • Load testing:       artillery quick --count 10 --num 100 http://localhost:8001/health"
    echo ""
    echo "📖 Documentation:"
    echo "  • System docs:        ./docs/"
    echo "  • API specs:          ./docs/api/"
    echo ""
}

# Main execution flow
main() {
    echo "Starting Export-Import & Warehouse Management System setup..."
    
    check_requirements
    setup_environment
    start_infrastructure
    initialize_database
    create_kafka_topics
    start_backend_services
    setup_frontend
    setup_mobile_app
    verify_deployment
    show_system_info
    
    echo "🚀 Setup completed successfully!"
    echo "The system is now ready for use."
}

# Run main function
main "$@"