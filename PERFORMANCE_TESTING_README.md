# Virtual Vacation Performance Testing Suite

Comprehensive performance testing and production validation framework for the Virtual Vacation application.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local testing)
- k6 (optional, for advanced load testing)

### 1. Start Performance Testing Environment

```bash
# Start all services with monitoring
docker-compose -f docker-compose.perf.yml up -d

# Or start just the core services
docker-compose -f docker-compose.perf.yml up -d postgres redis backend frontend
```

### 2. Run Performance Tests

```bash
cd backend

# Quick load test
npm run test:perf:load

# Full performance test suite
npm run test:perf

# Stress test
npm run test:perf:stress

# Memory leak detection
npm run test:perf:memory

# k6 load testing
npm run test:perf:k6
```

### 3. Run Production Validation

```bash
# Full production validation
npm run validate:prod

# Specific validations
npm run validate:prod:health
npm run validate:prod:security
npm run validate:prod:performance
```

### 4. Run End-to-End Tests

```bash
# Headless E2E tests
npm run test:e2e

# Visual E2E tests
npm run test:e2e:headed
```

## 📊 Performance Test Types

### Load Testing
- **Basic Load Test**: Gradual increase in concurrent users
- **Stress Test**: Push system to breaking point
- **Spike Test**: Sudden traffic spikes
- **Endurance Test**: Long-running stability test

### Production Validation
- ✅ API Health Checks
- ✅ Database Connectivity
- ✅ Redis Cache Functionality
- ✅ External API Integration
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Response Times
- ✅ Resource Usage
- ✅ Environment Configuration

### End-to-End Testing
- ✅ Frontend Loading
- ✅ API Integration
- ✅ User Interactions
- ✅ Error Handling
- ✅ Responsive Design
- ✅ Network Failure Handling

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Load Testers  │    │   Application   │
│                 │    │                 │
│ • Artillery     │◄──►│ • Backend API   │
│ • k6           │    │ • Frontend       │
│ • Custom Tests │    │ • PostgreSQL     │
│                 │    │ • Redis Cache   │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   Validation    │
│                 │    │                 │
│ • Prometheus    │    │ • Health Checks │
│ • Grafana       │    │ • Security      │
│ • Custom Metrics│    │ • Performance   │
└─────────────────┘    └─────────────────┘
```

## 📈 Monitoring & Metrics

### Access Monitoring Dashboards

- **Grafana**: http://localhost:3002 (admin/admin)
- **Prometheus**: http://localhost:9090

### Key Metrics Monitored

- **Response Times**: P50, P95, P99 percentiles
- **Error Rates**: HTTP status codes, application errors
- **Resource Usage**: CPU, Memory, Disk I/O
- **Database Performance**: Query times, connection pools
- **Cache Hit Rates**: Redis performance metrics

## 🧪 Test Scenarios

### Cities API Load Test
```javascript
// Tests pagination, search, and filtering
GET /api/cities?limit=20&page=1
GET /api/cities/search?q=new+york
GET /api/cities/country/US
```

### Weather API Load Test
```javascript
// Tests external API integration and caching
GET /api/weather/current?lat=40.7128&lon=-74.0060
GET /api/weather/forecast?lat=40.7128&lon=-74.0060
```

### Street View API Load Test
```javascript
// Tests Google Maps integration
GET /api/streetview/check?lat=40.7128&lon=-74.0060
GET /api/streetview/image-url?lat=40.7128&lon=-74.0060
```

## 📋 Performance Benchmarks

### Target Performance Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| Response Time (P95) | <1000ms | <2000ms |
| Error Rate | <1% | <5% |
| CPU Usage | <70% | <90% |
| Memory Usage | <80% | <95% |
| Concurrent Users | 100+ | 50+ |

### Load Test Scenarios

1. **Warm-up Phase**: 1-10 users (1 minute)
2. **Normal Load**: 10-50 users (2 minutes)
3. **High Load**: 50-100 users (2 minutes)
4. **Stress Test**: 100-200 users (1 minute)
5. **Recovery**: Back to normal (1 minute)

## 🔧 Configuration

### Environment Variables

```bash
# Performance Testing
BASE_URL=http://localhost:5002
FRONTEND_URL=http://localhost:3001

# Load Test Parameters
LOAD_TEST_DURATION=300
LOAD_TEST_USERS=50
LOAD_TEST_RAMP_UP=60

# Monitoring
PROMETHEUS_URL=http://localhost:9090
GRAFANA_URL=http://localhost:3002
```

### Custom Test Configuration

Create `src/test/load-test.yml` for Artillery:

```yaml
config:
  target: 'http://localhost:5002'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
  defaults:
    headers:
      User-Agent: 'Virtual Vacation Load Test'

scenarios:
  - name: 'Cities API Test'
    weight: 40
    flow:
      - get:
          url: '/api/cities?limit=20'
      - get:
          url: '/api/cities/search?q=new+york'

  - name: 'Weather API Test'
    weight: 30
    flow:
      - get:
          url: '/api/weather/current?lat=40.7128&lon=-74.0060'
```

## 📊 Results & Reporting

### Performance Test Results

Results are saved to `backend/performance-results/`:

- `performance-report.json` - Comprehensive test summary
- `k6-summary.json` - k6 detailed metrics
- `memory-leak-report.json` - Memory analysis
- `artillery-results.json` - Artillery test data

### Production Validation Report

Generated as `production-validation-report.json`:

```json
{
  "timestamp": "2025-09-02T09:44:58.975Z",
  "environment": "production",
  "summary": {
    "total": 12,
    "passed": 11,
    "failed": 1,
    "warnings": 0
  },
  "checks": [...],
  "recommendations": [...]
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.perf.yml logs postgres

   # Restart database
   docker-compose -f docker-compose.perf.yml restart postgres
   ```

2. **High Memory Usage**
   ```bash
   # Monitor memory
   docker stats

   # Adjust memory limits in docker-compose.perf.yml
   ```

3. **Slow Response Times**
   ```bash
   # Check application logs
   docker-compose -f docker-compose.perf.yml logs backend

   # Profile with clinic.js
   npm install -g clinic
   clinic doctor -- node dist/server.js
   ```

### Performance Optimization Tips

1. **Database Optimization**
   - Add proper indexes
   - Optimize queries
   - Use connection pooling

2. **Cache Optimization**
   - Implement Redis caching
   - Set appropriate TTL values
   - Monitor cache hit rates

3. **API Optimization**
   - Implement response compression
   - Use pagination for large datasets
   - Implement rate limiting

## 📚 Additional Resources

- [Artillery Documentation](https://artillery.io/docs/)
- [k6 Documentation](https://k6.io/docs/)
- [Playwright Documentation](https://playwright.dev/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add performance tests for new features
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
