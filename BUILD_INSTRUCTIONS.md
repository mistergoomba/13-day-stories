# Building and Distributing Your App

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

