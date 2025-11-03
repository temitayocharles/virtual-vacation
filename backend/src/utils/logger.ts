import winston from 'winston'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

const transports: winston.transport[] = [
  // Console logging - always enabled
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
]

// Only add file transports if file logging is not disabled
if (process.env.DISABLE_FILE_LOGGING !== 'true') {
  const logDir = process.env.LOG_DIR || 'logs'
  
  transports.push(
    // File logging for errors
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File logging for all logs
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  )
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'virtual-vacation-api' },
  transports
})

// If we're not in production, also log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
