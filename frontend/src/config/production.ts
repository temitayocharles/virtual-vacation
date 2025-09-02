// Production environment configuration
export const config = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.temitayocharles.online',
    WS_URL: import.meta.env.VITE_WS_URL || 'wss://api.temitayocharles.online',

    // External APIs
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
    UNSPLASH_ACCESS_KEY: import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
    NEWS_API_KEY: import.meta.env.VITE_NEWS_API_KEY,
    MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,

    // Application Configuration
    APP_ENV: import.meta.env.VITE_APP_ENV || 'production',
    APP_VERSION: import.meta.env.__APP_VERSION__ || '1.0.0',

    // Feature Flags
    ENABLE_ANALYTICS: import.meta.env.VITE_GA_TRACKING_ID ? true : false,
    ENABLE_ERROR_TRACKING: import.meta.env.VITE_SENTRY_DSN ? true : false,

    // Performance Configuration
    API_TIMEOUT: 10000, // 10 seconds
    CACHE_TTL: 300000, // 5 minutes
    MAX_RETRIES: 3,

    // Security Configuration
    CSP_NONCE: '', // Will be set by server
    ENABLE_CSP: true,

    // PWA Configuration
    PWA_ENABLED: true,
    SERVICE_WORKER_ENABLED: true,

    // CDN Configuration
    CDN_URL: import.meta.env.VITE_CDN_URL || '',

    // Rate Limiting
    API_RATE_LIMIT: 100, // requests per minute
    API_RATE_WINDOW: 60000, // 1 minute in milliseconds
}

// Validation
if (!config.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key is not configured')
}

if (!config.OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key is not configured')
}

// Freeze configuration in production
if (config.APP_ENV === 'production') {
    Object.freeze(config)
}

export default config
