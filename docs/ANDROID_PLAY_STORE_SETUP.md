# Android Play Store Setup Guide

## Overview

This guide covers how to build and publish your app to the Google Play Store using Closed Testing.

## Prerequisites

1. **Google Play Console Account**
   - Sign up at https://play.google.com/console
   - Pay the one-time $25 registration fee
   - Complete developer account setup

2. **EAS Build Account**
   - Ensure you're logged in: `eas login`
   - Your project is already configured with EAS (see `eas.json`)

3. **App Signing Key**
   - EAS will handle this automatically for production builds
   - For manual builds, you'll need to create a keystore (not recommended)

## Build Configuration

### Current Setup

The project is configured with:
- **Production builds**: Android App Bundle (AAB) format (required for Play Store)
- **Preview builds**: APK format (for testing)
- **Optimizations enabled**: Minification, resource shrinking, bundle compression

### Build Commands

```bash
# Build for production (creates AAB for Play Store)
npm run build:android

# Or using EAS directly
eas build --platform android --profile production

# Build preview/development APK for testing
eas build --platform android --profile preview
```

## Size Optimizations Applied

To keep the build size as small as possible, we've implemented:

1. **Architecture Optimization**
   - Only ARM architectures (armeabi-v7a, arm64-v8a)
   - Removed x86/x86_64 (rare on modern Android devices)
   - **Estimated savings**: ~30-40% reduction in native library size

2. **Code Optimization**
   - Minification enabled (`android.enableMinifyInReleaseBuilds=true`)
   - Resource shrinking enabled (`android.enableShrinkResourcesInReleaseBuilds=true`)
   - Bundle compression enabled (`android.enableBundleCompression=true`)
   - ProGuard rules configured

3. **Asset Optimization**
   - Images loaded from CDN (not bundled)
   - Only fallback images bundled locally
   - Large development folders excluded from bundle

4. **Metro Bundler Optimization**
   - Console statements removed in production
   - Dead code elimination
   - Tree shaking enabled

## Google Play Console Setup

### Step 1: Create App Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - **App name**: "13-Day Stories"
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free (or Paid if you have IAP)
   - **Declarations**: Complete all required sections

### Step 2: Set Up Closed Testing Track

1. In your app dashboard, go to **Testing** → **Closed testing**
2. Click **"Create new release"**
3. Upload your AAB file (from `eas build`)
4. Fill in release notes
5. Click **"Save"** (don't publish yet)

### Step 3: Create Tester List

**Option A: Email List (Recommended for Small Groups)**

1. In **Closed testing** → **Testers** tab
2. Click **"Create email list"**
3. Name it (e.g., "Friends & Family")
4. Add email addresses (one per line or comma-separated)
5. Click **"Save list"**
6. Assign this list to your closed testing track

**Option B: Google Group (Recommended for Larger Groups)**

1. Create a Google Group at https://groups.google.com
2. Add members to the group
3. In Play Console → **Closed testing** → **Testers**
4. Select **"Google Groups"**
5. Enter your group email address
6. Assign to the testing track

### Step 4: Configure Testing Track

1. Go to **Closed testing** → **Testers** tab
2. Under **"How testers join your test"**, select:
   - **"Email addresses"** (if using email list)
   - **"Google Groups"** (if using Google Group)
3. Add your tester list/group
4. Click **"Save changes"**

### Step 5: Complete Store Listing

Before you can publish, complete:

1. **Store listing**
   - App icon (1024x1024px)
   - Feature graphic (1024x500px)
   - Screenshots (at least 2, up to 8)
   - Short description (80 chars max)
   - Full description (4000 chars max)
   - Privacy policy URL (required)

2. **Content rating**
   - Complete questionnaire
   - Get rating certificate

3. **App access**
   - Declare if app is restricted

4. **Ads**
   - Declare if app contains ads (you have Google Mobile Ads)

5. **Data safety**
   - Complete data safety form
   - Declare data collection practices

6. **Target audience**
   - Set age group

### Step 6: Review and Publish

1. Go to **Closed testing** → **Releases**
2. Review your release
3. Click **"Review release"**
4. If everything looks good, click **"Start rollout to Closed testing"**

## Testing Your App

### For Testers

1. Testers will receive an email invitation (if using email list)
2. They need to:
   - Accept the invitation
   - Join the Google Group (if using that method)
   - Click the opt-in link in the email
3. Once opted in, they can:
   - Find your app in Play Store by searching
   - Or use the direct link: `https://play.google.com/apps/internaltest/[YOUR_APP_ID]`

### Testing Checklist

Before publishing to closed testing, verify:

- [ ] App builds successfully
- [ ] AAB file is generated (not APK)
- [ ] App version code is incremented
- [ ] All features work correctly
- [ ] Images load from CDN
- [ ] Notifications work (if applicable)
- [ ] IAP works (if applicable)
- [ ] Ads display correctly
- [ ] No console errors in production build

## Version Management

### Version Code

Update in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1  // Increment for each release
    versionName "1.0.0"  // User-facing version
}
```

### Version Name

Also update in `app.json` if you want consistency:

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

**Important**: Each upload to Play Store must have a higher `versionCode` than the previous one.

## Build Size Monitoring

### Check Build Size

After building, EAS will show you the build size. Typical targets:
- **AAB size**: < 50MB (Play Store limit is 150MB)
- **Download size**: < 30MB (what users actually download)

### Further Optimization (if needed)

If your build is still too large:

1. **Optimize assets**:
   ```bash
   # Check asset sizes
   find assets -type f -exec ls -lh {} \; | sort -h
   
   # Consider converting large PNGs to WebP
   # Or reducing resolution for splash/icon images
   ```

2. **Remove unused dependencies**:
   ```bash
   npm ls --depth=0
   # Review and remove unused packages
   ```

3. **Enable Hermes** (already enabled):
   - Hermes is more efficient than JSC
   - Already configured in `gradle.properties`

4. **Use App Bundle** (already configured):
   - AAB allows Play Store to serve optimized APKs
   - Users only download what they need

## Troubleshooting

### Build Fails

- Check EAS build logs: `eas build:list`
- Verify `eas.json` configuration
- Ensure all dependencies are compatible

### Upload Fails

- Verify AAB format (not APK)
- Check version code is incremented
- Ensure signing is correct (EAS handles this)

### Testers Can't Access

- Verify they accepted the invitation
- Check they're using the correct Google account
- Ensure the release is published (not just saved)

### App Size Too Large

- Review asset sizes
- Check for large dependencies
- Consider lazy loading
- Use CDN for images (already implemented)

## Next Steps After Closed Testing

Once you're ready for wider release:

1. **Open testing**: Test with a larger group
2. **Production**: Full public release
3. **Staged rollout**: Gradual release (1% → 5% → 20% → 100%)

## Resources

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

## Quick Reference

```bash
# Build for Play Store
npm run build:android

# Or
eas build --platform android --profile production

# Submit to Play Store (after manual upload, or use EAS Submit)
eas submit --platform android --profile production
```

---

**Note**: This guide assumes you're using EAS Build. For local builds, you'll need to set up signing keys manually, which is not recommended for production.

