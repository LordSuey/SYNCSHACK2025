# AuthentiCITY - Social Feed PWA

A mobile-first Progressive Web App for discovering authentic places and sharing experiences.

## Features

- 📱 **PWA Support** - Install as a native app on mobile devices
- 🗺️ **Google Maps Integration** - Discover nearby places and attractions
- 📸 **Photo Sharing** - Share your experiences with beautiful photos
- 🌙 **Dark Theme** - Modern dark UI design
- 📍 **Location Services** - Find places near you
- 🔍 **Place Search** - Search for specific locations
- 💬 **Social Features** - Like, comment, and share posts

## Setup Instructions

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd SYNCSHACK2025
```

### 2. Set Up API Keys

1. Copy the example configuration file:
   ```bash
   cp config.js config.js
   ```

2. Get a Google Maps API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
   - Go to "Credentials" and create an API Key
   - (Optional) Restrict the API key to your domain for security

3. Edit `config.js` and replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:
   ```javascript
   GOOGLE_MAPS_API_KEY: 'your_actual_api_key_here',
   ```

### 3. Run the Application

Simply open `index.html` in a web browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

### 4. Install as PWA

On mobile devices:
- **iOS**: Open in Safari → Share → Add to Home Screen
- **Android**: Open in Chrome → Menu → Add to Home Screen

## File Structure

```
SYNCSHACK2025/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # JavaScript functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── config.js          # API keys (not in git)
├── config.js   # Template for API keys
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Security Notes

- `config.js` is excluded from version control via `.gitignore`
- Never commit API keys to your repository
- Consider restricting your Google Maps API key to specific domains
- The `config.js` file serves as a template for other developers

## Development

The app uses vanilla JavaScript, HTML5, and CSS3. No build process is required.

### Adding New API Keys

Add new API keys to the `CONFIG` object in `config.js`:

```javascript
const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'your_key_here',
    NEW_API_KEY: 'another_key_here',
    // ...
};
```

### Customizing Map Settings

Modify the default map location and zoom in `config.js`:

```javascript
DEFAULT_MAP_CENTER: {
    lat: your_latitude,
    lng: your_longitude
},
DEFAULT_MAP_ZOOM: your_preferred_zoom_level
```

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]