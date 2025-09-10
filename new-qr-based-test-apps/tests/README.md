# Testing Framework for Warehouse Management System

This directory contains comprehensive testing suites for the Export-Import & Warehouse Management System.

## Test Structure

```
tests/
├── unit/                     # Unit tests for individual components
├── integration/              # Integration tests for service interactions
├── e2e/                      # End-to-end tests for complete workflows
├── performance/              # Performance and load testing
└── README.md                # This file
```

## Prerequisites

### For Go Backend Tests
```bash
# Install testing dependencies
go get github.com/stretchr/testify/assert
go get github.com/gin-gonic/gin
```

### For JavaScript/Node.js Tests
```bash
# Install testing dependencies
npm install -g jest supertest axios puppeteer artillery
```

### For Mobile App Tests (Flutter)
```bash
# Flutter test dependencies are included in pubspec.yaml
flutter test
```

## Running Tests

### Unit Tests

**Backend (Go)**:
```bash
# Run all Go unit tests
cd services/dashboard-api && go test ./...
cd services/barcode-service && go test ./...
cd services/scanner-api && go test ./...

# Run specific test file
go test tests/unit/dashboard_api_test.go
```

**Frontend (React)**:
```bash
# Run React component tests
cd dashboard-frontend && npm test
```

**Mobile (Flutter)**:
```bash
# Run Flutter unit tests
cd mobile-scanner && flutter test
```

### Integration Tests

```bash
# Ensure all services are running
docker-compose up -d

# Run integration tests
cd tests/integration
jest system_integration_test.js
```

### End-to-End Tests

```bash
# Start the complete system
docker-compose up -d

# Run E2E tests with Puppeteer
cd tests/e2e
jest dashboard_e2e_test.js

# For headless mode (CI/CD)
jest dashboard_e2e_test.js --headless
```

### Performance Tests

```bash
# Install Artillery globally
npm install -g artillery

# Run load tests
cd tests/performance
artillery run load_test.js

# Generate detailed report
artillery run load_test.js --output report.json
artillery report report.json
```

## Test Scenarios

### Unit Tests Cover:
- ✅ API endpoint functionality
- ✅ Data model validation
- ✅ Business logic calculations
- ✅ Utility functions
- ✅ Error handling

### Integration Tests Cover:
- ✅ Service-to-service communication
- ✅ Database operations
- ✅ Authentication flows
- ✅ Kafka messaging
- ✅ API contract validation

### E2E Tests Cover:
- ✅ Complete user workflows
- ✅ Frontend-backend integration
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness
- ✅ Error scenarios

### Performance Tests Cover:
- ✅ Load testing (120+ TPS target)
- ✅ Stress testing
- ✅ Endurance testing
- ✅ Spike testing
- ✅ Resource monitoring

## Test Data

### Mock Data for Testing:
```json
{
  "testUser": {
    "username": "admin",
    "password": "admin",
    "role": "admin"
  },
  "testItem": {
    "itemId": "ITM-2024-001",
    "name": "Test Item",
    "category": "Electronics",
    "barcode": "1234567890123"
  }
}
```

## Continuous Integration

### GitHub Actions Example:
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e
```

## Coverage Reports

Generate test coverage reports:

```bash
# Go coverage
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# JavaScript coverage
jest --coverage

# Flutter coverage
flutter test --coverage
```

## Test Environment Configuration

### Environment Variables:
```bash
export TEST_MODE=true
export API_BASE_URL=http://localhost:8001
export BARCODE_SERVICE_URL=http://localhost:8002
export SCANNER_API_URL=http://localhost:8003
export TEST_DATABASE_URL=mongodb://localhost:27017/warehouse_test_db
```

## Performance Benchmarks

### Target Performance Metrics:
- **API Response Time**: < 200ms (95th percentile)
- **Throughput**: 120+ TPS sustained
- **Database Query Time**: < 50ms average
- **Frontend Load Time**: < 3 seconds
- **Mobile App Startup**: < 2 seconds

### Load Test Scenarios:
1. **Normal Load**: 10 concurrent users
2. **Peak Load**: 25 concurrent users
3. **Stress Test**: 50+ concurrent users
4. **Endurance**: 2+ hours sustained load

## Debugging Tests

### Common Issues:
1. **Services not running**: Ensure `docker-compose up -d`
2. **Port conflicts**: Check if ports 3000, 8001-8003 are available
3. **Database connection**: Verify MongoDB is accessible
4. **Network timeouts**: Increase timeout values for slow systems

### Debug Commands:
```bash
# Check service health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health

# View service logs
docker-compose logs -f dashboard-api
docker-compose logs -f barcode-service
docker-compose logs -f scanner-api
```

## Test Automation

### Automated Test Execution:
```bash
# Run complete test suite
make test

# Run specific test categories
make test-unit
make test-integration
make test-e2e
make test-performance
```

### Scheduled Testing:
- **Nightly**: Full test suite execution
- **Pre-deploy**: Integration and E2E tests
- **Monitoring**: Continuous performance testing

## Contributing to Tests

### Guidelines:
1. Write tests for all new features
2. Maintain minimum 80% code coverage
3. Include both positive and negative test cases
4. Use descriptive test names
5. Keep tests independent and isolated
6. Mock external dependencies
7. Update tests when changing functionality

### Test Review Checklist:
- [ ] Test covers the functionality completely
- [ ] Test is independent and can run in isolation
- [ ] Test data is properly mocked
- [ ] Test includes error scenarios
- [ ] Test follows naming conventions
- [ ] Test is properly documented