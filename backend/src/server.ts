import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { connectDB } from './config/database'
import { connectRedis } from './config/redis'
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
    },
  },
}))
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}))
app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(limiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  })
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
