# Warehouse Management System Deployment Script (PowerShell)
# This script deploys the complete warehouse management system to a Kubernetes cluster

param(
    [string]$Namespace = "warehouse",
    [string]$Environment = "production", 
    [string]$DockerRegistry = "warehouse",
    [switch]$SkipBuild,
    [switch]$NoMonitoring,
    [switch]$Help
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Show help
if ($Help) {
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Namespace NAME      Target Kubernetes namespace (default: warehouse)"
    Write-Host "  -Environment NAME    Deployment environment (default: production)"
    Write-Host "  -DockerRegistry URL  Docker registry URL (default: warehouse)"
    Write-Host "  -SkipBuild           Skip Docker image building"
    Write-Host "  -NoMonitoring        Skip monitoring stack deployment"
    Write-Host "  -Help                Show this help message"
    exit 0
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check if kubectl is installed
    try {
        kubectl version --client --output=json | Out-Null
    }
    catch {
        Write-Error "kubectl is not installed or not in PATH"
        exit 1
    }
    
    # Check if helm is installed
    try {
        helm version --short | Out-Null
    }
    catch {
        Write-Warning "helm is not installed - some features may not be available"
    }
    
    # Check kubectl cluster connection
    try {
        kubectl cluster-info | Out-Null
    }
    catch {
        Write-Error "Cannot connect to Kubernetes cluster"
        exit 1
    }
    
    Write-Success "Prerequisites check completed"
}

# Create namespace
function New-Namespace {
    Write-Info "Creating namespace: $Namespace"
    
    $namespaceExists = kubectl get namespace $Namespace 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Warning "Namespace $Namespace already exists"
    }
    else {
        kubectl create namespace $Namespace
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Namespace $Namespace created"
        }
        else {
            Write-Error "Failed to create namespace"
            exit 1
        }
    }
}

# Deploy infrastructure components
function Deploy-Infrastructure {
    Write-Info "Deploying infrastructure components..."
    
    # Apply infrastructure configurations
    kubectl apply -f k8s/production/infrastructure.yaml -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy infrastructure"
        exit 1
    }
    Write-Success "Infrastructure components deployed"
    
    # Wait for databases to be ready
    Write-Info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n $Namespace --timeout=300s
    
    Write-Info "Waiting for Elasticsearch to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n $Namespace --timeout=300s
    
    Write-Info "Waiting for Kafka to be ready..."
    kubectl wait --for=condition=ready pod -l app=kafka -n $Namespace --timeout=300s
    
    Write-Success "All infrastructure components are ready"
}

# Build and push Docker images
function Build-PushImages {
    Write-Info "Building and pushing Docker images..."
    
    # Build dashboard API
    Write-Info "Building dashboard-api image..."
    docker build -t "$DockerRegistry/dashboard-api:latest" services/dashboard-api/
    
    # Build barcode service
    Write-Info "Building barcode-service image..."
    docker build -t "$DockerRegistry/barcode-service:latest" services/barcode-service/
    
    # Build scanner API
    Write-Info "Building scanner-api image..."
    docker build -t "$DockerRegistry/scanner-api:latest" services/scanner-api/
    
    # Build dashboard frontend
    Write-Info "Building dashboard-frontend image..."
    docker build -t "$DockerRegistry/dashboard-frontend:latest" dashboard-frontend/
    
    # Push images if registry is not local
    if ($DockerRegistry -ne "warehouse") {
        Write-Info "Pushing images to registry..."
        docker push "$DockerRegistry/dashboard-api:latest"
        docker push "$DockerRegistry/barcode-service:latest"
        docker push "$DockerRegistry/scanner-api:latest"
        docker push "$DockerRegistry/dashboard-frontend:latest"
    }
    
    Write-Success "Docker images built and pushed"
}

# Deploy applications
function Deploy-Applications {
    Write-Info "Deploying application services..."
    
    # Apply application deployments
    kubectl apply -f k8s/production/app-deployments.yaml -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy applications"
        exit 1
    }
    Write-Success "Application services deployed"
    
    # Wait for applications to be ready
    Write-Info "Waiting for applications to be ready..."
    kubectl wait --for=condition=ready pod -l app=dashboard-api -n $Namespace --timeout=300s
    kubectl wait --for=condition=ready pod -l app=barcode-service -n $Namespace --timeout=300s
    kubectl wait --for=condition=ready pod -l app=scanner-api -n $Namespace --timeout=300s
    kubectl wait --for=condition=ready pod -l app=dashboard-frontend -n $Namespace --timeout=300s
    
    Write-Success "All applications are ready"
}

