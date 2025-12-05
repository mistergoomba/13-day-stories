# Data Fetching & Caching Implementation Plan

## Overview

This document outlines the plan for migrating from hardcoded data to server-based data fetching with intelligent caching.

## Architecture

### API Endpoints

**1. Today's Data**
- **Development:** `http://localhost:3000/api/today.json`
- **Production:** `https://cdn.meowtin.com/api/today.json`
- **Response:** Full day data (~5-10KB)
```json
{
  "day": 8,
  "trecena": "Aq'ab'al",
  "data": {
    "number": 8,
    "nawal": "Tz'i'",
    "chapter": "...",
    "horoscope": "...",
    "affirmation": "...",
    "meditation": "...",
    "energy_of_the_day": { ... },
    "images": {
      "horoscope": "/images/trecena-aqabal/8/horoscope.jpg",
      "story_primary": "/images/trecena-aqabal/8/story_primary.jpg",
      "story_wide_1": "/images/trecena-aqabal/8/story_wide_1.jpg",
      "story_wide_2": "/images/trecena-aqabal/8/story_wide_2.jpg",
      "affirmation": "/images/trecena-aqabal/8/affirmation.jpg",
      "meditation": "/images/trecena-aqabal/8/meditation.jpg",
      "affirmation_share": "/images/trecena-aqabal/8/affirmation_share.png",
      "horoscope_share": "/images/trecena-aqabal/8/horoscope_share.png"
    }
  }
}
```

**2. Full Trecena Data**
- **Development:** `http://localhost:3000/api/trecenas/trecena-aqabal.json`
- **Production:** `https://cdn.meowtin.com/api/trecenas/trecena-aqabal.json`
- **Response:** Complete trecena with all 13 days (~50-200KB)
- **Structure:** Same as current `data/trecena-aqabal.js` but JSON format

### Image Paths

All image paths in JSON are **relative** (no domain):
- `/images/trecena-aqabal/8/horoscope.jpg`
- `/images/trecena-aqabal/8/affirmation_share.png`

Base URL determined by environment:
- **Development:** `http://localhost:3000`
- **Production:** `https://cdn.meowtin.com`

## Environment Configuration

### Setup

Create `.env` file (gitignored):
```env
API_BASE_URL=http://localhost:3000
CDN_BASE_URL=http://localhost:3000
ENV=development
```

Create `.env.production` (for production builds):
```env
API_BASE_URL=https://api.meowtin.com
CDN_BASE_URL=https://cdn.meowtin.com
ENV=production
```

### Implementation

Use `expo-constants` or `react-native-config` for environment variables:

```javascript
// utils/config.js
import Constants from 'expo-constants';

const ENV = {
  development: {
    apiBaseUrl: 'http://localhost:3000',
    cdnBaseUrl: 'http://localhost:3000',
  },
  production: {
    apiBaseUrl: 'https://api.meowtin.com',
    cdnBaseUrl: 'https://cdn.meowtin.com',
  },
};

const getEnvVars = () => {
  const releaseChannel = Constants.expoConfig?.extra?.releaseChannel || 'development';
  return ENV[releaseChannel] || ENV.development;
};

export const config = getEnvVars();
```

## Data Flow

### Day 8 (First Time)

1. **App opens** → Show loading state
2. **Fetch today.json**
   - `GET ${API_BASE_URL}/api/today.json`
   - Receive Day 8 full data
3. **Download today's horoscope image** (needed for Today screen)
   - `GET ${CDN_BASE_URL}/images/trecena-aqabal/8/horoscope.jpg`
   - Cache locally
4. **Show Today screen** with Day 8 data
5. **Background: Fetch trecena.json**
   - `GET ${API_BASE_URL}/api/trecenas/trecena-aqabal.json`
   - Cache full trecena data
6. **Background: Download remaining Day 8 images**
   - story_primary, story_wide_1, story_wide_2, affirmation, meditation
   - Cache each image locally

### Day 9

1. **App opens** → Show loading state
2. **Fetch today.json**
   - `GET ${API_BASE_URL}/api/today.json`
   - Receive Day 9 full data
