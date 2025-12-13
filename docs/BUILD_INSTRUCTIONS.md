# Building and Distributing Your App

## Database Setup (Local Development)

The app uses PostgreSQL for local development to manage trecena data. The database is only used by the `generate-data.js` script and is not deployed.

### Step 1: Install PostgreSQL

Install PostgreSQL on your system:
- **macOS**: `brew install postgresql@14` or download from [postgresql.org](https://www.postgresql.org/download/)
- **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian) or use your package manager
- **Windows**: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Create Database

```bash
# Start PostgreSQL service (if not running)
# macOS with Homebrew:
brew services start postgresql@14

# Linux:
sudo systemctl start postgresql

# Create database
createdb thirteen_day_stories
```

### Step 3: Configure Database Connection

1. Copy the example config file:
   ```bash
   cp database/config.example.json database/config.json
   ```

2. Edit `database/config.json` with your PostgreSQL credentials:
   ```json
   {
     "host": "localhost",
     "port": 5432,
     "database": "thirteen_day_stories",
     "user": "postgres",
     "password": "your_password_here"
   }
   ```

### Step 4: Initialize Database Schema

```bash
# Connect to PostgreSQL and run schema
psql thirteen_day_stories < database/schema.sql
```

Or the schema will be automatically created when you run the migration script.

### Step 5: Migrate Data from JS Files

Import all trecena data from JS files into the database:

```bash
node scripts/migrate-to-database.js
```

This script will:
- Read all `data/trecena-*.js` files
- Insert data into PostgreSQL
- Validate that all 13 days are present for each trecena

### Step 6: Generate JSON Files

After data is in the database, generate the JSON files for deployment:

```bash
npm run generate:data
```

This script will:
- Read trecena data from PostgreSQL
- Process images from `images-hd/` folder (skip already-converted images)
- Extract colors from images and store in database
- Generate JSON files in `cdn/` directory (for local dev and CDN upload)

**Note:** The script will skip images that have already been converted to WebP, making subsequent runs faster.

---

## Quick Start - Build for Android (Easiest)

### Step 1: Login to Expo
```bash
eas login
```
(If you don't have an account, it will prompt you to create one - it's free)

### Step 2: Build Android APK
```bash
eas build --platform android --profile preview
```

This will:
- Build an APK file (Android installable app)
- Upload it to Expo's servers
- Give you a download link

### Step 3: Share the APK
1. After the build completes, you'll get a URL
2. Share that URL with your girlfriend
3. She can download and install it directly on her Android phone

**For Android installation:**
- She'll need to enable "Install from Unknown Sources" in her phone settings
- Then she can download and install the APK

---

## For iOS (More Complex)

### Option 1: TestFlight (Recommended)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```
- Requires Apple Developer account ($99/year)
- Build goes to TestFlight
- She can install via TestFlight app

### Option 2: Development Build
```bash
eas build --platform ios --profile development
```
- Requires registering her device UDID
- More complex setup

---

## Alternative: Expo Go (Quick Testing)

For quick testing without building:
1. Install Expo Go app on her phone (from App Store/Play Store)
2. Run `npm start` on your computer
3. Share the QR code with her
4. She scans it with Expo Go

**Note:** This only works if you're on the same network, and some features may be limited.

---

## Build Profiles Explained

- **preview**: Builds APK for Android (easy to share)
- **production**: Builds for app stores (requires signing)
- **development**: For development builds with custom native code

---

## Tips

1. **First build takes longer** (10-20 minutes) - subsequent builds are faster
2. **Free Expo account** allows builds, but with some limitations
3. **Android APK** is the easiest way to share - no app store needed
4. **Keep your credentials safe** - you'll need them for updates

---

## Troubleshooting

If you get errors:
- Make sure you're logged in: `eas whoami`
- Check your app.json is valid
- Ensure all dependencies are installed: `npm install`