# Deploy ingress and networking
function Deploy-Networking {
    Write-Info "Deploying ingress and networking configuration..."
    
    # Apply ingress and policies
    kubectl apply -f k8s/production/ingress-and-policies.yaml -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy networking"
        exit 1
    }
    Write-Success "Networking configuration deployed"
}

# Deploy monitoring stack
function Deploy-Monitoring {
    Write-Info "Deploying monitoring stack..."
    
    # Apply monitoring configurations
    kubectl apply -f k8s/production/monitoring.yaml -n $Namespace
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy monitoring"
        exit 1
    }
    Write-Success "Monitoring stack deployed"
    
    # Wait for monitoring components
    Write-Info "Waiting for monitoring components to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n $Namespace --timeout=300s
    kubectl wait --for=condition=ready pod -l app=grafana -n $Namespace --timeout=300s
    
    Write-Success "Monitoring stack is ready"
}

# Initialize database
function Initialize-Database {
    Write-Info "Initializing database..."
    
    # Get MongoDB pod name
    $MongoPod = kubectl get pods -l app=mongodb -n $Namespace -o jsonpath='{.items[0].metadata.name}'
    
    # Initialize database with sample data
    $initScript = @"
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
"@
    
    kubectl exec -n $Namespace $MongoPod -- mongo warehouse --eval $initScript
    
    Write-Success "Database initialized"
}

# Run health checks
function Test-HealthChecks {
    Write-Info "Running health checks..."
    
    # Check API endpoints
    $job = Start-Job -ScriptBlock { kubectl port-forward -n $using:Namespace svc/dashboard-api-service 8001:8001 }
    
    Start-Sleep -Seconds 5
    
    # Test dashboard API health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "Dashboard API health check passed"
        }
        else {
            Write-Error "Dashboard API health check failed"
        }
    }
    catch {
        Write-Error "Dashboard API health check failed: $($_.Exception.Message)"
    }
    
    # Cleanup port forwards
    Stop-Job $job -PassThru | Remove-Job
    
    Write-Success "Health checks completed"
}

# Print deployment information
function Show-DeploymentInfo {
    Write-Info "Deployment completed successfully!"
    Write-Host ""
    Write-Host "=== Warehouse Management System Deployment Info ===" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Namespace: $Namespace"
    Write-Host "Environment: $Environment"
    Write-Host ""
    Write-Host "Services:"
    kubectl get services -n $Namespace
    Write-Host ""
    Write-Host "Pods:"
    kubectl get pods -n $Namespace
    Write-Host ""
    Write-Host "Access Information:"
    Write-Host "- Dashboard Frontend: http://warehouse.company.com (configure DNS)"
    Write-Host "- API Endpoints: http://api.warehouse.company.com (configure DNS)"
    Write-Host "- Grafana Dashboard: kubectl port-forward svc/grafana-service 3000:3000 -n $Namespace"
    Write-Host "- Prometheus: kubectl port-forward svc/prometheus-service 9090:9090 -n $Namespace"
    Write-Host ""
    Write-Host "Default Credentials:"
    Write-Host "- Admin User: admin / admin (change immediately)"
    Write-Host "- Grafana: admin / admin123"
    Write-Host ""
    Write-Success "Deployment information printed"
}

# Main deployment function
function Main {
    Write-Info "Starting Warehouse Management System deployment..."
    Write-Info "Target namespace: $Namespace"
    Write-Info "Environment: $Environment" 
    Write-Info "Docker registry: $DockerRegistry"
    Write-Host ""
    
    Test-Prerequisites
    New-Namespace
    
    # Build and push images (skip if using pre-built images)
    if (-not $SkipBuild) {
        Build-PushImages
    }
    
    Deploy-Infrastructure
    Deploy-Applications
    Deploy-Networking
    
    # Deploy monitoring (optional)
    if (-not $NoMonitoring) {
        Deploy-Monitoring
    }
    
    Initialize-Database
    Test-HealthChecks
    Show-DeploymentInfo
    
    Write-Success "Warehouse Management System deployed successfully!"
}

# Error handling
$ErrorActionPreference = "Stop"

try {
    Main
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}