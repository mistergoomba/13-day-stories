# Monetization Implementation Game Plan

## Overview

**Strategy:** Hybrid revenue model with ad-supported free tier and premium paid tier.

### A. Ad-Supported (Free Tier)
- **Provider:** Google AdMob (`react-native-google-mobile-ads`)
- **Placement:** Bottom banner ad (always visible unless user has premium)
- **No interstitials** (for now - may add later if opportunities arise)

### B. Premium (Paid Tier)
- **Provider:** `react-native-iap`
- **Pricing:** ~$4.99 Lifetime
- **Perks:** 
  - Remove all ads
  - Unlock AI Oracle feature

---

## Prerequisites

### 1. Install Required Packages

```bash
npm install react-native-google-mobile-ads react-native-iap
```

**Note:** These packages work with Expo SDK 54, but NOT with Expo Go. Since we're using dev client/metro for testing, this is fine.

### 2. Set Up AdMob Account

1. Go to [Google AdMob](https://admob.google.com/)
2. Create account and app
3. Create banner ad unit
4. Get your ad unit IDs:
   - iOS Banner Ad Unit ID
   - Android Banner Ad Unit ID

### 3. Set Up In-App Purchases

#### iOS (App Store Connect)
1. Go to App Store Connect → Your App → Features → In-App Purchases
2. Create new "Non-Consumable" product
3. Product ID: `com.mistergoomba.x13daystories.premium.lifetime`
4. Set price: $4.99
5. Add product description and metadata

#### Android (Google Play Console)
1. Go to Google Play Console → Your App → Monetize → Products → In-app products
2. Create new product
3. Product ID: `com.mistergoomba.x13daystories.premium.lifetime`
4. Set price: $4.99
5. Add product description

---

## Implementation Steps

### Step 1: Create Premium Manager Utility

**File:** `utils/premiumManager.js`

Manages premium status in AsyncStorage.

**Key Functions:**
- `isPremium()` - Check if user has premium
- `setPremium(isPremium)` - Set premium status

**Storage Key:** `@premium_status`

---

### Step 2: Create Ad Manager Utility

**File:** `utils/adManager.js`

Handles AdMob initialization and ad display logic.

**Key Functions:**
- `initialize()` - Initialize AdMob SDK
- `shouldShowAds()` - Check if ads should be shown (returns false if premium)

**Configuration:**
- Replace test ad unit IDs with real ones from AdMob console
- Platform-specific ad unit IDs (iOS vs Android)

---

### Step 3: Create IAP Manager Utility

**File:** `utils/iapManager.js`

Handles in-app purchase logic and restore purchases.

**Key Functions:**
- `initialize()` - Initialize IAP connection and set up listeners
- `getProducts()` - Fetch product info from stores
- `purchaseLifetimePremium()` - Initiate purchase flow
- `restorePurchases()` - Restore purchases from stores
- `handlePurchase(purchase)` - Process successful purchase
- `cleanup()` - Clean up listeners on unmount

**Product ID:** `com.mistergoomba.x13daystories.premium.lifetime`

**Important Notes:**
- Restore purchases queries App Store/Play Store for user's purchase history
- Must call `finishTransaction()` after processing purchase (required by stores)
- Purchase listeners handle automatic status updates

---

### Step 4: Create Banner Ad Component

**File:** `components/AdBanner.js`

Displays banner ad at bottom of screen.

**Behavior:**
- Only shows if user is NOT premium
- Automatically hides when premium status changes
- Uses `BannerAdSize.ANCHORED_ADAPTIVE_BANNER` for responsive sizing
- Re-checks premium status when app comes to foreground

**Styling:**
- Matches app background color
- Positioned above bottom toolbar

---

### Step 5: Update App.js

**File:** `App.js`

**Changes:**
1. Import `AdBanner`, `AdManager`, and `IAPManager`
2. Add initialization `useEffect` hook:
   - Initialize AdMob on mount
   - Initialize IAP on mount
   - Clean up IAP listeners on unmount
3. Add `<AdBanner />` component in JSX:
   - Place right before `<SimpleBottomToolbar />`
   - Will automatically show/hide based on premium status

---

### Step 6: Update Settings Screen

**File:** `screens/SettingsScreenContent.js`

**Changes:**
1. Import `PremiumManager` and `IAPManager`
2. Add state:
   - `isPremium` - Current premium status
   - `premiumProduct` - Product info (for price display)
   - `isRestoring` - Loading state for restore
3. Add `useEffect` to check premium status on mount
4. Add handlers:
   - `handlePurchasePremium()` - Initiate purchase
   - `handleRestorePurchases()` - Restore purchases with user feedback
5. Add Premium Card section:
   - If premium: Show "✓ Premium Active" with benefits
   - If not premium: Show purchase button with price + "Restore Purchases" button

**UI Structure:**
```
Premium Card
├── If Premium:
│   ├── "✓ Premium Active"
│   └── Benefits text
└── If Not Premium:
    ├── "Unlock Premium - $4.99" (purchase button)
    ├── Benefits text
    └── "Restore Purchases" button
```

---

## File Structure

```
utils/
├── premiumManager.js      (NEW - Premium status management)
├── adManager.js            (NEW - AdMob initialization & logic)
└── iapManager.js           (NEW - In-app purchase logic)

components/
└── AdBanner.js             (NEW - Banner ad component)

screens/
└── SettingsScreenContent.js (MODIFY - Add premium section)

App.js                      (MODIFY - Initialize & add AdBanner)
```

---

## Configuration Checklist

### AdMob Configuration
- [ ] Create AdMob account
- [ ] Add app to AdMob
- [ ] Create iOS banner ad unit
- [ ] Create Android banner ad unit
- [ ] Get ad unit IDs
- [ ] Replace test IDs in `utils/adManager.js`

### IAP Configuration
- [ ] Create iOS product in App Store Connect
- [ ] Create Android product in Google Play Console
- [ ] Set product ID: `com.mistergoomba.x13daystories.premium.lifetime`
- [ ] Set price: $4.99
- [ ] Add product descriptions
- [ ] Replace product ID in `utils/iapManager.js` if different

### App Configuration
- [ ] Update `app.json` if needed for AdMob/IAP permissions
- [ ] Test on iOS device (IAP requires real device)
- [ ] Test on Android device (IAP requires real device)

---

## Testing Checklist

### AdMob Testing
- [ ] Banner ad displays for free users
- [ ] Banner ad hides after premium purchase
- [ ] Banner ad stays hidden after app restart (premium persists)
- [ ] Banner ad shows correct ad unit (not test ads in production)
- [ ] Test ads work in development (use test IDs)

### IAP Testing
- [ ] Purchase flow works on iOS
- [ ] Purchase flow works on Android
- [ ] Premium status updates immediately after purchase
- [ ] Ads disappear immediately after purchase
- [ ] Restore purchases works on iOS
- [ ] Restore purchases works on Android
- [ ] Premium persists after app restart
- [ ] Premium persists after app reinstall (via restore)
- [ ] Error handling works (user cancels, network errors, etc.)

### Edge Cases
- [ ] App works offline (ads won't load, but app functions)
- [ ] Premium status syncs across app state changes
- [ ] Restore purchases shows appropriate messages
- [ ] Purchase button disabled during purchase flow
- [ ] Restore button shows loading state

---

## How Restore Purchases Works

1. **User taps "Restore Purchases"** → App calls `IAPManager.restorePurchases()`
2. **IAP library queries stores** → `react-native-iap` queries App Store/Play Store for user's purchase history
3. **App checks purchase history** → Looks for premium product ID in returned purchases
4. **App updates local status** → If found, sets premium status in AsyncStorage
5. **UI updates automatically** → Banner ad hides, premium UI shows

**Important:** The stores handle purchase verification. Your app just queries and applies the status locally.

---

## Future Considerations

### Potential Additions
- **Interstitial ads** - If good opportunities arise (e.g., after completing a chapter)
- **Rewarded ads** - Optional ad viewing for temporary premium features
- **Subscription model** - If lifetime doesn't work well, consider monthly/yearly

### AI Oracle Feature
- This is the premium feature that needs to be implemented
- Should be gated behind `PremiumManager.isPremium()` check
- Add UI/UX for AI Oracle access

---

## Notes

- **Expo Compatibility:** Works with Expo SDK 54, but NOT Expo Go (we use dev client)
- **Testing:** IAP requires real devices - cannot test in simulator/emulator
- **AdMob Test IDs:** Use test IDs during development, replace with real IDs before production
- **Purchase Verification:** For production, consider adding server-side verification for security
- **Banner Placement:** Always at bottom, above toolbar, unless premium
- **No Interstitials:** For now, only banner ads. Can add interstitials later if needed

---

## Implementation Order

1. ✅ Install packages
2. ✅ Create utility files (`premiumManager.js`, `adManager.js`, `iapManager.js`)
3. ✅ Create `AdBanner` component
4. ✅ Update `App.js` (initialize + add banner)
5. ✅ Update `SettingsScreenContent.js` (premium section)
6. ✅ Configure AdMob (get real ad unit IDs)
7. ✅ Configure IAP (create products in stores)
8. ✅ Test on iOS device
9. ✅ Test on Android device
10. ✅ Replace test IDs with production IDs
11. ✅ Deploy

---

## Troubleshooting

### Ads Not Showing
- Check AdMob initialization
- Verify ad unit IDs are correct
- Check premium status (ads won't show if premium)
- Ensure app is connected to internet

### IAP Not Working
- Must test on real device (not simulator)
- Verify product IDs match store configuration
- Check that products are approved in stores
- Ensure app is signed with correct certificates

### Premium Status Not Persisting
- Check AsyncStorage permissions
- Verify `setPremium()` is being called
- Check for errors in console
- Test restore purchases functionality

