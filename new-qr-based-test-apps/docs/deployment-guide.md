# Deployment Guide - Warehouse Management System

This guide provides comprehensive instructions for deploying the Warehouse Management System in different environments.

## Table of Contents
1. [Development Deployment](#development-deployment)
2. [Production Deployment](#production-deployment)
3. [Docker Images](#docker-images)
4. [Kubernetes Configuration](#kubernetes-configuration)
5. [Monitoring Setup](#monitoring-setup)
6. [Security Configuration](#security-configuration)
7. [Troubleshooting](#troubleshooting)

## Development Deployment

### Prerequisites
- Docker Desktop or Docker Engine + Docker Compose
- Git
- 8GB+ RAM recommended
- 20GB+ free disk space

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd new-qr-based-test-apps

# Run automated setup (Linux/Mac)
./scripts/setup.sh

# Or Windows
./scripts/setup.ps1

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### Manual Development Setup

1. **Start Infrastructure Services**
   ```bash
   docker-compose up -d mongodb elasticsearch kafka redis
   ```

2. **Wait for Services to Initialize**
   ```bash
   # Check service health
   docker-compose logs mongodb
   docker-compose logs elasticsearch
   docker-compose logs kafka
   ```

3. **Start Application Services**
   ```bash
   # Start backend APIs
   docker-compose up -d dashboard-api barcode-service scanner-api

   # Start frontend
   docker-compose up -d dashboard-frontend
   ```

4. **Access Applications**
   - Dashboard: http://localhost:3000
   - API Gateway: http://localhost:8001
   - Barcode Service: http://localhost:8002
   - Scanner API: http://localhost:8003

### Development Configuration

Environment variables for development are configured in `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/warehouse
ELASTICSEARCH_URL=http://localhost:9200
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# Security
JWT_SECRET=dev-secret-key
API_PORT=8001

# Frontend
REACT_APP_API_URL=http://localhost:8001
```

## Production Deployment

### Prerequisites
- Kubernetes cluster (v1.24+)
- kubectl configured
- Docker registry access
- Minimum 16GB RAM across cluster nodes
- 100GB+ storage capacity

### Quick Production Deploy

```bash
# Deploy to default namespace 'warehouse'
./scripts/deploy.sh

# Deploy to custom namespace
./scripts/deploy.sh --namespace my-warehouse --environment production

# Deploy without monitoring stack
./scripts/deploy.sh --no-monitoring

# Skip Docker image building (use pre-built images)
./scripts/deploy.sh --skip-build --registry your-registry.com
```

### Manual Production Setup

1. **Create Namespace**
   ```bash
   kubectl create namespace warehouse
   ```

2. **Deploy Infrastructure Components**
   ```bash
   kubectl apply -f k8s/production/infrastructure.yaml -n warehouse
   ```

3. **Wait for Infrastructure**
   ```bash
   kubectl wait --for=condition=ready pod -l app=mongodb -n warehouse --timeout=300s
   kubectl wait --for=condition=ready pod -l app=elasticsearch -n warehouse --timeout=300s
   kubectl wait --for=condition=ready pod -l app=kafka -n warehouse --timeout=300s
   ```

4. **Deploy Application Services**
   ```bash
   kubectl apply -f k8s/production/app-deployments.yaml -n warehouse
   ```

5. **Configure Networking**
   ```bash
   kubectl apply -f k8s/production/ingress-and-policies.yaml -n warehouse
   ```

6. **Deploy Monitoring (Optional)**
   ```bash
   kubectl apply -f k8s/production/monitoring.yaml -n warehouse
   ```

## Docker Images

### Building Images

```bash
# Build all images
make build-all

# Build specific services
docker build -t warehouse/dashboard-api:latest services/dashboard-api/
docker build -t warehouse/barcode-service:latest services/barcode-service/
docker build -t warehouse/scanner-api:latest services/scanner-api/
docker build -t warehouse/dashboard-frontend:latest dashboard-frontend/
```

### Image Registry

For production deployment, push images to your registry:

```bash
# Tag images for your registry
docker tag warehouse/dashboard-api:latest your-registry.com/warehouse/dashboard-api:latest

# Push to registry
docker push your-registry.com/warehouse/dashboard-api:latest
```

Update deployment configurations to use your registry:
```yaml
# In k8s/production/app-deployments.yaml
image: your-registry.com/warehouse/dashboard-api:latest
```

## Kubernetes Configuration

### Persistent Storage

The system requires persistent storage for:
- MongoDB data (10GB recommended)
- Elasticsearch data (5GB recommended)
- Redis data (1GB recommended)
- Prometheus metrics (5GB recommended)
- Grafana dashboards (2GB recommended)

### Resource Requirements

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|-----------|----------------|--------------|
| Dashboard API | 250m | 500m | 256Mi | 512Mi |
| Barcode Service | 100m | 250m | 128Mi | 256Mi |
| Scanner API | 100m | 250m | 128Mi | 256Mi |
| Frontend | 100m | 250m | 128Mi | 256Mi |
| MongoDB | 250m | 500m | 512Mi | 1Gi |
| Elasticsearch | 500m | 1000m | 1Gi | 2Gi |
| Kafka | 250m | 500m | 512Mi | 1Gi |
| Redis | 100m | 250m | 128Mi | 256Mi |

### Auto-scaling Configuration

Horizontal Pod Autoscaling is configured for API services:

```yaml
# Dashboard API scales 3-10 pods based on CPU/Memory
# Barcode Service scales 2-8 pods
# Scanner API scales 2-8 pods
```

## Monitoring Setup

### Prometheus Configuration

Prometheus is configured to scrape metrics from:
- All application services (`/metrics` endpoint)
- Kubernetes cluster metrics
- Infrastructure components

### Grafana Dashboards

Access Grafana at:
```bash
kubectl port-forward svc/grafana-service 3000:3000 -n warehouse
```

Default login: `admin` / `admin123`

Pre-configured dashboards include:
- System Overview
- API Performance
- Infrastructure Metrics
- Business Metrics

### Alerting Rules

Configured alerts for:
- High CPU/Memory usage (>80%)
- Database connectivity issues
- API error rates (>10%)
- Service downtime

### Log Aggregation

Logs are collected from all services and can be viewed via:
```bash
kubectl logs -l app=dashboard-api -n warehouse
kubectl logs -l app=barcode-service -n warehouse
kubectl logs -l app=scanner-api -n warehouse
```

## Security Configuration

### Authentication & Authorization

- JWT-based authentication for all API endpoints
- Role-based access control (RBAC)
- User permissions system

### Network Security

- Network policies restrict pod-to-pod communication
- TLS encryption for external traffic
- Internal service communication over secure channels

### Secrets Management

Sensitive data is stored in Kubernetes secrets:
```bash
# View secrets
kubectl get secrets -n warehouse

# Update database password
kubectl create secret generic warehouse-secrets \
  --from-literal=mongodb-uri="mongodb://user:newpassword@mongodb-service:27017/warehouse" \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Security Best Practices

1. **Change Default Passwords**
   ```bash
   # Update admin user password
   kubectl exec -it deploy/dashboard-api -n warehouse -- /app/admin-cli change-password admin
   ```

2. **Enable TLS**
   - Configure cert-manager for automatic certificate management
   - Update ingress with TLS termination

3. **Regular Updates**
   - Keep container images updated
   - Apply security patches regularly

## Troubleshooting

### Common Issues

1. **Pods Stuck in Pending State**
   ```bash
   kubectl describe pod <pod-name> -n warehouse
   # Check resource constraints and node capacity
   ```

2. **Database Connection Failures**
   ```bash
   kubectl logs -l app=mongodb -n warehouse
   kubectl get svc mongodb-service -n warehouse
   ```

3. **High Memory Usage**
   ```bash
   kubectl top pods -n warehouse
   kubectl describe hpa -n warehouse
   ```

4. **Service Discovery Issues**
   ```bash
   kubectl get svc -n warehouse
   kubectl get endpoints -n warehouse
   ```

### Debug Commands

```bash
# Check pod status
kubectl get pods -n warehouse -o wide

# View pod logs
kubectl logs <pod-name> -n warehouse --follow

# Execute into pod
kubectl exec -it <pod-name> -n warehouse -- /bin/bash

# Check service endpoints
kubectl get endpoints -n warehouse

# View events
kubectl get events -n warehouse --sort-by=.metadata.creationTimestamp
```

### Performance Tuning

1. **Database Optimization**
   - Monitor MongoDB performance
   - Optimize query patterns
   - Configure appropriate indexes

2. **Kafka Tuning**
   - Adjust partition counts
   - Configure retention policies
   - Monitor consumer lag

3. **Elasticsearch Optimization**
   - Configure shard settings
   - Monitor cluster health
   - Optimize mapping configurations

### Backup and Recovery

1. **Database Backup**
   ```bash
   kubectl exec -it deploy/mongodb -n warehouse -- mongodump --out /backup/
   ```

2. **Configuration Backup**
   ```bash
   kubectl get all -n warehouse -o yaml > warehouse-backup.yaml
   ```

3. **Persistent Volume Backup**
   - Configure volume snapshots
   - Regular backup schedule
   - Test restore procedures

## Maintenance

### Regular Tasks

1. **Monitor Resource Usage**
   - CPU and memory utilization
   - Storage capacity
   - Network bandwidth

2. **Update Dependencies**
   - Container image updates
   - Kubernetes version upgrades
   - Security patches

3. **Performance Review**
   - API response times
   - Database query performance
   - System throughput metrics

### Scaling Guidelines

1. **Horizontal Scaling**
   - API services auto-scale based on load
   - Database read replicas for read-heavy workloads
   - Kafka partitions for high throughput

2. **Vertical Scaling**
   - Increase resource limits for intensive workloads
   - Monitor and adjust based on usage patterns

3. **Storage Scaling**
   - Expand persistent volumes as needed
   - Archive old data to reduce storage costs

## Support

For deployment issues or questions:
1. Check this documentation
2. Review system logs
3. Consult Kubernetes documentation
4. Contact system administrator

---

**Note**: Always test deployment procedures in a staging environment before applying to production.