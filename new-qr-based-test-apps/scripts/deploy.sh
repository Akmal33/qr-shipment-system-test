#!/bin/bash

# Warehouse Management System Deployment Script
# This script deploys the complete warehouse management system to a Kubernetes cluster

set -e

# Configuration
NAMESPACE=${NAMESPACE:-"warehouse"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"warehouse"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if helm is installed
    if ! command -v helm &> /dev/null; then
        log_warning "helm is not installed - some features may not be available"
    fi
    
    # Check kubectl cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace $NAMESPACE
        log_success "Namespace $NAMESPACE created"
    fi
}

# Deploy infrastructure components
deploy_infrastructure() {
    log_info "Deploying infrastructure components..."
    
    # Apply infrastructure configurations
    kubectl apply -f k8s/production/infrastructure.yaml -n $NAMESPACE
    log_success "Infrastructure components deployed"
    
    # Wait for databases to be ready
    log_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s
    
    log_info "Waiting for Elasticsearch to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n $NAMESPACE --timeout=300s
    
    log_info "Waiting for Kafka to be ready..."
    kubectl wait --for=condition=ready pod -l app=kafka -n $NAMESPACE --timeout=300s
    
    log_success "All infrastructure components are ready"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Build dashboard API
    log_info "Building dashboard-api image..."
    docker build -t $DOCKER_REGISTRY/dashboard-api:latest services/dashboard-api/
    
    # Build barcode service
    log_info "Building barcode-service image..."
    docker build -t $DOCKER_REGISTRY/barcode-service:latest services/barcode-service/
    
    # Build scanner API
    log_info "Building scanner-api image..."
    docker build -t $DOCKER_REGISTRY/scanner-api:latest services/scanner-api/
    
    # Build dashboard frontend
    log_info "Building dashboard-frontend image..."
    docker build -t $DOCKER_REGISTRY/dashboard-frontend:latest dashboard-frontend/
    
    # Push images if registry is not local
    if [ "$DOCKER_REGISTRY" != "warehouse" ]; then
        log_info "Pushing images to registry..."
        docker push $DOCKER_REGISTRY/dashboard-api:latest
        docker push $DOCKER_REGISTRY/barcode-service:latest
        docker push $DOCKER_REGISTRY/scanner-api:latest
        docker push $DOCKER_REGISTRY/dashboard-frontend:latest
    fi
    
    log_success "Docker images built and pushed"
}

# Deploy applications
deploy_applications() {
    log_info "Deploying application services..."
    
    # Apply application deployments
    kubectl apply -f k8s/production/app-deployments.yaml -n $NAMESPACE
    log_success "Application services deployed"
    
    # Wait for applications to be ready
    log_info "Waiting for applications to be ready..."
    kubectl wait --for=condition=ready pod -l app=dashboard-api -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=barcode-service -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=scanner-api -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=dashboard-frontend -n $NAMESPACE --timeout=300s
    
    log_success "All applications are ready"
}

# Deploy ingress and networking
deploy_networking() {
    log_info "Deploying ingress and networking configuration..."
    
    # Apply ingress and policies
    kubectl apply -f k8s/production/ingress-and-policies.yaml -n $NAMESPACE
    log_success "Networking configuration deployed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Apply monitoring configurations
    kubectl apply -f k8s/production/monitoring.yaml -n $NAMESPACE
    log_success "Monitoring stack deployed"
    
    # Wait for monitoring components
    log_info "Waiting for monitoring components to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n $NAMESPACE --timeout=300s
    kubectl wait --for=condition=ready pod -l app=grafana -n $NAMESPACE --timeout=300s
    
    log_success "Monitoring stack is ready"
}

