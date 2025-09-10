# Export-Import & Warehouse Management System

A comprehensive microservices-based warehouse management system with real-time tracking, barcode generation, and mobile scanning capabilities.

## System Architecture

This system consists of three main applications:
- **Dashboard Application**: Web-based management interface
- **Barcode Generator**: Printable barcode creation system  
- **Mobile Scanner**: Flutter-based barcode validation app

## Technology Stack

### Backend
- **Language**: Go (Golang)
- **Database**: MongoDB
- **Search Engine**: Elasticsearch
- **Message Broker**: Apache Kafka
- **Architecture**: Microservices

### Frontend
- **Dashboard**: React with TypeScript
- **Mobile**: Flutter (Android APK)

## Project Structure

```
├── services/               # Backend microservices
│   ├── dashboard-api/      # Dashboard backend service
│   ├── barcode-service/    # Barcode generation service
│   ├── scanner-api/        # Scanner validation service
│   └── shared/             # Shared utilities and models
├── dashboard-frontend/     # React dashboard application
├── mobile-scanner/         # Flutter mobile application
├── infrastructure/         # Docker, Kafka, database configs
├── docs/                   # Documentation
└── scripts/                # Build and deployment scripts
```

## Getting Started

### Development Environment

1. **Prerequisites**
   - Docker & Docker Compose
   - Go 1.19+
   - Node.js 18+
   - Flutter SDK

2. **Quick Setup**
   ```bash
   # Linux/Mac
   ./scripts/setup.sh
   
   # Windows
   .\scripts\setup.ps1
   ```

3. **Manual Setup Infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Run Backend Services**
   ```bash
   cd services/dashboard-api && go run main.go
   cd services/barcode-service && go run main.go
   cd services/scanner-api && go run main.go
   ```

5. **Run Frontend**
   ```bash
   cd dashboard-frontend && npm start
   ```

6. **Build Mobile App**
   ```bash
   cd mobile-scanner && flutter build apk
   ```

### Production Deployment

1. **Prerequisites**
   - Kubernetes cluster
   - kubectl configured
   - Docker registry access

2. **Deploy to Kubernetes**
   ```bash
   # Linux/Mac
   ./scripts/deploy.sh
   
   # Windows
   .\scripts\deploy.ps1
   ```

3. **Configure DNS**
   - Point `warehouse.company.com` to frontend LoadBalancer
   - Point `api.warehouse.company.com` to API gateway

## Access Information

### Development URLs
- Dashboard: http://localhost:3000
- Dashboard API: http://localhost:8001
- Barcode Service: http://localhost:8002
- Scanner API: http://localhost:8003

### Production URLs (configure DNS)
- Dashboard: https://warehouse.company.com
- API Gateway: https://api.warehouse.company.com
- Grafana Monitoring: `kubectl port-forward svc/grafana-service 3000:3000`
- Prometheus: `kubectl port-forward svc/prometheus-service 9090:9090`

## Default Credentials
- Admin User: `admin` / `admin` (change immediately in production)
- Grafana Dashboard: `admin` / `admin123`

## Performance Requirements
- Target TPS: 120 transactions per second
- API Response Time: < 200ms
- Scanner Validation: < 100ms

## Features

### Dashboard Application
- Real-time inventory tracking
- Profit margin analysis
- Shipment status monitoring
- Delivery timeline tracking

### Barcode Generator
- Code 128 for items
- QR codes for users
- Code 39 for shipments
- Printable format output

### Mobile Scanner
- Real-time barcode scanning
- Item and user validation
- Offline sync capability
- Access level verification

## API Documentation
API documentation is available at `/api/docs` when services are running.

## Testing
```bash
# Run all tests
make test

# Run specific service tests
cd services/dashboard-api && go test ./...
```

## Deployment

### Development Deployment
For local development and testing:
```bash
docker-compose up -d
```

### Production Deployment
Production deployment uses Kubernetes with complete monitoring stack:
- High availability with auto-scaling
- Comprehensive monitoring (Prometheus + Grafana)
- Centralized logging and alerting
- Load balancing and ingress control

See deployment scripts in `scripts/` directory for automated setup.

## Monitoring and Observability

The production deployment includes:
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Dashboard visualization
- **AlertManager**: Alert routing and management
- **Health Checks**: Automated service monitoring

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Network policies for pod-to-pod communication
- TLS encryption for external traffic
- Secrets management for sensitive data