3. **Compare day numbers**
   - Cached day (8) ≠ Server day (9) → New day
4. **Download Day 9 horoscope image**
5. **Show Today screen** with Day 9 data
6. **Background: Check trecena cache**
   - If same trecena → Use cached trecena.json
   - If new trecena → Fetch new trecena.json
7. **Background: Download remaining Day 9 images**

### Same Day (User Reopens App)

1. **App opens** → Show loading state
2. **Fetch today.json**
   - `GET ${API_BASE_URL}/api/today.json`
   - Receive Day 8 data
3. **Compare day numbers**
   - Cached day (8) === Server day (8) → Same day
4. **Use cached data** (skip image download if already cached)
5. **Show Today screen immediately**

## Caching Strategy

### AsyncStorage Keys

```
@today_day: "8"
@today_data_8: { ... day 8 full data ... }
@trecena_aqabal: { ... full trecena object ... }
@trecena_name: "Aq'ab'al"
```

### Image Caching

Use `expo-file-system` for image caching:

```javascript
import * as FileSystem from 'expo-file-system';

// Cache key format: @image_{trecena}_{day}_{type}
// Example: @image_aqabal_8_horoscope
```

**Cache locations:**
- Images: `FileSystem.cacheDirectory + 'images/trecena-aqabal/{day}/{type}.jpg'`
- JSON: AsyncStorage (small enough)

### Cache Invalidation

- **today.json:** Compare day number, auto-invalidate on new day
- **trecena.json:** Compare trecena name, invalidate on new trecena
- **Images:** Keep forever for current trecena, purge when trecena changes

## Implementation Details

### New Files to Create

1. **`utils/config.js`** - Environment configuration
2. **`utils/api.js`** - API client with base URL handling
3. **`utils/cache.js`** - Caching utilities (AsyncStorage + FileSystem)
4. **`utils/dataService.js`** - Main data fetching service

### Files to Modify

1. **`utils/mayanCalendar.js`** - Replace hardcoded data with API calls
2. **`App.js`** - Add loading state and data initialization
3. **`screens/TodayScreenContent.js`** - Handle loading/error states
4. **`screens/JourneyScreenContent.js`** - Use cached trecena data
5. **`screens/MeditationScreenContent.js`** - Use cached data

### Data Service API

```javascript
// utils/dataService.js

export async function fetchTodayData() {
  // Fetch today.json, compare day, return data
}

export async function fetchTrecenaData(trecenaName) {
  // Fetch trecena.json, cache if new
}

export async function downloadImage(imagePath) {
  // Download and cache image, return local path
}

export async function getCachedTodayData(day) {
  // Get cached today data for specific day
}

export async function getCachedTrecenaData(trecenaName) {
  // Get cached trecena data
}
```

## Local Development Setup

### Option 1: Simple HTTP Server (Recommended for Testing)

**Using Python:**
```bash
# In project root
python3 -m http.server 3000
```

**Using Node.js:**
```bash
npx http-server -p 3000
```

**Directory structure:**
```
project-root/
  public/
    api/
      today.json
      trecenas/
        trecena-aqabal.json
    images/
      trecena-aqabal/
        1/
          horoscope.jpg
          story_primary.jpg
          ...
        2/
          ...
```

### Option 2: Express Server (More Control)

Create `server.js`:
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use('/api', express.static('public/api'));
app.use('/images', express.static('public/images'));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Option 3: Use Existing Backend

If you have a backend already, point API_BASE_URL to it.

## Production Hosting Options

### Option 1: Static File Hosting (Simplest)

**Services:**
- **Vercel** - Free tier, easy setup
- **Netlify** - Free tier, CDN included
- **AWS S3 + CloudFront** - Scalable, pay-as-you-go
- **GitHub Pages** - Free, but no custom domain on free tier

**Setup:**
1. Upload JSON files to `/api/` directory
2. Upload images to `/images/` directory
3. Configure CDN domain (e.g., `cdn.meowtin.com`)

### Option 2: API Server

