#!/bin/bash

# Warehouse Management System Validation Script
# This script validates the deployment and system functionality

set -e

# Configuration
NAMESPACE=${NAMESPACE:-"warehouse"}
ENVIRONMENT=${ENVIRONMENT:-"production"}

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

# Check if namespace exists
check_namespace() {
    log_info "Checking namespace: $NAMESPACE"
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_success "Namespace $NAMESPACE exists"
    else
        log_error "Namespace $NAMESPACE not found"
        exit 1
    fi
}

# Check pod status
check_pods() {
    log_info "Checking pod status in namespace: $NAMESPACE"
    
    # Get all pods in namespace
    local pods=$(kubectl get pods -n $NAMESPACE --no-headers)
    
    if [ -z "$pods" ]; then
        log_error "No pods found in namespace $NAMESPACE"
        exit 1
    fi
    
    # Check each pod status
    local failed_pods=0
    
    while IFS= read -r line; do
        local pod_name=$(echo $line | awk '{print $1}')
        local status=$(echo $line | awk '{print $3}')
        local ready=$(echo $line | awk '{print $2}')
        
        if [[ "$status" == "Running" ]] && [[ "$ready" =~ ^[1-9]/[1-9] ]]; then
            log_success "Pod $pod_name is running and ready"
        else
            log_error "Pod $pod_name is not ready (Status: $status, Ready: $ready)"
            ((failed_pods++))
        fi
    done <<< "$pods"
    
    if [ $failed_pods -gt 0 ]; then
        log_error "$failed_pods pods are not ready"
        return 1
    fi
    
    log_success "All pods are running and ready"
}

# Check services
check_services() {
    log_info "Checking services in namespace: $NAMESPACE"
    
    local required_services=(
        "dashboard-api-service"
        "barcode-service-service"
        "scanner-api-service"
        "dashboard-frontend-service"
        "mongodb-service"
        "elasticsearch-service"
        "kafka-service"
        "redis-service"
    )
    
    local missing_services=0
    
    for service in "${required_services[@]}"; do
        if kubectl get service $service -n $NAMESPACE &> /dev/null; then
            log_success "Service $service exists"
        else
            log_error "Service $service not found"
            ((missing_services++))
        fi
    done
    
    if [ $missing_services -gt 0 ]; then
        log_error "$missing_services required services are missing"
        return 1
    fi
    
    log_success "All required services are present"
}

# Check persistent volumes
check_persistent_volumes() {
    log_info "Checking persistent volume claims in namespace: $NAMESPACE"
    
    local required_pvcs=(
        "mongodb-pvc"
        "elasticsearch-pvc"
        "redis-pvc"
    )
    
    local failed_pvcs=0
    
    for pvc in "${required_pvcs[@]}"; do
        local status=$(kubectl get pvc $pvc -n $NAMESPACE -o jsonpath='{.status.phase}' 2>/dev/null || echo "NotFound")
        
        if [ "$status" == "Bound" ]; then
            log_success "PVC $pvc is bound"
        else
            log_error "PVC $pvc is not bound (Status: $status)"
            ((failed_pvcs++))
        fi
    done
    
    if [ $failed_pvcs -gt 0 ]; then
        log_error "$failed_pvcs PVCs are not properly bound"
        return 1
    fi
    
    log_success "All persistent volumes are bound"
}

# Test API endpoints
test_api_endpoints() {
    log_info "Testing API endpoints..."
    
    # Port forward to dashboard API
    kubectl port-forward -n $NAMESPACE svc/dashboard-api-service 8001:8001 &
    local dashboard_pf_pid=$!
    
    # Port forward to barcode service
    kubectl port-forward -n $NAMESPACE svc/barcode-service-service 8002:8002 &
    local barcode_pf_pid=$!
    
    # Port forward to scanner API
    kubectl port-forward -n $NAMESPACE svc/scanner-api-service 8003:8003 &
    local scanner_pf_pid=$!
    
    # Wait for port forwards to establish
    sleep 10
    
    local api_failures=0
    
    # Test dashboard API health
    if curl -f -s http://localhost:8001/health &> /dev/null; then
        log_success "Dashboard API health check passed"
    else
        log_error "Dashboard API health check failed"
        ((api_failures++))
    fi
    
    # Test barcode service health
    if curl -f -s http://localhost:8002/health &> /dev/null; then
        log_success "Barcode service health check passed"
    else
        log_error "Barcode service health check failed"
        ((api_failures++))
    fi
    
    # Test scanner API health
    if curl -f -s http://localhost:8003/health &> /dev/null; then
        log_success "Scanner API health check passed"
    else
        log_error "Scanner API health check failed"
        ((api_failures++))
    fi
    
    # Cleanup port forwards
    kill $dashboard_pf_pid $barcode_pf_pid $scanner_pf_pid &> /dev/null || true
    
    if [ $api_failures -gt 0 ]; then
        log_error "$api_failures API health checks failed"
        return 1
    fi
    
    log_success "All API health checks passed"
}

