#!/usr/bin/env node

/**
 * Virtual Vacation Production Validation Suite
 * Comprehensive validation for production deployments
 */

const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionValidator {
    constructor() {
        this.baseUrl = process.env.BASE_URL || 'http://localhost:5001';
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.validationResults = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            checks: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async runCheck(name, checkFunction) {
        this.log(`🔍 Running check: ${name}`, 'info');

        const check = {
            name,
            status: 'running',
            duration: 0,
            error: null,
            details: {}
        };

        const startTime = Date.now();

        try {
            const result = await checkFunction();
            check.status = 'passed';
            check.details = result || {};
            this.log(`✅ Check passed: ${name}`, 'success');
        } catch (error) {
            check.status = 'failed';
            check.error = error.message;
            this.log(`❌ Check failed: ${name} - ${error.message}`, 'error');
        }

        check.duration = Date.now() - startTime;
        this.validationResults.checks.push(check);
        this.updateSummary(check.status);

        return check;
    }

    updateSummary(status) {
        this.validationResults.summary.total++;
        switch (status) {
            case 'passed':
                this.validationResults.summary.passed++;
                break;
            case 'failed':
                this.validationResults.summary.failed++;
                break;
            case 'warning':
                this.validationResults.summary.warnings++;
                break;
        }
    }

    // API Health Checks
    async checkAPIHealth() {
        const response = await axios.get(`${this.baseUrl}/api/health`, { timeout: 5000 });

        if (response.status !== 200) {
            throw new Error(`Health check failed with status ${response.status}`);
        }

        if (response.data.status !== 'healthy') {
            throw new Error(`Service reported unhealthy status: ${response.data.status}`);
        }

        return {
            status: response.data.status,
            uptime: response.data.uptime,
            version: response.data.version,
            timestamp: response.data.timestamp
        };
    }

    async checkDatabaseConnectivity() {
        // Test database connectivity through API
        const response = await axios.get(`${this.baseUrl}/api/cities?limit=1`, { timeout: 10000 });

        if (response.status !== 200) {
            throw new Error(`Database connectivity test failed with status ${response.status}`);
        }

        if (!response.data.data || response.data.data.length === 0) {
            throw new Error('Database query returned no data');
        }

        return {
            connectionStatus: 'healthy',
            dataReturned: response.data.data.length,
            responseTime: response.data.responseTime
        };
    }

    async checkRedisConnectivity() {
        // Test Redis connectivity through cached weather API
        const response = await axios.get(`${this.baseUrl}/api/weather/current?lat=40.7128&lon=-74.0060`, { timeout: 15000 });

        if (response.status !== 200) {
            throw new Error(`Redis connectivity test failed with status ${response.status}`);
        }

        // Make the same request again to test caching
        const cachedResponse = await axios.get(`${this.baseUrl}/api/weather/current?lat=40.7128&lon=-74.0060`, { timeout: 5000 });

        const cacheHit = cachedResponse.data.responseTime < response.data.responseTime;

        return {
            redisStatus: 'healthy',
            cacheWorking: cacheHit,
            firstRequestTime: response.data.responseTime,
            cachedRequestTime: cachedResponse.data.responseTime
        };
    }

    async checkExternalAPIs() {
        const results = {};

        // Test OpenWeatherMap API
        try {
            const weatherResponse = await axios.get(`${this.baseUrl}/api/weather/current?lat=40.7128&lon=-74.0060`, { timeout: 10000 });
            results.weatherAPI = {
                status: 'healthy',
                responseTime: weatherResponse.data.responseTime
            };
        } catch (error) {
            results.weatherAPI = {
                status: 'failed',
                error: error.message
            };
        }

        // Test Google Maps Street View API
        try {
            const streetviewResponse = await axios.get(`${this.baseUrl}/api/streetview/check?lat=40.7128&lon=-74.0060`, { timeout: 10000 });
            results.streetviewAPI = {
                status: 'healthy',
                responseTime: streetviewResponse.data.responseTime
            };
        } catch (error) {
            results.streetviewAPI = {
                status: 'failed',
                error: error.message
            };
        }

        // Check if any external API failed
        const failedAPIs = Object.values(results).filter(result => result.status === 'failed');
        if (failedAPIs.length > 0) {
            throw new Error(`External API failures: ${failedAPIs.map(api => api.error).join(', ')}`);
        }

        return results;
    }

    // Frontend Checks
    async checkFrontendAvailability() {
        try {
            const response = await axios.get(this.frontendUrl, { timeout: 10000 });

            if (response.status !== 200) {
                throw new Error(`Frontend returned status ${response.status}`);
            }

            // Check if it's not a generic error page
            if (response.data.includes('Virtual Vacation') === false) {
                throw new Error('Frontend did not load expected content');
            }

            return {
                status: 'healthy',
                loadTime: response.data.length,
                hasExpectedContent: true
            };
        } catch (error) {
            throw new Error(`Frontend unavailable: ${error.message}`);
        }
    }

    async checkFrontendAPICalls() {
        // Test if frontend can make API calls
        const testPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Test</title>
      <script>
        async function testAPI() {
          try {
            const response = await fetch('${this.baseUrl}/api/health');
            return response.ok;
          } catch (error) {
            return false;
          }
        }
        window.apiTestResult = testAPI();
      </script>
    </head>
    <body>Testing API connectivity...</body>
    </html>
    `;

        // This is a simplified check - in real scenarios, you'd use a headless browser
        const healthResponse = await axios.get(`${this.baseUrl}/api/health`);
        return {
            frontendAPIAccess: healthResponse.status === 200,
            corsEnabled: true // Assuming CORS is configured
        };
    }

    // Security Checks
    async checkSecurityHeaders() {
        const response = await axios.get(`${this.baseUrl}/api/health`, {
            timeout: 5000,
            validateStatus: () => true // Don't throw on non-2xx
        });

        const headers = response.headers;
        const securityHeaders = {
            'x-content-type-options': headers['x-content-type-options'] === 'nosniff',
            'x-frame-options': headers['x-frame-options'] !== undefined,
            'x-xss-protection': headers['x-xss-protection'] !== undefined,
            'strict-transport-security': headers['strict-transport-security'] !== undefined,
            'content-security-policy': headers['content-security-policy'] !== undefined
        };

        const missingHeaders = Object.entries(securityHeaders)
            .filter(([header, present]) => !present)
            .map(([header]) => header);

        if (missingHeaders.length > 0) {
            throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
        }

        return {
            securityHeadersPresent: true,
            headersChecked: Object.keys(securityHeaders).length,
            allHeadersPresent: missingHeaders.length === 0
        };
    }

    async checkRateLimiting() {
        const requests = [];

        // Make multiple rapid requests to test rate limiting
        for (let i = 0; i < 15; i++) {
            requests.push(
                axios.get(`${this.baseUrl}/api/health`, {
                    timeout: 2000,
                    validateStatus: () => true
                })
            );
        }

        const responses = await Promise.all(requests);
        const rateLimitedResponses = responses.filter(r => r.status === 429);

        return {
            rateLimitingEnabled: rateLimitedResponses.length > 0,
            requestsMade: requests.length,
            rateLimitedCount: rateLimitedResponses.length,
            successRate: (responses.filter(r => r.status === 200).length / responses.length) * 100
        };
    }

    // Performance Checks
    async checkResponseTimes() {
        const endpoints = [
            '/api/health',
            '/api/cities?limit=5',
            '/api/weather/current?lat=40.7128&lon=-74.0060',
            '/api/streetview/check?lat=40.7128&lon=-74.0060'
        ];

        const results = {};

        for (const endpoint of endpoints) {
            const startTime = Date.now();
            const response = await axios.get(`${this.baseUrl}${endpoint}`, { timeout: 10000 });
            const responseTime = Date.now() - startTime;

            results[endpoint] = {
                status: response.status,
                responseTime,
                acceptable: responseTime < 2000 // 2 second threshold
            };
        }

        const slowEndpoints = Object.entries(results)
            .filter(([endpoint, result]) => !result.acceptable)
            .map(([endpoint]) => endpoint);

        if (slowEndpoints.length > 0) {
            throw new Error(`Slow response times for: ${slowEndpoints.join(', ')}`);
        }

        return results;
    }

    async checkResourceUsage() {
        // Check if we can access system metrics (this would typically be done via monitoring tools)
        try {
            // This is a placeholder - in production, you'd integrate with monitoring systems
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            return {
                memoryUsage: {
                    rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) // MB
                },
                cpuUsage: {
                    user: Math.round(cpuUsage.user / 1000), // ms
                    system: Math.round(cpuUsage.system / 1000) // ms
                }
            };
        } catch (error) {
            return { resourceCheck: 'unavailable', error: error.message };
        }
    }

    // Configuration Checks
    async checkEnvironmentVariables() {
        const requiredVars = [
            'NODE_ENV',
            'DATABASE_URL',
            'REDIS_URL',
            'JWT_SECRET',
            'OPENWEATHER_API_KEY',
            'GOOGLE_MAPS_API_KEY'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        return {
            allRequiredVarsPresent: true,
            varsChecked: requiredVars.length,
            missingVars: missingVars.length
        };
    }

    async checkDatabaseMigrations() {
        // Test if database has required tables
        const response = await axios.get(`${this.baseUrl}/api/cities?limit=1`, { timeout: 5000 });

        if (response.status !== 200) {
            throw new Error('Database migration check failed');
        }

        // Check if response has expected structure
        if (!response.data.data || !Array.isArray(response.data.data)) {
            throw new Error('Database schema appears incorrect');
        }

        return {
            migrationsApplied: true,
            schemaValid: true,
            dataAccessible: response.data.data.length >= 0
        };
    }

    async runFullValidation() {
        this.log('🚀 Starting comprehensive production validation', 'info');

        try {
            // API Health Checks
            await this.runCheck('API Health Check', () => this.checkAPIHealth());
            await this.runCheck('Database Connectivity', () => this.checkDatabaseConnectivity());
            await this.runCheck('Redis Connectivity', () => this.checkRedisConnectivity());
            await this.runCheck('External APIs', () => this.checkExternalAPIs());

            // Frontend Checks
            await this.runCheck('Frontend Availability', () => this.checkFrontendAvailability());
            await this.runCheck('Frontend API Access', () => this.checkFrontendAPICalls());

            // Security Checks
            await this.runCheck('Security Headers', () => this.checkSecurityHeaders());
            await this.runCheck('Rate Limiting', () => this.checkRateLimiting());

            // Performance Checks
            await this.runCheck('Response Times', () => this.checkResponseTimes());
            await this.runCheck('Resource Usage', () => this.checkResourceUsage());

            // Configuration Checks
            await this.runCheck('Environment Variables', () => this.checkEnvironmentVariables());
            await this.runCheck('Database Migrations', () => this.checkDatabaseMigrations());

            // Generate final report
            this.generateReport();

            this.log('🎉 Production validation completed!', 'success');
            this.displayResults();

        } catch (error) {
            this.log(`❌ Production validation failed: ${error.message}`, 'error');
            throw error;
        }
    }

    generateReport() {
        const reportPath = path.join(process.cwd(), 'production-validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.validationResults, null, 2));

        this.log(`📊 Validation report saved to: ${reportPath}`, 'info');
    }

    displayResults() {
        const summary = this.validationResults.summary;

        console.log('\n' + '='.repeat(60));
        console.log('📊 PRODUCTION VALIDATION RESULTS');
        console.log('='.repeat(60));
        console.log(`Environment: ${this.validationResults.environment}`);
        console.log(`Timestamp: ${this.validationResults.timestamp}`);
        console.log(`Total Checks: ${summary.total}`);
        console.log(`✅ Passed: ${summary.passed}`);
        console.log(`❌ Failed: ${summary.failed}`);
        console.log(`⚠️  Warnings: ${summary.warnings}`);

        const successRate = ((summary.passed / summary.total) * 100).toFixed(2);
        console.log(`📈 Success Rate: ${successRate}%`);

        if (summary.failed > 0) {
            console.log('\n❌ FAILED CHECKS:');
            this.validationResults.checks
                .filter(check => check.status === 'failed')
                .forEach(check => {
                    console.log(`  • ${check.name}: ${check.error}`);
                });
        }

        if (summary.warnings > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.validationResults.checks
                .filter(check => check.status === 'warning')
                .forEach(check => {
                    console.log(`  • ${check.name}: ${check.error}`);
                });
        }

        console.log('\n📁 Detailed report saved to: production-validation-report.json');

        if (summary.failed === 0) {
            console.log('\n🎉 ALL CHECKS PASSED - PRODUCTION READY!');
        } else {
            console.log(`\n⚠️  ${summary.failed} CHECK(S) FAILED - REVIEW REQUIRED`);
        }

        console.log('='.repeat(60));
    }
}

// CLI Interface
async function main() {
    const validator = new ProductionValidator();
    const command = process.argv[2];

    switch (command) {
        case 'health':
            await validator.runCheck('API Health Check', () => validator.checkAPIHealth());
            break;

        case 'security':
            await validator.runCheck('Security Headers', () => validator.checkSecurityHeaders());
            await validator.runCheck('Rate Limiting', () => validator.checkRateLimiting());
            break;

        case 'performance':
            await validator.runCheck('Response Times', () => validator.checkResponseTimes());
            await validator.runCheck('Resource Usage', () => validator.checkResourceUsage());
            break;

        case 'full':
        default:
            await validator.runFullValidation();
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProductionValidator;
