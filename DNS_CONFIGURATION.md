# DNS Configuration Guide for temitayocharles.online

## Overview
This guide provides the DNS records needed to configure your Virtual Vacation application on Cloudflare.

## Required DNS Records

### 1. Main Application (temitayocharles.online)
```
Type: A
Name: @
Value: YOUR_SERVER_PUBLIC_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 2. API Subdomain (api.temitayocharles.online)
```
Type: A
Name: api
Value: YOUR_SERVER_PUBLIC_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 3. Grafana Monitoring (grafana.temitayocharles.online)
```
Type: A
Name: grafana
Value: YOUR_SERVER_PUBLIC_IP
TTL: Auto
Proxy status: Proxied (orange cloud)
```

### 4. Prometheus Monitoring (prometheus.temitayocharles.online) - Optional
```
Type: A
Name: prometheus
Value: YOUR_SERVER_PUBLIC_IP
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

## Immediate Action Plan

Since you want to update DNS records now and deploy later, here's what to do:

### Step 1: Determine Your IP Strategy
Based on your planned cluster setup, decide which IP you'll use:

- **If using cloud provider**: You'll get the IP after cluster creation
- **If using local/VPS**: Use your current public IP as a temporary measure
- **If using on-premise**: Use your network's public IP

### Step 2: Get Your Current Public IP (Temporary)
```bash
# Run this on the machine that will host your cluster:
curl -4 ifconfig.me
# or
curl -4 icanhazip.com
```

### Step 3: Update Cloudflare DNS Records
1. Go to your Cloudflare dashboard
2. Navigate to DNS → Records
3. **Edit the existing A record** for `@` (root domain)
4. Change the value from "temitayocharles.online" to your public IP
5. **Add new A records** for subdomains:
   - `api` → same IP
   - `grafana` → same IP
   - `prometheus` → same IP (optional)

### Step 4: Prepare for Deployment
Once your cluster is ready:
1. If the IP changes, update DNS records again
2. Run `./deploy.sh` to deploy
3. Test all endpoints

### Important Notes
- DNS changes may take 5-30 minutes to propagate
- Keep all records proxied (orange cloud) for Cloudflare benefits
- SSL certificates will be handled by cert-manager in your cluster

## Deployment Scenarios & IP Configuration

### Scenario 1: Cloud Provider (AWS EKS, GCP GKE, Azure AKS)
**When to use**: You're deploying to a managed Kubernetes service
**IP to use**: Load balancer IP (assigned after deployment)
**Steps**:
1. Deploy your cluster first
2. Get the load balancer external IP: `kubectl get svc -n ingress-nginx`
3. Update DNS records with this IP
4. The IP will be something like: `34.102.136.180` or `a1b2c3d4e5f6g7.cloudfront.net`

### Scenario 2: Local Development Cluster (kind, minikube, k3s)
**When to use**: Testing locally or small-scale deployment
**IP to use**: Your local machine's public IP
**Steps**:
1. Get your public IP: `curl -4 ifconfig.me`
2. Update DNS records with this IP
3. Set up port forwarding: `kubectl port-forward svc/ingress-nginx 80:80 443:443`
4. Your IP will be something like: `203.0.113.1`

### Scenario 3: VPS/Dedicated Server
**When to use**: Single server deployment
**IP to use**: Your server's public IP
**Steps**:
1. Your hosting provider gives you a static IP
2. Update DNS records with this IP
3. Install Kubernetes or run Docker directly
4. Your IP will be something like: `192.168.1.100` (but public)

### Scenario 4: Self-hosted Cluster (on-premise)
**When to use**: Private data center or home lab
**IP to use**: Your network's public IP
**Steps**:
1. Configure your router/firewall for port forwarding
2. Get your public IP: `curl -4 ifconfig.me`
3. Ensure ports 80/443 are forwarded to your cluster
4. Update DNS records with this IP

## Current Status & Next Steps

### What You Currently Have
You have a DNS A record for `temitayocharles.online` that points to `temitayocharles.online` (circular reference). This needs to be updated to point to your actual server/cluster IP address.

### What You Need to Do

1. **Choose Your Deployment Method**
   - **Cloud Provider (AWS/GCP/Azure)**: Use the load balancer IP you'll get after deployment
   - **Local Cluster (kind/minikube/k3s)**: Use your local machine's public IP
   - **VPS/Dedicated Server**: Use your server's public IP

2. **Update the Root Domain Record**
   - In Cloudflare DNS settings
   - Change the A record for `@` from "temitayocharles.online" to your cluster/server IP
   - Keep it proxied (orange cloud)

3. **Add Subdomain Records**
   - Add A records for `api`, `grafana`, and `prometheus` (optional)
   - All pointing to the same IP address
   - All proxied through Cloudflare

4. **Deploy and Test**
   - Run `./deploy.sh` to deploy your application
   - Test all endpoints after DNS propagation

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