# Test database connectivity
test_database_connectivity() {
    log_info "Testing database connectivity..."
    
    # Get MongoDB pod name
    local mongo_pod=$(kubectl get pods -l app=mongodb -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$mongo_pod" ]; then
        log_error "MongoDB pod not found"
        return 1
    fi
    
    # Test MongoDB connection
    if kubectl exec -n $NAMESPACE $mongo_pod -- mongo --eval "db.adminCommand('ping')" &> /dev/null; then
        log_success "MongoDB connectivity test passed"
    else
        log_error "MongoDB connectivity test failed"
        return 1
    fi
    
    # Get Elasticsearch pod name
    local es_pod=$(kubectl get pods -l app=elasticsearch -n $NAMESPACE -o jsonpath='{.items[0].metadata.name}')
    
    if [ -z "$es_pod" ]; then
        log_error "Elasticsearch pod not found"
        return 1
    fi
    
    # Test Elasticsearch connection
    if kubectl exec -n $NAMESPACE $es_pod -- curl -s http://localhost:9200/_cluster/health &> /dev/null; then
        log_success "Elasticsearch connectivity test passed"
    else
        log_error "Elasticsearch connectivity test failed"
        return 1
    fi
    
    log_success "Database connectivity tests passed"
}

# Check resource usage
check_resource_usage() {
    log_info "Checking resource usage..."
    
    # Get resource usage for pods
    local resource_data=$(kubectl top pods -n $NAMESPACE --no-headers 2>/dev/null || echo "")
    
    if [ -z "$resource_data" ]; then
        log_warning "Resource metrics not available (metrics-server may not be installed)"
        return 0
    fi
    
    log_info "Current resource usage:"
    echo "$resource_data"
    
    # Check for high resource usage
    local high_cpu_pods=0
    local high_memory_pods=0
    
    while IFS= read -r line; do
        local pod_name=$(echo $line | awk '{print $1}')
        local cpu=$(echo $line | awk '{print $2}' | sed 's/m//')
        local memory=$(echo $line | awk '{print $3}' | sed 's/Mi//')
        
        # Check if CPU usage is high (> 400m)
        if [ "$cpu" -gt 400 ] 2>/dev/null; then
            log_warning "Pod $pod_name has high CPU usage: ${cpu}m"
            ((high_cpu_pods++))
        fi
        
        # Check if memory usage is high (> 800Mi)
        if [ "$memory" -gt 800 ] 2>/dev/null; then
            log_warning "Pod $pod_name has high memory usage: ${memory}Mi"
            ((high_memory_pods++))
        fi
    done <<< "$resource_data"
    
    if [ $high_cpu_pods -gt 0 ] || [ $high_memory_pods -gt 0 ]; then
        log_warning "Some pods have high resource usage - monitor closely"
    else
        log_success "Resource usage is within normal limits"
    fi
}

# Check HPA status
check_hpa_status() {
    log_info "Checking Horizontal Pod Autoscaler status..."
    
    local hpa_data=$(kubectl get hpa -n $NAMESPACE --no-headers 2>/dev/null || echo "")
    
    if [ -z "$hpa_data" ]; then
        log_warning "No HPA configurations found"
        return 0
    fi
    
    log_info "HPA Status:"
    kubectl get hpa -n $NAMESPACE
    
    log_success "HPA status checked"
}

# Generate system report
generate_system_report() {
    log_info "Generating system validation report..."
    
    local report_file="validation-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "=== Warehouse Management System Validation Report ==="
        echo "Generated at: $(date)"
        echo "Namespace: $NAMESPACE"
        echo "Environment: $ENVIRONMENT"
        echo ""
        
        echo "=== Pod Status ==="
        kubectl get pods -n $NAMESPACE -o wide
        echo ""
        
        echo "=== Service Status ==="
        kubectl get services -n $NAMESPACE
        echo ""
        
        echo "=== PVC Status ==="
        kubectl get pvc -n $NAMESPACE
        echo ""
        
        echo "=== Resource Usage ==="
        kubectl top pods -n $NAMESPACE 2>/dev/null || echo "Metrics not available"
        echo ""
        
        echo "=== HPA Status ==="
        kubectl get hpa -n $NAMESPACE 2>/dev/null || echo "No HPA found"
        echo ""
        
        echo "=== Recent Events ==="
        kubectl get events -n $NAMESPACE --sort-by=.metadata.creationTimestamp | tail -20
        
    } > $report_file
    
    log_success "System report generated: $report_file"
}

# Main validation function
main() {
    log_info "Starting Warehouse Management System validation..."
    log_info "Target namespace: $NAMESPACE"
    log_info "Environment: $ENVIRONMENT"
    echo ""
    
    local validation_failures=0
    
    # Run validation checks
    check_namespace || ((validation_failures++))
    check_pods || ((validation_failures++))
    check_services || ((validation_failures++))
    check_persistent_volumes || ((validation_failures++))
    test_database_connectivity || ((validation_failures++))
    test_api_endpoints || ((validation_failures++))
    
    # Run informational checks (non-critical)
    check_resource_usage
    check_hpa_status
    
    # Generate report
    generate_system_report
    
    echo ""
    if [ $validation_failures -eq 0 ]; then
        log_success "System validation completed successfully!"
        log_success "All critical components are operational"
    else
        log_error "System validation failed with $validation_failures critical issues"
        log_error "Please review the issues and re-run validation after fixes"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up background processes..."
    jobs -p | xargs -r kill 2>/dev/null || true
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
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --namespace NAME      Target Kubernetes namespace (default: warehouse)"
            echo "  --environment NAME    Environment name (default: production)"
            echo "  --help                Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Set up cleanup trap
trap cleanup EXIT

# Run main function
main