# Initialize database
initialize_database() {
    log_info "Initializing database..."
    
    # Get MongoDB pod name
    MONGO_POD=$(kubectl get pods -l app=mongodb -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    # Initialize database with sample data
    kubectl exec -n $NAMESPACE $MONGO_POD -- mongo warehouse --eval "
        // Create sample users
        db.users.insertMany([
            {
                userId: 'USR-001',
                username: 'admin',
                email: 'admin@warehouse.com',
                role: 'admin',
                permissions: ['inventory:read', 'inventory:write', 'shipments:read', 'shipments:write', 'analytics:read'],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 'USR-002',
                username: 'warehouse_operator',
                email: 'operator@warehouse.com',
                role: 'operator',
                permissions: ['inventory:read', 'inventory:write', 'shipments:read'],
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        
        // Create sample items
        db.items.insertMany([
            {
                itemId: 'ITM-2024-001',
                name: 'Wireless Bluetooth Headphones',
                category: 'Electronics',
                costPrice: 25.00,
                sellingPrice: 49.99,
                stockLevel: 150,
                warehouseLocation: 'A1-B2-C3',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                itemId: 'ITM-2024-002',
                name: 'Stainless Steel Water Bottle',
                category: 'Home & Garden',
                costPrice: 8.50,
                sellingPrice: 19.99,
                stockLevel: 200,
                warehouseLocation: 'B2-C1-D4',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
        
        print('Database initialized with sample data');
    "
    
    log_success "Database initialized"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check API endpoints
    kubectl port-forward -n $NAMESPACE svc/dashboard-api-service 8001:8001 &
    DASHBOARD_PF_PID=$!
    
    sleep 5
    
    # Test dashboard API health
    if curl -f http://localhost:8001/health &> /dev/null; then
        log_success "Dashboard API health check passed"
    else
        log_error "Dashboard API health check failed"
    fi
    
    # Cleanup port forwards
    kill $DASHBOARD_PF_PID &> /dev/null || true
    
    log_success "Health checks completed"
}

# Print deployment information
print_deployment_info() {
    log_info "Deployment completed successfully!"
    echo ""
    echo "=== Warehouse Management System Deployment Info ==="
    echo ""
    echo "Namespace: $NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo ""
    echo "Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    echo "Access Information:"
    echo "- Dashboard Frontend: http://warehouse.company.com (configure DNS)"
    echo "- API Endpoints: http://api.warehouse.company.com (configure DNS)"
    echo "- Grafana Dashboard: kubectl port-forward svc/grafana-service 3000:3000 -n $NAMESPACE"
    echo "- Prometheus: kubectl port-forward svc/prometheus-service 9090:9090 -n $NAMESPACE"
    echo ""
    echo "Default Credentials:"
    echo "- Admin User: admin / admin (change immediately)"
    echo "- Grafana: admin / admin123"
    echo ""
    log_success "Deployment information printed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up background processes..."
    jobs -p | xargs -r kill
}

# Main deployment function
main() {
    trap cleanup EXIT
    
    log_info "Starting Warehouse Management System deployment..."
    log_info "Target namespace: $NAMESPACE"
    log_info "Environment: $ENVIRONMENT"
    log_info "Docker registry: $DOCKER_REGISTRY"
    echo ""
    
    check_prerequisites
    create_namespace
    
    # Build and push images (skip if using pre-built images)
    if [ "${SKIP_BUILD:-false}" != "true" ]; then
        build_and_push_images
    fi
    
    deploy_infrastructure
    deploy_applications
    deploy_networking
    
    # Deploy monitoring (optional)
    if [ "${DEPLOY_MONITORING:-true}" == "true" ]; then
        deploy_monitoring
    fi
    
    initialize_database
    run_health_checks
    print_deployment_info
    
    log_success "Warehouse Management System deployed successfully!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD="true"
            shift
            ;;
        --no-monitoring)
            DEPLOY_MONITORING="false"
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --namespace NAME      Target Kubernetes namespace (default: warehouse)"
            echo "  --environment NAME    Deployment environment (default: production)"
            echo "  --registry URL        Docker registry URL (default: warehouse)"
            echo "  --skip-build          Skip Docker image building"
            echo "  --no-monitoring       Skip monitoring stack deployment"
            echo "  --help                Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main function
main