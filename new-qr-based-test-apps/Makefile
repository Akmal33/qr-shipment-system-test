.PHONY: help build run stop test clean dev-setup

# Default target
help:
	@echo "Export-Import & Warehouse Management System"
	@echo "Available commands:"
	@echo "  dev-setup    - Set up development environment"
	@echo "  build        - Build all services"
	@echo "  run          - Start all services with Docker Compose"
	@echo "  stop         - Stop all services"
	@echo "  test         - Run all tests"
	@echo "  clean        - Clean build artifacts and containers"
	@echo "  kafka-topics - Create required Kafka topics"
	@echo "  db-init      - Initialize database with sample data"

# Development environment setup
dev-setup:
	@echo "Setting up development environment..."
	@if not exist .env copy .env.example .env
	@echo "Environment file created. Please review .env settings."
	@echo "Installing dependencies..."
	@cd dashboard-frontend && npm install
	@echo "Development environment ready!"

# Build all services
build:
	@echo "Building all services..."
	@docker-compose build

# Start all services
run:
	@echo "Starting all services..."
	@docker-compose up -d
	@echo "Services started. Dashboard available at http://localhost:3000"
	@echo "Kafka UI available at http://localhost:8080"

# Stop all services
stop:
	@echo "Stopping all services..."
	@docker-compose down

# Run tests
test:
	@echo "Running backend tests..."
	@cd services/dashboard-api && go test ./...
	@cd services/barcode-service && go test ./...
	@cd services/scanner-api && go test ./...
	@echo "Running frontend tests..."
	@cd dashboard-frontend && npm test -- --watchAll=false

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	@docker-compose down -v
	@docker system prune -f
	@echo "Cleanup complete."

# Create Kafka topics
kafka-topics:
	@echo "Creating Kafka topics..."
	@docker exec warehouse-kafka kafka-topics --create --topic inventory-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
	@docker exec warehouse-kafka kafka-topics --create --topic shipment-events --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1
	@docker exec warehouse-kafka kafka-topics --create --topic scan-events --bootstrap-server localhost:9092 --partitions 6 --replication-factor 1
	@docker exec warehouse-kafka kafka-topics --create --topic user-events --bootstrap-server localhost:9092 --partitions 2 --replication-factor 1
	@echo "Kafka topics created successfully."

# Initialize database
db-init:
	@echo "Initializing database with sample data..."
	@docker exec warehouse-mongodb mongosh warehouse_db --eval "db.items.createIndex({itemId: 1}, {unique: true})"
	@docker exec warehouse-mongodb mongosh warehouse_db --eval "db.shipments.createIndex({shipmentId: 1}, {unique: true})"
	@docker exec warehouse-mongodb mongosh warehouse_db --eval "db.users.createIndex({userId: 1}, {unique: true})"
	@docker exec warehouse-mongodb mongosh warehouse_db --eval "db.scan_logs.createIndex({timestamp: 1})"
	@echo "Database initialized successfully."

# Development mode - start infrastructure only
dev-infra:
	@echo "Starting infrastructure services only..."
	@docker-compose up -d mongodb elasticsearch kafka zookeeper redis kafka-ui
	@echo "Infrastructure services started."

# Check service health
health:
	@echo "Checking service health..."
	@curl -f http://localhost:8001/health || echo "Dashboard API: DOWN"
	@curl -f http://localhost:8002/health || echo "Barcode Service: DOWN"
	@curl -f http://localhost:8003/health || echo "Scanner API: DOWN"
	@curl -f http://localhost:9200/_cluster/health || echo "Elasticsearch: DOWN"

# View logs
logs:
	@docker-compose logs -f

# Backup data
backup:
	@echo "Creating backup..."
	@docker exec warehouse-mongodb mongodump --out /tmp/backup
	@docker cp warehouse-mongodb:/tmp/backup ./backup_$(shell date +%Y%m%d_%H%M%S)
	@echo "Backup created."