import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import { errorHandler } from '../middleware/errorHandler'
import { notFound } from '../middleware/notFound'

// Routes
import countriesRouter from '../routes/countries'
import citiesRouter from '../routes/cities'
import weatherRouter from '../routes/weather'
import streetViewRouter from '../routes/streetview'
import radioRouter from '../routes/radio'
import soundsRouter from '../routes/sounds'
import favoritesRouter from '../routes/favorites'

// Create test app without database connections
export const createTestApp = (): express.Application => {
    const app = express()

    // Rate limiting for tests
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
        message: {
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            const clientIP = req.ip || req.connection?.remoteAddress
            return clientIP === '127.0.0.1' || clientIP === '::1'
        }
    })

    // Security headers
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
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin" },
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }))

    app.use(cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    }))

    app.use(compression())
    app.use(json({ limit: '10mb' }))
    app.use(urlencoded({ extended: true, limit: '10mb' }))
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

    // Error handling middleware
    app.use(notFound)
    app.use(errorHandler)

    return app
}
