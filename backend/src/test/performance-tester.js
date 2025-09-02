#!/usr/bin/env node

/**
 * Virtual Vacation Performance Testing Suite
 * Comprehensive load testing and performance validation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
    constructor() {
        this.baseUrl = process.env.BASE_URL || 'http://localhost:5001';
        this.resultsDir = path.join(__dirname, '..', 'performance-results');
        this.ensureResultsDir();
    }

    ensureResultsDir() {
        if (!fs.existsSync(this.resultsDir)) {
            fs.mkdirSync(this.resultsDir, { recursive: true });
        }
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

    async runLoadTest(scenario, duration = 60, virtualUsers = 10) {
        this.log(`🚀 Starting load test: ${scenario}`, 'info');
        this.log(`📊 Duration: ${duration}s, Virtual Users: ${virtualUsers}`, 'info');

        const artilleryConfig = {
            config: {
                target: this.baseUrl,
                phases: [
                    { duration, arrivalRate: virtualUsers },
                    { duration: 30, arrivalRate: virtualUsers * 2 } // Spike test
                ],
                defaults: {
                    headers: {
                        'User-Agent': 'Virtual Vacation Load Test'
                    }
                }
            },
            scenarios: [this.getScenarioConfig(scenario)]
        };

        const configPath = path.join(this.resultsDir, `${scenario}-config.json`);
        fs.writeFileSync(configPath, JSON.stringify(artilleryConfig, null, 2));

        try {
            const result = execSync(`npx artillery run ${configPath} --output ${path.join(this.resultsDir, `${scenario}-results.json`)}`, {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            this.log(`✅ Load test completed: ${scenario}`, 'success');
            return result;
        } catch (error) {
            this.log(`❌ Load test failed: ${scenario}`, 'error');
            throw error;
        }
    }

    getScenarioConfig(scenario) {
        const scenarios = {
            cities: {
                name: 'Cities API Load Test',
                weight: 40,
                flow: [
                    { get: { url: '/api/cities?limit=20&page=1' } },
                    { get: { url: '/api/cities/search?q=new+york' } },
                    { get: { url: '/api/cities/country/US' } }
                ]
            },
            weather: {
                name: 'Weather API Load Test',
                weight: 30,
                flow: [
                    { get: { url: '/api/weather/current?lat=40.7128&lon=-74.0060' } },
                    { get: { url: '/api/weather/forecast?lat=40.7128&lon=-74.0060' } }
                ]
            },
            streetview: {
                name: 'Street View API Load Test',
                weight: 20,
                flow: [
                    { get: { url: '/api/streetview/check?lat=40.7128&lon=-74.0060' } },
                    { get: { url: '/api/streetview/image-url?lat=40.7128&lon=-74.0060' } }
                ]
            },
            health: {
                name: 'Health Check Load Test',
                weight: 10,
                flow: [
                    { get: { url: '/api/health' } }
                ]
            }
        };

        return scenarios[scenario] || scenarios.cities;
    }

    async runStressTest() {
        this.log('🔥 Starting stress test with increasing load', 'warning');

        const stressLevels = [
            { duration: 30, users: 5, name: 'Warm-up' },
            { duration: 60, users: 20, name: 'Normal Load' },
            { duration: 60, users: 50, name: 'High Load' },
            { duration: 60, users: 100, name: 'Stress Load' },
            { duration: 30, users: 200, name: 'Breaking Point' }
        ];

        for (const level of stressLevels) {
            this.log(`📈 ${level.name}: ${level.users} users for ${level.duration}s`, 'info');
            await this.runLoadTest('stress', level.duration, level.users);
            await this.sleep(5000); // Cool down period
        }
    }

    async runSpikeTest() {
        this.log('⚡ Starting spike test', 'warning');

        const spikeConfig = {
            config: {
                target: this.baseUrl,
                phases: [
                    { duration: 60, arrivalRate: 10 },   // Baseline
                    { duration: 30, arrivalRate: 100 },  // Spike
                    { duration: 60, arrivalRate: 10 },   // Recovery
                    { duration: 30, arrivalRate: 150 },  // Another spike
                    { duration: 60, arrivalRate: 10 }    // Final recovery
                ]
            },
            scenarios: [{
                name: 'Spike Test',
                flow: [
                    { get: { url: '/api/cities?limit=10' } },
                    { get: { url: '/api/weather/current?lat=40.7128&lon=-74.0060' } }
                ]
            }]
        };

        const configPath = path.join(this.resultsDir, 'spike-test-config.json');
        fs.writeFileSync(configPath, JSON.stringify(spikeConfig, null, 2));

        try {
            execSync(`npx artillery run ${configPath} --output ${path.join(this.resultsDir, 'spike-test-results.json')}`, {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            this.log('✅ Spike test completed', 'success');
        } catch (error) {
            this.log('❌ Spike test failed', 'error');
            throw error;
        }
    }

    async runEnduranceTest() {
        this.log('🏃 Starting endurance test (long-running)', 'info');

        const enduranceConfig = {
            config: {
                target: this.baseUrl,
                phases: [
                    { duration: 300, arrivalRate: 20 } // 5 minutes at moderate load
                ]
            },
            scenarios: [{
                name: 'Endurance Test',
                flow: [
                    { get: { url: '/api/health' } },
                    { get: { url: '/api/cities?limit=5' } },
                    { get: { url: '/api/weather/current?lat=40.7128&lon=-74.0060' } }
                ]
            }]
        };

        const configPath = path.join(this.resultsDir, 'endurance-test-config.json');
        fs.writeFileSync(configPath, JSON.stringify(enduranceConfig, null, 2));

        try {
            execSync(`npx artillery run ${configPath} --output ${path.join(this.resultsDir, 'endurance-test-results.json')}`, {
                cwd: process.cwd(),
                stdio: 'inherit'
            });
            this.log('✅ Endurance test completed', 'success');
        } catch (error) {
            this.log('❌ Endurance test failed', 'error');
            throw error;
        }
    }

    async runMemoryLeakTest() {
        this.log('🧠 Starting memory leak detection test', 'info');

        // Monitor memory usage over time
        const memoryStats = [];
        const monitoringDuration = 300000; // 5 minutes
        const monitoringInterval = 10000; // 10 seconds

        const monitorMemory = () => {
            const memUsage = process.memoryUsage();
            memoryStats.push({
                timestamp: new Date().toISOString(),
                rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                external: Math.round(memUsage.external / 1024 / 1024) // MB
            });
        };

        // Start monitoring
        const intervalId = setInterval(monitorMemory, monitoringInterval);

        // Run continuous load
        const loadProcess = spawn('npx', ['artillery', 'run', path.join(this.resultsDir, 'cities-config.json')], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });

        // Wait for monitoring duration
        await this.sleep(monitoringDuration);

        // Stop monitoring and load
        clearInterval(intervalId);
        loadProcess.kill();

        // Analyze memory trend
        const memoryReport = this.analyzeMemoryTrend(memoryStats);
        fs.writeFileSync(
            path.join(this.resultsDir, 'memory-leak-report.json'),
            JSON.stringify(memoryReport, null, 2)
        );

        this.log('✅ Memory leak test completed', 'success');
    }

    analyzeMemoryTrend(stats) {
        if (stats.length < 2) return { trend: 'insufficient-data' };

        const first = stats[0];
        const last = stats[stats.length - 1];
        const growth = last.heapUsed - first.heapUsed;

        const trend = growth > 50 ? 'increasing' : growth < -50 ? 'decreasing' : 'stable';

        return {
            trend,
            growthMB: growth,
            averageHeapUsed: Math.round(stats.reduce((sum, s) => sum + s.heapUsed, 0) / stats.length),
            maxHeapUsed: Math.max(...stats.map(s => s.heapUsed)),
            minHeapUsed: Math.min(...stats.map(s => s.heapUsed)),
            samples: stats.length,
            duration: `${stats.length * 10}s`
        };
    }

    async generateReport() {
        this.log('📊 Generating performance report', 'info');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                averageResponseTime: 0,
                p95ResponseTime: 0,
                errorRate: 0
            },
            recommendations: []
        };

        // Read all result files
        const resultFiles = fs.readdirSync(this.resultsDir)
            .filter(file => file.endsWith('-results.json'));

        for (const file of resultFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(this.resultsDir, file), 'utf8'));
                report.summary.totalTests++;

                if (data.aggregate && data.aggregate.counters) {
                    const counters = data.aggregate.counters;
                    if (counters['http.codes.200'] > 0) {
                        report.summary.passedTests++;
                    }
                    if (counters['http.codes.500'] > 0 || counters['errors.ETIMEDOUT'] > 0) {
                        report.summary.failedTests++;
                    }
                }
            } catch (error) {
                this.log(`Warning: Could not parse ${file}`, 'warning');
            }
        }

        // Generate recommendations
        if (report.summary.errorRate > 5) {
            report.recommendations.push('High error rate detected. Consider optimizing database queries and connection pooling.');
        }
        if (report.summary.p95ResponseTime > 2000) {
            report.recommendations.push('Slow response times detected. Consider implementing caching and optimizing API endpoints.');
        }

        fs.writeFileSync(
            path.join(this.resultsDir, 'performance-report.json'),
            JSON.stringify(report, null, 2)
        );

        this.log('✅ Performance report generated', 'success');
        return report;
    }

    async runFullTestSuite() {
        this.log('🎯 Starting complete performance test suite', 'info');

        try {
            // Basic load tests
            await this.runLoadTest('cities');
            await this.runLoadTest('weather');
            await this.runLoadTest('streetview');
            await this.runLoadTest('health');

            // Advanced tests
            await this.runStressTest();
            await this.runSpikeTest();
            await this.runEnduranceTest();

            // Memory analysis
            await this.runMemoryLeakTest();

            // Generate final report
            const report = await this.generateReport();

            this.log('🎉 Performance test suite completed successfully!', 'success');
            this.displayResults(report);

        } catch (error) {
            this.log(`❌ Performance test suite failed: ${error.message}`, 'error');
            throw error;
        }
    }

    displayResults(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passedTests}`);
        console.log(`Failed: ${report.summary.failedTests}`);
        console.log(`Average Response Time: ${report.summary.averageResponseTime}ms`);
        console.log(`95th Percentile: ${report.summary.p95ResponseTime}ms`);
        console.log(`Error Rate: ${report.summary.errorRate}%`);

        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`• ${rec}`));
        }

        console.log('\n📁 Results saved to: ' + this.resultsDir);
        console.log('='.repeat(60));
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI Interface
async function main() {
    const tester = new PerformanceTester();
    const command = process.argv[2];

    switch (command) {
        case 'load':
            const scenario = process.argv[3] || 'cities';
            const duration = parseInt(process.argv[4]) || 60;
            const users = parseInt(process.argv[5]) || 10;
            await tester.runLoadTest(scenario, duration, users);
            break;

        case 'stress':
            await tester.runStressTest();
            break;

        case 'spike':
            await tester.runSpikeTest();
            break;

        case 'endurance':
            await tester.runEnduranceTest();
            break;

        case 'memory':
            await tester.runMemoryLeakTest();
            break;

        case 'report':
            await tester.generateReport();
            break;

        case 'full':
        default:
            await tester.runFullTestSuite();
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = PerformanceTester;
