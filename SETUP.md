# PricePop — Setup Guide

## Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli eas-cli`
- Firebase project (free Spark plan works to start)
- Amazon Associates account

---

## 1. Install Dependencies
```bash
npm install
```

## 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable:
   - **Authentication** → Email/Password + Google + Apple
   - **Firestore** → Start in production mode
   - **Storage**
   - **Analytics**
4. Copy your config into `app.json` → `extra.firebase`

### Deploy Firebase Rules & Functions
```bash
npm install -g firebase-tools
firebase login
firebase init  # select Firestore, Storage, Functions, Emulators
firebase deploy --only firestore:rules,storage,firestore:indexes
```

### Deploy Cloud Functions
```bash
cd functions && npm install && npm run build
firebase deploy --only functions
```

## 3. Google Sign-In Setup

1. Firebase Console → Authentication → Sign-in methods → Google → Enable
2. Download `google-services.json` (Android) → place in project root
3. Download `GoogleService-Info.plist` (iOS) → place in project root
4. Update `app.json` → `ios.googleServicesFile` and `android.googleServicesFile`

## 4. Apple Sign-In Setup (iOS Required)

1. Apple Developer Console → Certificates → Identifiers
2. Enable "Sign In with Apple" capability for your App ID
3. Firebase Console → Authentication → Apple → Enable
4. Add your bundle ID `com.pricepop.app`

## 5. Amazon Associates Setup

1. Sign up at [Amazon Associates](https://affiliate-program.amazon.com)
2. Get your affiliate tag (e.g., `yourname-20`)
3. Update `app.json` → `extra.amazon.affiliateTag`
4. Update `scripts/seedProducts.ts` → `AFFILIATE_TAG`
5. Update `functions/src/index.ts` → `AFFILIATE_TAG`

## 6. AdMob Setup (for real ads)

1. Create account at [Google AdMob](https://admob.google.com)
2. Create app for iOS and Android
3. Create ad units: Banner, Rewarded, Interstitial
4. Update `app.json` → `extra.admob.*`
5. Update `src/constants/index.ts` → `ADMOB.*`

**iOS ATT Prompt**: Already configured in `app.json` infoPlist.
The `NSUserTrackingUsageDescription` string is required for iOS 14.5+.

## 7. Seed Products

```bash
# Download firebase-admin-key.json from Firebase Console
# Project Settings → Service Accounts → Generate new private key
npm run seed
```

## 8. EAS Build Setup

```bash
eas login
eas build:configure
```

Update `eas.json` with your Apple credentials.

### Build for Testing
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Production Build
```bash
eas build --platform all --profile production
```

### Submit to Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## 9. Run Locally

```bash
# In Expo Go (limited — some native modules won't work)
npx expo start

# Full native dev build (recommended)
eas build --platform ios --profile development
eas build --platform android --profile development
```

---

## Environment Variables Quick Reference

| Config location | Value to set |
|---|---|
| `app.json` → `extra.firebase.*` | Firebase project config |
| `app.json` → `extra.amazon.affiliateTag` | Your Amazon affiliate tag |
| `app.json` → `extra.admob.*` | AdMob ad unit IDs |
| `app.json` → `ios.config.googleMobileAdsAppId` | AdMob iOS App ID |
| `app.json` → `android.config.googleMobileAdsAppId` | AdMob Android App ID |
| `app.json` → `extra.eas.projectId` | EAS project ID from `eas init` |
| `scripts/seedProducts.ts` → `AFFILIATE_TAG` | Amazon affiliate tag |

---

## App Store Compliance Checklist

- [x] Privacy policy placeholder (link in Settings screen)
- [x] Affiliate disclosure on results screen + Settings
- [x] Age-appropriate content only
- [x] No gambling mechanics (skill-based game)
- [x] ATT prompt configured for iOS
- [x] Apple Sign-In implemented (required for apps with social login on iOS)
- [ ] Privacy policy live URL — add before submission
- [ ] Terms of service live URL — add before submission

---

## Monetization Activation Checklist

- [ ] Amazon Associates account approved + tag set
- [ ] AdMob account created + real ad unit IDs set
- [ ] Test ads with TestIds.* before switching to real IDs
- [ ] ATT prompt tested on real iOS device
- [ ] IAP (Remove Ads) — add via `expo-in-app-purchases` when ready

---

## Scaling Notes

- Product pool scales to thousands with Firestore + indexes
- Cloud Functions handle daily challenge generation automatically
- Leaderboard cleanup runs weekly to keep costs low
- Anti-cheat: score ceiling + round time validation on server
- Move heavy logic to Cloud Functions as traffic grows
