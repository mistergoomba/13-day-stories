# Icon and Asset Requirements for Play Store

## Current Status ✅

Your icons are properly configured for Play Store:

- **App Icon** (`assets/icon.png`): 1024x1024 PNG ✅
- **Adaptive Icon** (`assets/adaptive-icon.png`): 1024x1024 PNG ✅
- **Splash Screen** (`assets/splash.png`): 1024x1536 PNG ✅

## Play Store Requirements

### App Icon
- **Size**: 512x512px minimum (1024x1024px recommended)
- **Format**: PNG (32-bit with alpha channel)
- **Shape**: Square (will be automatically masked by Play Store)
- **Your status**: ✅ 1024x1024 - Perfect!

### Adaptive Icon (Android)
- **Size**: 1024x1024px
- **Format**: PNG (32-bit with alpha channel)
- **Safe zone**: Keep important content within 512x512px center area
- **Your status**: ✅ 1024x1024 - Perfect!

### Feature Graphic (Store Listing)
- **Size**: 1024x500px
- **Format**: PNG or JPG
- **Purpose**: Displayed at top of Play Store listing
- **Your status**: ⚠️ Need to create this for store listing

### Screenshots
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots
- **Phone**: 16:9 or 9:16 aspect ratio, min 320px, max 3840px
- **Tablet** (if supported): 16:9 or 9:16 aspect ratio
- **Your status**: ⚠️ Need to capture screenshots

## Splash Screen

Your splash screen is configured in `app.json`:
- **Image**: `assets/splash.png` (1024x1536)
- **Background Color**: `#12091A`
- **Resize Mode**: `cover`

This is fine for the app, but Play Store also needs:
- **Feature Graphic**: 1024x500px (different from splash)

## Recommendations

1. **Icons are good** - No changes needed ✅
2. **Create Feature Graphic** - 1024x500px for Play Store listing
3. **Capture Screenshots** - Take 2-8 screenshots of your app
4. **Optimize if needed** - Current icons are 1.5MB each, but that's acceptable for Play Store

## Icon Optimization (Optional)

If you want to reduce icon file sizes further:

```bash
# Using ImageMagick (if installed)
convert assets/icon.png -strip -quality 95 assets/icon-optimized.png
convert assets/adaptive-icon.png -strip -quality 95 assets/adaptive-icon-optimized.png

# Or use online tools like TinyPNG
```

However, 1.5MB for 1024x1024 icons is reasonable and won't significantly impact your app size since they're only included once.

## Summary

✅ **Icons**: Ready for Play Store
⚠️ **Feature Graphic**: Need to create (1024x500px)
⚠️ **Screenshots**: Need to capture (2-8 images)

