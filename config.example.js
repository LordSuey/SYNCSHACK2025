// Configuration file template for API keys and sensitive data
// Copy this file to config.js and add your actual API keys

const CONFIG = {
    // Google Maps API Key
    // Get your API key from: https://console.cloud.google.com/
    // 1. Create a new project or select existing one
    // 2. Enable "Maps JavaScript API" and "Places API"
    // 3. Go to Credentials and create an API Key
    // 4. Restrict the API key to your domain for security
    // Put your API key down below
    GOOGLE_MAPS_API_KEY: '',
    
    // Other API keys can be added here as needed
    // FIREBASE_API_KEY: 'your_firebase_key_here',
    // UNSPLASH_API_KEY: 'your_unsplash_key_here',
    
    // App configuration
    APP_NAME: 'AuthentiCITY',
    VERSION: '1.0.0',
    
    // Default map settings
    DEFAULT_MAP_CENTER: {
        lat: 40.7128,    // New York City latitude
        lng: -74.0060    // New York City longitude
    },
    DEFAULT_MAP_ZOOM: 15
};

// Make config available globally
window.CONFIG = CONFIG;
