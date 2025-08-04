# GitHub Secrets Setup Guide for Virtual Vacation

This guide will help you set up GitHub Secrets for your Virtual Vacation application to enable secure CI/CD deployment.

## 🔐 Required GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, then add these secrets:

### Essential API Keys (Required)

```bash
# Google Maps Platform API Key
GOOGLE_MAPS_API_KEY
# Value: your_google_maps_api_key_here
# Get from: https://console.cloud.google.com/google/maps-apis

# OpenWeatherMap API Key  
OPENWEATHER_API_KEY
# Value: your_openweather_api_key_here
# Get from: https://openweathermap.org/api
```

### Security Secrets (Required)

```bash
# JWT Secret for user authentication
JWT_SECRET
# Value: generate a random 64-character string
# Example: openssl rand -hex 32

# Session Secret
SESSION_SECRET  
# Value: generate a random 64-character string
# Example: openssl rand -hex 32
```

### Optional Enhancement APIs

```bash
# Unsplash API for high-quality images
UNSPLASH_ACCESS_KEY
# Value: your_unsplash_access_key_here
# Get from: https://unsplash.com/developers

# News API for local news integration
NEWS_API_KEY
# Value: your_news_api_key_here  
# Get from: https://newsapi.org/

# Mapbox API for additional map styles
MAPBOX_ACCESS_TOKEN
# Value: your_mapbox_token_here
# Get from: https://account.mapbox.com/

# Freesound.org API for ambient sounds
FREESOUND_API_KEY
# Value: your_freesound_api_key_here
# Get from: https://freesound.org/apiv2/
```

### Analytics & Monitoring (Optional)

```bash
# Google Analytics tracking ID
GA_TRACKING_ID
# Value: G-XXXXXXXXXX
# Get from: https://analytics.google.com/

# Sentry DSN for error tracking
SENTRY_DSN
# Value: your_sentry_dsn_here
# Get from: https://sentry.io/
```

### Deployment & Notifications (Optional)

```bash
# Slack webhook for deployment notifications
SLACK_WEBHOOK_URL
# Value: your_slack_webhook_url_here
# Get from: Slack App settings
```

## 🚀 Quick Setup Script

You can use this script to quickly set up your environment:

```bash
#!/bin/bash
# setup-secrets.sh - Run this locally to generate secure secrets

echo "=== Virtual Vacation Secrets Generator ==="
echo ""

# Generate secure random secrets
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

echo "Generated secure secrets:"
echo "JWT_SECRET=$JWT_SECRET"
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""

echo "Add these to your GitHub Secrets:"
echo ""
echo "1. Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret with the corresponding value"
echo ""

# Create local .env file template
cat > .env << EOF
# Generated secrets for local development
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET

# Add your API keys below:
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional APIs
VITE_UNSPLASH_ACCESS_KEY=
VITE_NEWS_API_KEY=
VITE_MAPBOX_ACCESS_TOKEN=
FREESOUND_API_KEY=

# Analytics (optional)
VITE_GA_TRACKING_ID=
VITE_SENTRY_DSN=
EOF

echo "Created .env file with generated secrets."
echo "Remember to add your API keys to the .env file!"
echo ""
echo "⚠️  IMPORTANT: Never commit the .env file to version control!"
```

## 📋 Step-by-Step Setup

### 1. Get Free API Keys

#### Google Maps Platform (Essential)
1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Street View Static API  
   - Places API (optional)
4. Create credentials → API Key
5. Restrict the key to your domains for security

#### OpenWeatherMap (Essential)
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 1,000 calls/day

### 2. Add Secrets to GitHub

1. Navigate to your repository on GitHub
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with its corresponding value

### 3. Verify CI/CD Pipeline

After adding secrets, your GitHub Actions workflow will:
- ✅ Build frontend with API keys baked in
- ✅ Run security scans
- ✅ Deploy to staging/production
- ✅ Send notifications

### 4. Local Development Setup

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/virtual-vacation.git
cd virtual-vacation

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Start the application
docker-compose up -d
```

## 🔒 Security Best Practices

### Environment-Specific Secrets

Create separate secrets for different environments:

```bash
# Development
GOOGLE_MAPS_API_KEY_DEV
OPENWEATHER_API_KEY_DEV

# Staging  
GOOGLE_MAPS_API_KEY_STAGING
OPENWEATHER_API_KEY_STAGING

# Production
GOOGLE_MAPS_API_KEY_PROD
OPENWEATHER_API_KEY_PROD
```

### API Key Security

1. **Restrict API Keys**: Limit by domain, IP, or referrer
2. **Monitor Usage**: Set up billing alerts
3. **Rotate Keys**: Change keys periodically
4. **Use Environment Variables**: Never hardcode keys

### Deployment Security

```yaml
# In your GitHub Actions workflow
build-args: |
  VITE_GOOGLE_MAPS_API_KEY=${{ secrets.GOOGLE_MAPS_API_KEY }}
  VITE_OPENWEATHER_API_KEY=${{ secrets.OPENWEATHER_API_KEY }}
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check key restrictions
   - Verify enabled APIs
   - Check billing account

2. **Secrets Not Loading**
   - Verify secret names match exactly
   - Check environment context in workflow
   - Ensure secrets are added to correct repository

3. **Build Failures**
   - Check Docker build args syntax
   - Verify all required secrets are present
   - Check workflow permissions

### Debug Commands

```bash
# Test API keys locally
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY"

# Check environment variables in container
docker-compose exec frontend env | grep VITE_

# Verify secrets in GitHub Actions (logs will show [MASKED])
echo "API key: ${{ secrets.GOOGLE_MAPS_API_KEY }}"
```

## 📊 Cost Monitoring

### Free Tier Limits

- **Google Maps**: 28,000 map loads/month
- **OpenWeatherMap**: 1,000 calls/day  
- **Unsplash**: 50 requests/hour
- **News API**: 1,000 requests/day

### Set up Billing Alerts

1. Google Cloud Console → Billing → Budgets & Alerts
2. Create alert at 80% of free tier
3. Add notification email/webhook

## ✅ Verification Checklist

- [ ] All required secrets added to GitHub
- [ ] API keys tested and working
- [ ] Local .env file configured
- [ ] CI/CD pipeline passing
- [ ] Security restrictions applied to API keys
- [ ] Billing alerts configured
- [ ] Documentation updated with any custom secrets

Your Virtual Vacation application is now ready for secure, automated deployment! 🚀
