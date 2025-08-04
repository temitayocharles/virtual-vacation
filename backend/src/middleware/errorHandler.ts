import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

interface CustomError extends Error {
  statusCode?: number
  status?: string
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500
  let message = error.message || 'Internal Server Error'

  // Log the error
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent')
  })

  // Mongoose bad ObjectId
  if (error.name === 'CastError') {
    statusCode = 400
    message = 'Resource not found'
  }

  // Mongoose duplicate key
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 400
    message = 'Duplicate field value entered'
  }

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400
    message = Object.values((error as any).errors).map((val: any) => val.message).join(', ')
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}
