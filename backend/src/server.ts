import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { connectDB, getDB } from './config/database'
import { connectRedis, getRedis } from './config/redis'
import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

// Routes
import countriesRouter from './routes/countries'
import citiesRouter from './routes/cities'
import weatherRouter from './routes/weather'
import streetViewRouter from './routes/streetview'
import radioRouter from './routes/radio'
import soundsRouter from './routes/sounds'
import favoritesRouter from './routes/favorites'

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 5000

// Rate limiting - PRODUCTION HARDENED
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Reduced from 1000 for production security
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Add IP whitelist for internal services
  skip: (req) => {
    const clientIP = req.ip || req.connection?.remoteAddress
    return clientIP === '127.0.0.1' || clientIP === '::1' || req.headers['x-forwarded-for'] === '127.0.0.1'
  },
  // Add request logging for rate limit hits
  onLimitReached: (req) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`)
  }
})

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https:", "wss:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" },
  crossOriginEmbedderPolicy: false, // Enable if needed for embedding
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://temitayocharles.online",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}))
app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Custom verification logic for request size
    if (buf.length > 10 * 1024 * 1024) { // 10MB
      const error = new Error('Request too large')
        ; (error as any).status = 413
      throw error
    }
  }
}))
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}))
app.use(limiter)

// Health check endpoint - PRODUCTION ENHANCED
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown',
      disk: 'unknown'
    }
  }

  try {
    // Check database connection
    const db = getDB()
    await db.query('SELECT 1')
    healthCheck.services.database = 'healthy'
  } catch (error) {
    healthCheck.services.database = 'unhealthy'
    healthCheck.status = 'degraded'
  }

  try {
    // Check Redis connection
    const redis = getRedis()
    await redis.ping()
    healthCheck.services.redis = 'healthy'
  } catch (error) {
    healthCheck.services.redis = 'unhealthy'
    healthCheck.status = 'degraded'
  }

  // Check memory usage
  const memUsage = process.memoryUsage()
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
  healthCheck.services.memory = memUsagePercent > 90 ? 'critical' : memUsagePercent > 75 ? 'warning' : 'healthy'

  // Check disk space (simplified)
  healthCheck.services.disk = 'healthy' // Would need actual disk check in production

  // Set status based on service health
  const unhealthyServices = Object.values(healthCheck.services).filter(status => status !== 'healthy')
  if (unhealthyServices.length > 0) {
    healthCheck.status = unhealthyServices.includes('critical') ? 'critical' : 'degraded'
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : healthCheck.status === 'degraded' ? 207 : 503
  res.status(statusCode).json(healthCheck)
})

// API Routes
app.use('/api/countries', countriesRouter)
app.use('/api/cities', citiesRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/streetview', streetViewRouter)
app.use('/api/radio', radioRouter)
app.use('/api/sounds', soundsRouter)
app.use('/api/favorites', favoritesRouter)

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`)

  socket.on('join-location', (locationId: string) => {
    socket.join(`location-${locationId}`)
    logger.info(`User ${socket.id} joined location ${locationId}`)
  })

  socket.on('leave-location', (locationId: string) => {
    socket.leave(`location-${locationId}`)
    logger.info(`User ${socket.id} left location ${locationId}`)
  })

  socket.on('update-position', (data: { locationId: string, lat: number, lng: number }) => {
    socket.to(`location-${data.locationId}`).emit('user-position-update', {
      userId: socket.id,
      lat: data.lat,
      lng: data.lng
    })
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDB()
    await connectRedis()

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🌐 API URL: http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...')
  server.close(() => {
    logger.info('Process terminated')
    process.exit(0)
  })
})

startServer()

export { app, io }
