# Virtual Vacation Application
## Comprehensive Travel Experience Platform

A production-ready Docker Compose application providing immersive virtual travel experiences with 360° content, AI-powered recommendations, and real-time destination exploration.

## 🌟 Key Features

### Immersive Travel Experience
- **360° Virtual Tours**: High-quality 360-degree video content of popular destinations
- **Interactive Street View**: Google Street View integration for real-time exploration
- **Ambient Audio**: Authentic soundscapes from destinations worldwide
- **Weather Integration**: Real-time weather data for authentic atmosphere

### AI-Powered Recommendations
- **Machine Learning Engine**: Content-based filtering with user preference learning
- **Personalized Suggestions**: Tailored destination recommendations
- **Trending Destinations**: Real-time popularity tracking and trending analysis
- **User Feedback Integration**: Continuous learning from user interactions

### Real-Time Features
- **Live Radio Streams**: Local radio stations from around the world
- **Interactive Maps**: Google Maps integration with custom markers
- **Weather Overlays**: Current conditions and forecasts
- **Social Features**: Save favorites, share experiences

### Production-Ready Architecture
- **Microservices Design**: Scalable service-oriented architecture
- **Container Orchestration**: Docker Compose with health checks
- **Monitoring & Observability**: Prometheus metrics + Grafana dashboards
- **Security**: HashiCorp Vault for secrets management, TLS encryption
- **Caching**: Redis for performance optimization

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   React Frontend│    │  Node.js Backend │    │ FastAPI Media  │
│   (Port 3000)   │◄──►│   (Port 5000)    │◄──►│ Gateway (8001) │
└─────────────────┘    └──────────────────┘    └────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX Reverse Proxy (80/443)                 │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   AI Engine     │    │    MongoDB       │    │     Redis      │
│   (Port 8002)   │    │   (Port 27017)   │    │  (Port 6379)   │
└─────────────────┘    └──────────────────┘    └────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│  HashiCorp      │    │   Prometheus     │    │    Grafana     │
│  Vault (8200)   │    │   (Port 9090)    │    │  (Port 3001)   │
└─────────────────┘    └──────────────────┘    └────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Google Maps API key (free tier: 28,000 requests/month)
- OpenWeatherMap API key (free tier: 1,000 requests/day)

### API Keys Setup
Create a `.env` file in the project root:

```bash
# Google APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Weather API
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Application Settings
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://mongodb:27017/virtual_vacation
REDIS_URL=redis://redis:6379

# Production Settings
NODE_ENV=production
API_BASE_URL=http://localhost:5000
```

### Launch Application
```bash
# Make the startup script executable
chmod +x start.sh

# Start the entire stack
./start.sh

# Or manually with Docker Compose
docker-compose up -d
```

### Access Points
- **Main Application**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Monitoring Dashboard**: http://localhost:3001 (admin/admin)
- **Metrics**: http://localhost:9090
- **Vault UI**: http://localhost:8200

## API Resources Used (All Free/Legal)

1. **Google Maps Platform** (Free tier: 28,000 map loads/month)
2. **OpenWeatherMap** (Free tier: 1000 calls/day)
3. **REST Countries API** (Completely free)
4. **Radio Garden** (Free radio streaming)
5. **Freesound.org** (Free ambient sounds with attribution)
6. **OpenStreetMap** (Free map data)
7. **Wikimedia Commons** (Free images)
8. **BBC Sounds** (Public radio streams)

## Legal Compliance

- All APIs used are free tier or completely free
- Proper attribution for all resources
- No copyrighted content used without permission
- Privacy-compliant data handling
- GDPR-ready user data management

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

See `.env.example` for required API keys and configuration.
