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

## Immediate Action Plan (Kind Cluster Setup)

Since you're using a **local kind cluster**, here's your specific setup:

### Step 1: Get Your Local Public IP
```bash
# Run this command to get your public IP:
curl -4 ifconfig.me
# or
curl -4 icanhazip.com

# Save this IP address - you'll need it for DNS
```

### Step 2: Update Cloudflare DNS Records
1. Go to your Cloudflare dashboard
2. Navigate to DNS → Records
3. **Edit the existing A record** for `@` (root domain)
4. Change the value from "temitayocharles.online" to your public IP
5. **Add new A records** for subdomains:
   - `api` → same public IP
   - `grafana` → same public IP
   - `prometheus` → same public IP (optional)
6. Keep all records **proxied** (orange cloud)

### Step 3: Prepare Local Port Forwarding
After deploying to kind, you'll need to set up port forwarding:

```bash
# Forward ports from your local machine to the kind cluster
kubectl port-forward svc/ingress-nginx-controller 80:80 443:443 -n ingress-nginx

# Or use this for background forwarding:
kubectl port-forward svc/ingress-nginx-controller 80:80 443:443 -n ingress-nginx &
```

### Step 4: Deploy Your Application
```bash
# Once DNS is updated and kind cluster is ready:
./deploy.sh
```

### Important Notes for Kind Clusters
- **Port Forwarding Required**: Your local machine must forward ports 80/443 to the kind cluster
- **Router Configuration**: Configure your router to forward external ports 80/443 to your local machine
- **Static IP Preferred**: Consider getting a static IP from your ISP for stability
- **Firewall Settings**: Ensure your firewall allows incoming traffic on ports 80/443
- **Testing**: Test connectivity with: `curl -I https://temitayocharles.online`

## Kind Cluster Setup Checklist

### Before DNS Configuration
- [ ] Install kind: `brew install kind` (macOS) or `choco install kind` (Windows)
- [ ] Install kubectl: `brew install kubectl` (macOS)
- [ ] Create kind cluster: `kind create cluster --name virtual-vacation`

### DNS & Network Setup
- [ ] Get your public IP: `curl -4 ifconfig.me`
- [ ] Update Cloudflare DNS records with your public IP
- [ ] Configure router port forwarding (80/443 → your local machine)
- [ ] Test DNS propagation: `nslookup temitayocharles.online`

### Deployment Steps
- [ ] Deploy ingress-nginx: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml`
- [ ] Run deployment script: `./deploy.sh`
- [ ] Set up port forwarding: `kubectl port-forward svc/ingress-nginx 80:80 443:443 -n ingress-nginx`
- [ ] Test application: `curl https://temitayocharles.online`

### Troubleshooting
- **Connection Issues**: Check router port forwarding and firewall settings
- **SSL Problems**: Ensure cert-manager is installed and certificates are issued
- **DNS Not Working**: Wait for propagation (up to 24 hours) or check DNS settings

## Deployment Scenarios & IP Configuration

### ⭐ Scenario 2: Local Development Cluster (kind, minikube, k3s) - RECOMMENDED FOR YOU
**When to use**: Local development and testing with kind cluster
**IP to use**: Your local machine's public IP
**Steps**:
1. Get your public IP: `curl -4 ifconfig.me`
2. Update DNS records with this IP
3. Set up port forwarding: `kubectl port-forward svc/ingress-nginx 80:80 443:443 -n ingress-nginx`
4. Your IP will be something like: `203.0.113.1`
5. **Important**: Ensure your router forwards ports 80/443 to your local machine

### Scenario 1: Cloud Provider (AWS EKS, GCP GKE, Azure AKS)
**When to use**: Production deployment to managed Kubernetes
**IP to use**: Load balancer IP (assigned after deployment)
**Steps**:
1. Deploy your cluster first
2. Get the load balancer external IP: `kubectl get svc -n ingress-nginx`
3. Update DNS records with this IP
4. The IP will be something like: `34.102.136.180`

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