**Services:**
- **Railway** - Easy deployment
- **Render** - Free tier available
- **Fly.io** - Good for global distribution
- **AWS Lambda + API Gateway** - Serverless

**Benefits:**
- Can add authentication later
- Can add analytics
- Can serve dynamic content

### Recommendation

Start with **static file hosting** (Vercel/Netlify) for simplicity:
- Easy to set up
- Free tier sufficient for testing
- Can migrate to API server later if needed

## Image Optimization

### Display Images (Optimized)

- **Format:** WebP or optimized JPEG
- **Size:** ~50-150KB each
- **Dimensions:** Match device screen sizes
- **Compression:** 80-85% quality

### Sharing Images (High Quality)

- **Format:** PNG or high-quality JPEG
- **Size:** ~500KB-2MB each
- **Dimensions:** 1200x1200px or higher (for social media)
- **Compression:** 95-100% quality

### Image Processing

**Tools:**
- **Sharp** (Node.js) - Server-side processing
- **ImageMagick** - Command-line tool
- **Online tools** - Squoosh.app, TinyPNG

**Workflow:**
1. Create high-quality source images
2. Generate optimized versions for display
3. Keep high-quality versions for sharing
4. Upload both to CDN

## Migration Steps

### Phase 1: Setup Environment
1. Install `expo-constants` or `react-native-config`
2. Create `utils/config.js`
3. Create `.env` files
4. Test environment switching

### Phase 2: Create API Client
1. Create `utils/api.js` with base URL handling
2. Create `utils/cache.js` for caching
3. Create `utils/dataService.js` for data fetching

### Phase 3: Update Data Layer
1. Modify `utils/mayanCalendar.js` to use API
2. Add loading/error states
3. Implement day comparison logic

### Phase 4: Update UI Components
1. Update `App.js` with loading state
2. Update screens to handle async data
3. Add error handling and retry logic

### Phase 5: Image Handling
1. Implement image downloading
2. Implement image caching
3. Update image source handling

### Phase 6: Testing
1. Test with local server
2. Test day transitions
3. Test offline scenarios
4. Test image caching

### Phase 7: Production
1. Set up production hosting
2. Upload JSON files
3. Upload images
4. Update environment config
5. Test production build

## Error Handling

### Network Errors
- Show user-friendly error message
- Retry automatically (3 attempts)
- Fall back to cached data if available

### Cache Errors
- Log error, continue with network fetch
- Don't block app initialization

### Image Loading Errors
- Show placeholder image
- Retry in background
- Log error for debugging

## Performance Considerations

### Initial Load
- Show loading state immediately
- Fetch today.json first (smallest, fastest)
- Download only horoscope image initially
- Show Today screen as soon as possible

### Background Loading
- Load trecena.json in background
- Download images progressively
- Pre-fetch next day's images (optional)

### Caching
- Cache aggressively for current trecena
- Purge old trecena data after 7 days
- Keep image cache size reasonable (~50MB max)

## Security Considerations

### API Endpoints
- Consider adding API keys for production (future)
- Use HTTPS in production
- Validate JSON responses

### Image URLs
- Validate image paths
- Sanitize file names
- Prevent path traversal attacks

## Future Enhancements

1. **Analytics** - Track which days are viewed most
2. **Push Notifications** - Notify users of new day
3. **Offline Mode** - Full offline support with background sync
4. **Image Preloading** - Pre-fetch images for better UX
5. **Compression** - ZIP archives for images (if needed)
6. **CDN Optimization** - Multiple CDN regions for global users

## Questions to Resolve

1. **Server Setup:** Which hosting solution will you use?
2. **Image Format:** WebP vs JPEG for display images?
3. **Image Dimensions:** What sizes for different image types?
4. **Caching Duration:** How long to keep previous trecena data?
5. **Error Recovery:** What should happen if server is down?

## Notes

- All image paths in JSON are relative (no domain)
- Base URL determined by environment variable
- Simple day number comparison for today.json
- No complex versioning needed
- Sharing uses server URLs directly (no download needed)

