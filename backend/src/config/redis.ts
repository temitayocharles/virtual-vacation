import { createClient, RedisClientType } from 'redis'
import { logger } from '../utils/logger'

let redisClient: RedisClientType

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      url: process.env['REDIS_URL'] || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis max retry attempts reached')
            return false
          }
          return Math.min(retries * 100, 3000)
        }
      }
    })

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully')
    })

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...')
    })

    redisClient.on('ready', () => {
      logger.info('✅ Redis ready for operations')
    })

    await redisClient.connect()
  } catch (error) {
    logger.error('❌ Redis connection failed:', error)
    throw error
  }
}

export const getRedis = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis first.')
  }
  return redisClient
}

// Cache helper functions
export const cache = {
  get: async (key: string): Promise<string | null> => {
    try {
      return await redisClient.get(key)
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  },

  set: async (key: string, value: string, ttl?: number): Promise<void> => {
    try {
      if (ttl) {
        await redisClient.setEx(key, ttl, value)
      } else {
        await redisClient.set(key, value)
      }
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error)
    }
  },

  del: async (key: string): Promise<void> => {
    try {
      await redisClient.del(key)
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error)
    }
  },

  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redisClient.exists(key)
      return result === 1
    } catch (error) {
      logger.error(`Error checking cache key ${key}:`, error)
      return false
    }
  },

  expire: async (key: string, seconds: number): Promise<void> => {
    try {
      await redisClient.expire(key, seconds)
    } catch (error) {
      logger.error(`Error setting expiry for cache key ${key}:`, error)
    }
  }
}

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect()
    logger.info('Redis connection closed')
  }
}
