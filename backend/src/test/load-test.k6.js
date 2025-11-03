import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const citiesResponseTime = new Trend('cities_response_time');
const weatherResponseTime = new Trend('weather_response_time');
const streetviewResponseTime = new Trend('streetview_response_time');

// Test configuration
export const options = {
    stages: [
        { duration: '1m', target: 10 },   // Warm up
        { duration: '2m', target: 50 },   // Normal load
        { duration: '2m', target: 100 },  // High load
        { duration: '1m', target: 200 },  // Stress test
        { duration: '1m', target: 0 },    // Cool down
    ],
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1000ms
        http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
        errors: ['rate<0.1'],
    },
};

// Base URL from environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

export default function () {
    // Cities API tests
    testCitiesAPI();

    // Weather API tests
    testWeatherAPI();

    // Street View API tests
    testStreetViewAPI();

    // Health check
    testHealthCheck();

    // Random sleep between 1-3 seconds
    sleep(Math.random() * 2 + 1);
}

function testCitiesAPI() {
    const startTime = Date.now();

    // Test cities listing
    const citiesResponse = http.get(`${BASE_URL}/api/cities?limit=10&page=1`);
    citiesResponseTime.add(Date.now() - startTime);

    check(citiesResponse, {
        'cities status is 200': (r) => r.status === 200,
        'cities has data': (r) => r.json().data !== undefined,
        'cities response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1);

    // Test city search
    const searchResponse = http.get(`${BASE_URL}/api/cities/search?q=new+york`);
    check(searchResponse, {
        'search status is 200': (r) => r.status === 200,
        'search has results': (r) => r.json().success === true,
    }) || errorRate.add(1);

    // Test cities by country
    const countryResponse = http.get(`${BASE_URL}/api/cities/country/US`);
    check(countryResponse, {
        'country status is 200': (r) => r.status === 200,
        'country has data': (r) => r.json().success === true,
    }) || errorRate.add(1);
}

function testWeatherAPI() {
    const startTime = Date.now();

    // Test current weather
    const weatherResponse = http.get(`${BASE_URL}/api/weather/current?lat=40.7128&lon=-74.0060`);
    weatherResponseTime.add(Date.now() - startTime);

    check(weatherResponse, {
        'weather status is 200': (r) => r.status === 200,
        'weather has data': (r) => r.json().data !== undefined,
        'weather response time < 1000ms': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    // Test weather forecast
    const forecastResponse = http.get(`${BASE_URL}/api/weather/forecast?lat=40.7128&lon=-74.0060`);
    check(forecastResponse, {
        'forecast status is 200': (r) => r.status === 200,
        'forecast has data': (r) => r.json().data !== undefined,
    }) || errorRate.add(1);
}

function testStreetViewAPI() {
    const startTime = Date.now();

    // Test street view availability
    const streetviewResponse = http.get(`${BASE_URL}/api/streetview/check?lat=40.7128&lon=-74.0060`);
    streetviewResponseTime.add(Date.now() - startTime);

    check(streetviewResponse, {
        'streetview status is 200': (r) => r.status === 200,
        'streetview has data': (r) => r.json().data !== undefined,
        'streetview response time < 1500ms': (r) => r.timings.duration < 1500,
    }) || errorRate.add(1);

    // Test street view image URL
    const imageResponse = http.get(`${BASE_URL}/api/streetview/image-url?lat=40.7128&lon=-74.0060&size=400x300`);
    check(imageResponse, {
        'image status is 200': (r) => r.status === 200,
        'image has URL': (r) => r.json().data && r.json().data.url,
    }) || errorRate.add(1);
}

function testHealthCheck() {
    const healthResponse = http.get(`${BASE_URL}/api/health`);

    check(healthResponse, {
        'health status is 200': (r) => r.status === 200,
        'health is healthy': (r) => r.json().status === 'healthy',
        'health response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1);
}

// Setup function - runs before the test starts
export function setup() {
    console.log('🚀 Starting Virtual Vacation Performance Test');
    console.log(`📍 Target URL: ${BASE_URL}`);

    // Warm-up request to ensure services are ready
    const warmupResponse = http.get(`${BASE_URL}/api/health`);
    if (warmupResponse.status !== 200) {
        console.error('❌ Warm-up failed - services may not be ready');
        return;
    }

    console.log('✅ Warm-up successful - starting performance tests');
}

// Teardown function - runs after the test completes
export function teardown(data) {
    console.log('🏁 Performance test completed');
}

// Handle summary - custom summary output
export function handleSummary(data) {
    const summary = {
        timestamp: new Date().toISOString(),
        metrics: {
            http_req_duration: {
                avg: data.metrics.http_req_duration.values.avg,
                p95: data.metrics.http_req_duration.values['p(95)'],
                p99: data.metrics.http_req_duration.values['p(99)'],
                max: data.metrics.http_req_duration.values.max,
            },
            http_req_failed: {
                rate: data.metrics.http_req_failed.values.rate,
                passes: data.metrics.http_req_failed.values.passes,
                fails: data.metrics.http_req_failed.values.fails,
            },
            iteration_duration: data.metrics.iteration_duration.values.avg,
            iterations: data.metrics.iteration_duration.values.count,
        },
        custom_metrics: {
            cities_response_time: data.metrics.cities_response_time?.values?.avg || 0,
            weather_response_time: data.metrics.weather_response_time?.values?.avg || 0,
            streetview_response_time: data.metrics.streetview_response_time?.values?.avg || 0,
            error_rate: data.metrics.errors?.values?.rate || 0,
        },
        recommendations: generateRecommendations(data),
    };

    // Write summary to file
    const fs = require('node:fs');
    fs.writeFileSync('./performance-results/k6-summary.json', JSON.stringify(summary, null, 2));

    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        './performance-results/k6-summary.json': JSON.stringify(summary, null, 2),
    };
}

function generateRecommendations(data) {
    const recommendations = [];
    const metrics = data.metrics;

    if (metrics.http_req_duration.values['p(95)'] > 1000) {
        recommendations.push('95th percentile response time is high (>1000ms). Consider optimizing database queries and implementing caching.');
    }

    if (metrics.http_req_failed.values.rate > 0.05) {
        recommendations.push('Error rate is above 5%. Investigate failing requests and improve error handling.');
    }

    if (metrics.http_req_duration.values.avg > 500) {
        recommendations.push('Average response time is high (>500ms). Consider implementing response compression and optimizing API endpoints.');
    }

    return recommendations;
}

// Custom text summary
function textSummary(data, options) {
    return `
📊 Virtual Vacation Performance Test Results
==============================================

Test Duration: ${Math.round(data.metrics.iteration_duration.values.count / 60)} minutes
Total Requests: ${data.metrics.http_req_duration.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.fails}

📈 Response Times:
  Average: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
  95th percentile: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
  99th percentile: ${Math.round(data.metrics.http_req_duration.values['p(99)'])}ms
  Max: ${Math.round(data.metrics.http_req_duration.values.max)}ms

🎯 Success Rate: ${((1 - data.metrics.http_req_failed.values.rate) * 100).toFixed(2)}%

💡 Recommendations:
${generateRecommendations(data).map(rec => `  • ${rec}`).join('\n')}

📁 Detailed results saved to: ./performance-results/k6-summary.json
`;
}
