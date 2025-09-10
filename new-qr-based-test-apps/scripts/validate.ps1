# Warehouse Management System Validation Script (PowerShell)
# This script validates the deployment and system functionality

param(
    [string]$Namespace = "warehouse",
    [string]$Environment = "production",
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
    Write-Host "Usage: .\validate.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Namespace NAME      Target Kubernetes namespace (default: warehouse)"
    Write-Host "  -Environment NAME    Environment name (default: production)"
    Write-Host "  -Help                Show this help message"
    exit 0
}

# Check if namespace exists
function Test-Namespace {
    Write-Info "Checking namespace: $Namespace"
    
    try {
        kubectl get namespace $Namespace | Out-Null
        Write-Success "Namespace $Namespace exists"
        return $true
    }
    catch {
        Write-Error "Namespace $Namespace not found"
        return $false
    }
}

# Check pod status
function Test-Pods {
    Write-Info "Checking pod status in namespace: $Namespace"
    
    try {
        $pods = kubectl get pods -n $Namespace --no-headers
        
        if (-not $pods) {
            Write-Error "No pods found in namespace $Namespace"
            return $false
        }
        
        $failedPods = 0
        
        foreach ($line in $pods) {
            $parts = $line -split '\s+'
            $podName = $parts[0]
            $ready = $parts[1]
            $status = $parts[2]
            
            if ($status -eq "Running" -and $ready -match "^\d+/\d+$" -and $ready -notmatch "^0/") {
                Write-Success "Pod $podName is running and ready"
            }
            else {
                Write-Error "Pod $podName is not ready (Status: $status, Ready: $ready)"
                $failedPods++
            }
        }
        
        if ($failedPods -gt 0) {
            Write-Error "$failedPods pods are not ready"
            return $false
        }
        
        Write-Success "All pods are running and ready"
        return $true
    }
    catch {
        Write-Error "Failed to check pod status: $($_.Exception.Message)"
        return $false
    }
}

# Check services
function Test-Services {
    Write-Info "Checking services in namespace: $Namespace"
    
    $requiredServices = @(
        "dashboard-api-service",
        "barcode-service-service", 
        "scanner-api-service",
        "dashboard-frontend-service",
        "mongodb-service",
        "elasticsearch-service",
        "kafka-service",
        "redis-service"
    )
    
    $missingServices = 0
    
    foreach ($service in $requiredServices) {
        try {
            kubectl get service $service -n $Namespace | Out-Null
            Write-Success "Service $service exists"
        }
        catch {
            Write-Error "Service $service not found"
            $missingServices++
        }
    }
    
    if ($missingServices -gt 0) {
        Write-Error "$missingServices required services are missing"
        return $false
    }
    
    Write-Success "All required services are present"
    return $true
}

# Check persistent volumes
function Test-PersistentVolumes {
    Write-Info "Checking persistent volume claims in namespace: $Namespace"
    
    $requiredPVCs = @(
        "mongodb-pvc",
        "elasticsearch-pvc", 
        "redis-pvc"
    )
    
    $failedPVCs = 0
    
    foreach ($pvc in $requiredPVCs) {
        try {
            $status = kubectl get pvc $pvc -n $Namespace -o jsonpath='{.status.phase}' 2>$null
            
            if ($status -eq "Bound") {
                Write-Success "PVC $pvc is bound"
            }
            else {
                Write-Error "PVC $pvc is not bound (Status: $status)"
                $failedPVCs++
            }
        }
        catch {
            Write-Error "PVC $pvc not found"
            $failedPVCs++
        }
    }
    
    if ($failedPVCs -gt 0) {
        Write-Error "$failedPVCs PVCs are not properly bound"
        return $false
    }
    
    Write-Success "All persistent volumes are bound"
    return $true
}

# Test API endpoints
function Test-ApiEndpoints {
    Write-Info "Testing API endpoints..."
    
    # Start port forwarding jobs
    $dashboardJob = Start-Job -ScriptBlock { kubectl port-forward -n $using:Namespace svc/dashboard-api-service 8001:8001 }
    $barcodeJob = Start-Job -ScriptBlock { kubectl port-forward -n $using:Namespace svc/barcode-service-service 8002:8002 }
    $scannerJob = Start-Job -ScriptBlock { kubectl port-forward -n $using:Namespace svc/scanner-api-service 8003:8003 }
    
    # Wait for port forwards to establish
    Start-Sleep -Seconds 10
    
    $apiFailures = 0
    
    # Test dashboard API health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Dashboard API health check passed"
        }
        else {
            Write-Error "Dashboard API health check failed"
            $apiFailures++
        }
    }
    catch {
        Write-Error "Dashboard API health check failed: $($_.Exception.Message)"
        $apiFailures++
    }
    
    # Test barcode service health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8002/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Barcode service health check passed"
        }
        else {
            Write-Error "Barcode service health check failed"
            $apiFailures++
        }
    }
    catch {
        Write-Error "Barcode service health check failed: $($_.Exception.Message)"
        $apiFailures++
    }
    
    # Test scanner API health
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8003/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Scanner API health check passed"
        }
        else {
            Write-Error "Scanner API health check failed"
            $apiFailures++
        }
    }
    catch {
        Write-Error "Scanner API health check failed: $($_.Exception.Message)"
        $apiFailures++
    }
    
    # Cleanup port forwarding jobs
    Stop-Job $dashboardJob, $barcodeJob, $scannerJob -PassThru | Remove-Job
    
    if ($apiFailures -gt 0) {
        Write-Error "$apiFailures API health checks failed"
        return $false
    }
    
    Write-Success "All API health checks passed"
    return $true
}

