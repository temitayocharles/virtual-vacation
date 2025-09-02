# DNS Configuration Guide for temitayocharles.online

## Overview
This guide provides the DNS records needed to configure your Virtual Vacation application on Cloudflare.

## Required DNS Records

### 1. Main Application (temitayocharles.online)
```
Type: A
Name: @
Value: YOUR_LOAD_BALANCER_IP_OR_KUBERNETES_EXTERNAL_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 2. API Subdomain (api.temitayocharles.online)
```
Type: A
Name: api
Value: YOUR_LOAD_BALANCER_IP_OR_KUBERNETES_EXTERNAL_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 3. Grafana Monitoring (grafana.temitayocharles.online)
```
Type: A
Name: grafana
Value: YOUR_LOAD_BALANCER_IP_OR_KUBERNETES_EXTERNAL_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 4. Prometheus Monitoring (prometheus.temitayocharles.online) - Optional
```
Type: A
Name: prometheus
Value: YOUR_LOAD_BALANCER_IP_OR_KUBERNETES_EXTERNAL_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

## Cloudflare SSL/TLS Settings

### SSL/TLS Encryption Mode
- Set to: **Full (strict)**

### Edge Certificates
- Ensure SSL certificates are enabled
- Use Cloudflare's Universal SSL

### Always Use HTTPS
- Enable: **Always Use HTTPS**

## Steps to Configure

1. **Log into Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Select your temitayocharles.online domain

2. **Add DNS Records**
   - Go to DNS → Records
   - Add each record as specified above
   - Replace `YOUR_LOAD_BALANCER_IP_OR_KUBERNETES_EXTERNAL_IP` with your actual IP

3. **Configure SSL**
   - Go to SSL/TLS → Overview
   - Set encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"

4. **Verify Configuration**
   - Wait for DNS propagation (5-30 minutes)
   - Test each subdomain: https://temitayocharles.online, https://api.temitayocharles.online, etc.

## Getting Your Load Balancer IP

After deploying to Kubernetes, get your external IP:

```bash
# Get the external IP of your ingress
kubectl get svc -n ingress-nginx

# Or get ingress details
kubectl get ingress -n virtual-vacation
```

## Troubleshooting

### DNS Not Propagating
- Check DNS records in Cloudflare dashboard
- Use tools like `dig` or `nslookup` to verify propagation
- Wait up to 24 hours for full propagation

### SSL Certificate Issues
- Ensure Cloudflare SSL is enabled
- Check SSL/TLS settings
- Verify cert-manager is installed in Kubernetes

### Connection Refused
- Verify Kubernetes services are running
- Check ingress configuration
- Ensure firewall allows traffic on ports 80/443
