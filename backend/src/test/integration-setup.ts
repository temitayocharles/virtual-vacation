import { Pool } from 'pg'
import { connectRedis, closeRedis } from '../config/redis'
import { connectDB, closeDB } from '../config/database'
import { logger } from '../utils/logger'

// Test database configuration
const testDBConfig = {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: Number.parseInt(process.env.TEST_DB_PORT || '5432', 10),
    database: process.env.TEST_DB_NAME || 'virtual_vacation_test',
    user: process.env.TEST_DB_USER || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'password',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
}

let testPool: Pool

export const setupTestDB = async (): Promise<void> => {
    try {
        // Connect to default postgres database first
        const adminPool = new Pool({
            host: testDBConfig.host,
            port: testDBConfig.port,
            database: 'postgres',
            user: testDBConfig.user,
            password: testDBConfig.password,
        })

        // Check if test database exists, create if it doesn't
        const dbCheck = await adminPool.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [testDBConfig.database])

        if (dbCheck.rows.length === 0) {
            await adminPool.query(`CREATE DATABASE ${testDBConfig.database}`)
            logger.info(`✅ Created test database: ${testDBConfig.database}`)
        } else {
            logger.info(`✅ Test database already exists: ${testDBConfig.database}`)
        }

        await adminPool.end()

        // Connect to test database
        testPool = new Pool(testDBConfig)

        // Test connection
        const client = await testPool.connect()
        await client.query('SELECT 1')
        client.release()

        // Set up test environment variables
        process.env.DATABASE_URL = `postgresql://${testDBConfig.user}:${testDBConfig.password}@${testDBConfig.host}:${testDBConfig.port}/${testDBConfig.database}`

        // Initialize the database with tables
        await connectDB()

        logger.info('✅ Test database setup completed')
    } catch (error) {
        logger.error('❌ Failed to setup test database:', error)
        throw error
    }
}

export const setupTestRedis = async (): Promise<void> => {
    try {
        // Use the same Redis initialization as the main application
        await connectRedis()
        logger.info('✅ Test Redis setup completed')
    } catch (error) {
        logger.error('❌ Failed to setup test Redis:', error)
        throw error
    }
}

export const teardownTestDB = async (): Promise<void> => {
    try {
        if (testPool) {
            await testPool.end()
        }
        await closeDB()
        logger.info('✅ Test database torn down')
    } catch (error) {
        logger.error('❌ Failed to teardown test database:', error)
    }
}

export const teardownTestRedis = async (): Promise<void> => {
    try {
        await closeRedis()
        logger.info('✅ Test Redis torn down')
    } catch (error) {
        logger.error('❌ Failed to teardown test Redis:', error)
    }
}

export const getTestPool = (): Pool => {
    if (!testPool) {
        throw new Error('Test database not initialized')
    }
    return testPool
}

export const clearTestData = async (): Promise<void> => {
    const client = await getTestPool().connect()
    try {
        await client.query('BEGIN')

        // Disable foreign key checks temporarily
        await client.query('SET CONSTRAINTS ALL DEFERRED')

        // Clear all test data using TRUNCATE which is faster and ignores foreign keys
        await client.query('TRUNCATE TABLE user_visits CASCADE')
        await client.query('TRUNCATE TABLE user_favorites CASCADE')
        await client.query('TRUNCATE TABLE radio_stations CASCADE')
        await client.query('TRUNCATE TABLE ambient_sounds CASCADE')
        await client.query('TRUNCATE TABLE cities CASCADE')
        await client.query('TRUNCATE TABLE countries CASCADE')

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }

    // Note: Redis cache clearing is handled by the cache functions themselves
    // which will work with the properly initialized Redis connection
}
