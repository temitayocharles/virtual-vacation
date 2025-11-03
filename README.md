# Virtual Vacation - Production Kubernetes Deployment

## 🌍 Enterprise-Grade Virtual Travel Platform

A production-ready, highly immersive virtual vacation application deployed on Kubernetes with enterprise-grade security, monitoring, and scalability features.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Security Features](#security-features)
- [Monitoring & Observability](#monitoring--observability)
- [Scaling & Performance](#scaling--performance)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)
- [API Documentation](#api-documentation)

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   React Frontend│    │  Node.js Backend │    │   PostgreSQL   │
│   (Port 3000)   │◄──►│   (Port 5000)    │◄──►│   Database     │
│   3 Replicas    │    │   3 Replicas     │    │                │
└─────────────────┘    └──────────────────┘    └────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX Reverse Proxy                      │
│                    (Port 80/443)                           │
│                    2 Replicas                              │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│     Redis       │    │   Prometheus     │    │    Grafana     │
│   Cache (6379)  │    │  Monitoring      │    │  Dashboards    │
│                 │    │   (Port 9090)    │    │  (Port 3000)   │
└─────────────────┘    └──────────────────┘    └────────────────┘
```

## � Prerequisites

### Required Tools
- **kubectl** (v1.25+)
- **Kubernetes cluster** (v1.25+)
- **Helm** (v3.10+) - for additional tools
- **Docker** (for building images)

### Cluster Requirements
- **Storage Class**: Default storage class configured
- **Ingress Controller**: NGINX Ingress Controller installed
- **Cert Manager**: For SSL certificates (optional)
- **RBAC**: Enabled for security

### Network Requirements
- **Domain**: temitayocharles.online configured
- **SSL Certificate**: Let's Encrypt or custom
- **Load Balancer**: For external access

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/temitayocharles/virtual-vacation.git
cd virtual-vacation
```

### 2. Configure DNS (Cloudflare)
Follow the DNS configuration guide in `DNS_CONFIGURATION.md` to set up:
- temitayocharles.online (main app)
- api.temitayocharles.online (API)
- grafana.temitayocharles.online (monitoring)

### 3. Configure Environment
```bash
# Update domain and API keys in k8s/01-namespace-config.yaml
vim k8s/01-namespace-config.yaml

# Update secrets
vim k8s/01-namespace-config.yaml
```

### 3. Deploy to Kubernetes
```bash
# Deploy all components in order
kubectl apply -f k8s/01-namespace-config.yaml
kubectl apply -f k8s/02-databases.yaml
kubectl apply -f k8s/03-backend.yaml
kubectl apply -f k8s/04-frontend.yaml
kubectl apply -f k8s/05-nginx-ingress.yaml
kubectl apply -f k8s/06-monitoring.yaml

# Or deploy everything at once
kubectl apply -f k8s/
```

### 4. Access Application
```bash
# Get external IP
kubectl get ingress -n virtual-vacation

# Access URLs
echo "Main App: https://temitayocharles.online"
echo "API Docs: https://temitayocharles.online/api/docs"
echo "Grafana:  https://grafana.temitayocharles.online"
```

## ⚙️ Configuration

### Environment Variables

#### Required API Keys
```yaml
# In k8s/01-namespace-config.yaml
GOOGLE_MAPS_API_KEY: "your_google_maps_key"
OPENWEATHER_API_KEY: "your_weather_api_key"
```

#### Optional API Keys
```yaml
UNSPLASH_ACCESS_KEY: "your_unsplash_key"
FREESOUND_API_KEY: "your_freesound_key"
SKETCHFAB_API_KEY: "your_sketchfab_key"
```

### Domain Configuration
```yaml
# Current production domain: temitayocharles.online
# Update in k8s/05-nginx-ingress.yaml
spec:
  rules:
  - host: temitayocharles.online  # ← Current domain
```

### SSL Configuration
```yaml
# For production SSL
annotations:
  cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

## 🔒 Security Features

### Network Security
- ✅ **Network Policies**: Pod-to-pod communication control
- ✅ **RBAC**: Role-based access control
- ✅ **Service Accounts**: Least privilege principle
- ✅ **Security Contexts**: Non-root containers

### Application Security
- ✅ **Helmet.js**: Security headers
- ✅ **Rate Limiting**: DDoS protection
- ✅ **CORS**: Cross-origin resource sharing control
- ✅ **Input Validation**: Joi schema validation
- ✅ **JWT Authentication**: Secure token-based auth

### Infrastructure Security
- ✅ **Pod Security Standards**: Restricted security context
- ✅ **Read-only Filesystems**: Immutable containers
- ✅ **Capability Dropping**: Minimal container capabilities
- ✅ **Secret Management**: Kubernetes secrets for sensitive data

## 📊 Monitoring & Observability

### Prometheus Metrics
- ✅ **Application Metrics**: Request latency, error rates
- ✅ **System Metrics**: CPU, memory, disk usage
- ✅ **Kubernetes Metrics**: Pod status, resource usage
- ✅ **Custom Metrics**: Business-specific KPIs

### Grafana Dashboards
- ✅ **System Overview**: Cluster health dashboard
- ✅ **Application Performance**: API response times
- ✅ **Business Metrics**: User engagement, popular destinations
- ✅ **Alert Dashboard**: Active alerts and incidents

### Logging
- ✅ **Fluent Bit**: Centralized log collection
- ✅ **Structured Logging**: JSON format logs
- ✅ **Log Aggregation**: Elasticsearch integration ready
- ✅ **Log Retention**: Configurable retention policies

### Health Checks
```bash
# Check all services
kubectl get pods -n virtual-vacation

# Check specific service
kubectl logs -f deployment/backend -n virtual-vacation

# Check ingress
kubectl describe ingress virtual-vacation-ingress -n virtual-vacation
```

## ⚡ Scaling & Performance

### Horizontal Pod Autoscaling
```yaml
# Backend HPA (k8s/03-backend.yaml)
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 70
```

### Resource Limits
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "500m"
```

### Performance Optimizations
- ✅ **Connection Pooling**: Database connection reuse
- ✅ **Caching**: Redis for session and data caching
- ✅ **Compression**: Gzip compression for responses
- ✅ **CDN Ready**: Static asset optimization
- ✅ **Database Indexing**: Optimized queries

## 💾 Backup & Recovery

### Database Backup
```bash
# Manual backup
kubectl exec -n virtual-vacation postgres-0 -- pg_dump -U vacation_user virtual_vacation > backup.sql

# Automated backup (configure cron job)
kubectl create job backup-postgres --image=postgres:15-alpine -- pg_dump -h postgres-service -U vacation_user virtual_vacation
```

### Persistent Volumes
```yaml
# PVC Configuration
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
  storageClassName: "standard"
```

### Disaster Recovery
- ✅ **Multi-zone Deployment**: Regional redundancy
- ✅ **Backup Strategy**: Daily automated backups
- ✅ **Recovery Testing**: Regular DR drills
- ✅ **Data Encryption**: At-rest and in-transit

## 🔧 Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl get pods -n virtual-vacation

# Check pod logs
kubectl logs -f pod/pod-name -n virtual-vacation

# Check events
kubectl get events -n virtual-vacation --sort-by=.metadata.creationTimestamp
```

#### Service Unavailable
```bash
# Check service endpoints
kubectl get endpoints -n virtual-vacation

# Test service connectivity
kubectl run test --image=busybox --rm -it --restart=Never -- sh
```

#### Database Connection Issues
```bash
# Check database pod
kubectl exec -it postgres-0 -n virtual-vacation -- psql -U vacation_user -d virtual_vacation

# Test connection from backend
kubectl exec -it deployment/backend -n virtual-vacation -- nc -zv postgres-service 5432
```

### Performance Issues
```bash
# Check resource usage
kubectl top pods -n virtual-vacation

# Check HPA status
kubectl get hpa -n virtual-vacation

# Check Prometheus metrics
kubectl port-forward svc/prometheus-service 9090:9090 -n virtual-vacation
```

## 📚 API Documentation

### REST API Endpoints

#### Countries
```
GET    /api/countries          # List all countries
GET    /api/countries/:code    # Get country details
POST   /api/countries          # Create country (admin)
PUT    /api/countries/:code    # Update country (admin)
DELETE /api/countries/:code    # Delete country (admin)
```

#### Cities
```
GET    /api/cities             # List cities with filters
GET    /api/cities/:id         # Get city details
POST   /api/cities             # Create city (admin)
PUT    /api/cities/:id         # Update city (admin)
DELETE /api/cities/:id         # Delete city (admin)
```

#### Weather
```
GET    /api/weather/:cityId    # Get current weather
GET    /api/weather/forecast/:cityId  # Get weather forecast
```

#### User Features
```
POST   /api/auth/login         # User login
POST   /api/auth/register      # User registration
GET    /api/favorites          # Get user favorites
POST   /api/favorites          # Add to favorites
DELETE /api/favorites/:id      # Remove from favorites
```

### WebSocket Events
```javascript
// Real-time location updates
socket.on('user-position-update', (data) => {
  console.log('User moved:', data);
});

// Join location room
socket.emit('join-location', locationId);

// Update position
socket.emit('update-position', { locationId, lat, lng });
```

## 🎯 Production Checklist

### Pre-Deployment
- [ ] Domain configured and DNS propagated
- [ ] SSL certificates obtained
- [ ] API keys configured
- [ ] Storage class available
- [ ] Ingress controller installed

### Post-Deployment
- [ ] Application accessible via domain
- [ ] SSL certificate working
- [ ] Monitoring dashboards accessible
- [ ] Backup jobs configured
- [ ] Alert notifications tested

### Security Audit
- [ ] Network policies applied
- [ ] RBAC permissions verified
- [ ] Secrets properly configured
- [ ] Security headers enabled
- [ ] Rate limiting active

### Performance Testing
- [ ] Load testing completed
- [ ] Auto-scaling verified
- [ ] Database performance optimized
- [ ] CDN configured (if applicable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request
5. Wait for review and merge

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@virtualvacation.com
- 📚 Docs: https://docs.virtualvacation.com
- 🐛 Issues: GitHub Issues
- 💬 Slack: #virtual-vacation

---

**Happy Virtual Traveling!** ✈️🌍