# Test database connectivity
function Test-DatabaseConnectivity {
    Write-Info "Testing database connectivity..."
    
    try {
        # Get MongoDB pod name
        $mongoPod = kubectl get pods -l app=mongodb -n $Namespace -o jsonpath='{.items[0].metadata.name}'
        
        if (-not $mongoPod) {
            Write-Error "MongoDB pod not found"
            return $false
        }
        
        # Test MongoDB connection
        kubectl exec -n $Namespace $mongoPod -- mongo --eval "db.adminCommand('ping')" | Out-Null
        Write-Success "MongoDB connectivity test passed"
        
        # Get Elasticsearch pod name
        $esPod = kubectl get pods -l app=elasticsearch -n $Namespace -o jsonpath='{.items[0].metadata.name}'
        
        if (-not $esPod) {
            Write-Error "Elasticsearch pod not found"
            return $false
        }
        
        # Test Elasticsearch connection
        kubectl exec -n $Namespace $esPod -- curl -s http://localhost:9200/_cluster/health | Out-Null
        Write-Success "Elasticsearch connectivity test passed"
        
        Write-Success "Database connectivity tests passed"
        return $true
    }
    catch {
        Write-Error "Database connectivity test failed: $($_.Exception.Message)"
        return $false
    }
}

# Check resource usage
function Test-ResourceUsage {
    Write-Info "Checking resource usage..."
    
    try {
        $resourceData = kubectl top pods -n $Namespace --no-headers 2>$null
        
        if (-not $resourceData) {
            Write-Warning "Resource metrics not available (metrics-server may not be installed)"
            return
        }
        
        Write-Info "Current resource usage:"
        Write-Host $resourceData
        
        $highCpuPods = 0
        $highMemoryPods = 0
        
        foreach ($line in $resourceData) {
            $parts = $line -split '\s+'
            $podName = $parts[0]
            $cpu = $parts[1] -replace 'm', ''
            $memory = $parts[2] -replace 'Mi', ''
            
            # Check if CPU usage is high (> 400m)
            if ([int]$cpu -gt 400) {
                Write-Warning "Pod $podName has high CPU usage: ${cpu}m"
                $highCpuPods++
            }
            
            # Check if memory usage is high (> 800Mi)
            if ([int]$memory -gt 800) {
                Write-Warning "Pod $podName has high memory usage: ${memory}Mi"
                $highMemoryPods++
            }
        }
        
        if ($highCpuPods -gt 0 -or $highMemoryPods -gt 0) {
            Write-Warning "Some pods have high resource usage - monitor closely"
        }
        else {
            Write-Success "Resource usage is within normal limits"
        }
    }
    catch {
        Write-Warning "Could not check resource usage: $($_.Exception.Message)"
    }
}

# Check HPA status
function Test-HpaStatus {
    Write-Info "Checking Horizontal Pod Autoscaler status..."
    
    try {
        $hpaData = kubectl get hpa -n $Namespace --no-headers 2>$null
        
        if (-not $hpaData) {
            Write-Warning "No HPA configurations found"
            return
        }
        
        Write-Info "HPA Status:"
        kubectl get hpa -n $Namespace
        
        Write-Success "HPA status checked"
    }
    catch {
        Write-Warning "Could not check HPA status: $($_.Exception.Message)"
    }
}

# Generate system report
function New-SystemReport {
    Write-Info "Generating system validation report..."
    
    $reportFile = "validation-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    
    $reportContent = @"
=== Warehouse Management System Validation Report ===
Generated at: $(Get-Date)
Namespace: $Namespace
Environment: $Environment

=== Pod Status ===
$(kubectl get pods -n $Namespace -o wide)

=== Service Status ===
$(kubectl get services -n $Namespace)

=== PVC Status ===
$(kubectl get pvc -n $Namespace)

=== Resource Usage ===
$(kubectl top pods -n $Namespace 2>$null -or "Metrics not available")

=== HPA Status ===
$(kubectl get hpa -n $Namespace 2>$null -or "No HPA found")

=== Recent Events ===
$(kubectl get events -n $Namespace --sort-by=.metadata.creationTimestamp | Select-Object -Last 20)
"@
    
    $reportContent | Out-File -FilePath $reportFile -Encoding UTF8
    
    Write-Success "System report generated: $reportFile"
}

# Main validation function
function Main {
    Write-Info "Starting Warehouse Management System validation..."
    Write-Info "Target namespace: $Namespace"
    Write-Info "Environment: $Environment"
    Write-Host ""
    
    $validationFailures = 0
    
    # Run validation checks
    if (-not (Test-Namespace)) { $validationFailures++ }
    if (-not (Test-Pods)) { $validationFailures++ }
    if (-not (Test-Services)) { $validationFailures++ }
    if (-not (Test-PersistentVolumes)) { $validationFailures++ }
    if (-not (Test-DatabaseConnectivity)) { $validationFailures++ }
    if (-not (Test-ApiEndpoints)) { $validationFailures++ }
    
    # Run informational checks (non-critical)
    Test-ResourceUsage
    Test-HpaStatus
    
    # Generate report
    New-SystemReport
    
    Write-Host ""
    if ($validationFailures -eq 0) {
        Write-Success "System validation completed successfully!"
        Write-Success "All critical components are operational"
    }
    else {
        Write-Error "System validation failed with $validationFailures critical issues"
        Write-Error "Please review the issues and re-run validation after fixes"
        exit 1
    }
}

# Error handling
$ErrorActionPreference = "Continue"

try {
    Main
}
catch {
    Write-Error "Validation failed: $($_.Exception.Message)"
    exit 1
}