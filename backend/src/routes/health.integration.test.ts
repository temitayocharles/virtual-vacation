import request from 'supertest'
import { createTestApp } from '../test/test-app'

describe('Health Check Integration Test', () => {
    let app: any

    beforeAll(() => {
        app = createTestApp()
    })

    it('should return healthy status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200)

        expect(response.body.status).toBe('healthy')
        expect(response.body.environment).toBeDefined()
        expect(response.body.timestamp).toBeDefined()
        expect(response.body.uptime).toBeDefined()
    })

    it('should handle unknown routes', async () => {
        const response = await request(app)
            .get('/unknown-route')
            .expect(404)

        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain('not found')
    })

    it('should handle invalid HTTP methods', async () => {
        const response = await request(app)
            .patch('/health')
            .expect(404)

        expect(response.body.success).toBe(false)
    })
})
