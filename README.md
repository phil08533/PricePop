# PricePop

A React Native / Expo price-guessing game. Players guess Amazon product prices across three game modes, build streaks, climb leaderboards, and unlock achievements. Monetised via Amazon Associates affiliate links and Google AdMob.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the App](#running-the-app)
5. [Project Structure](#project-structure)
6. [Production Builds (EAS)](#production-builds-eas)
7. [App Store Submission](#app-store-submission)
8. [Required Credentials Checklist](#required-credentials-checklist)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS or later | https://nodejs.org |
| npm | bundled with Node | — |
| Expo CLI | latest | `npm i -g expo` |
| EAS CLI | latest | `npm i -g eas-cli` |
| Git | any | https://git-scm.com |

Optional for native builds (not needed for Expo Go):
- **Android Studio** (Android emulator / production builds)
- **Xcode 16+** (iOS simulator / production builds — Mac only)

---

## Local Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd PricePop

# 2. Install dependencies
npm install

# 3. Align all package versions to the installed Expo SDK
npx expo install --fix

# 4. Copy the example env file and fill in your credentials (see next section)
cp .env.example .env
```

---

## Environment Configuration

All runtime credentials are passed via `app.json → extra`. You have two options:

### Option A — Edit app.json directly (simplest)

Open `app.json` and replace every `YOUR_*` and `XXXXXXXX` placeholder:

```jsonc
"extra": {
  "firebase": {
    "apiKey":             "AIza...",
    "authDomain":         "your-project.firebaseapp.com",
    "projectId":          "your-project-id",
    "storageBucket":      "your-project.appspot.com",
    "messagingSenderId":  "123456789",
    "appId":              "1:123456789:web:abc123",
    "measurementId":      "G-XXXXXXX"
  },
  "amazon": {
    "affiliateTag": "your-tag-20"
  },
  "admob": {
    "bannerAdUnitId":        "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    "rewardedAdUnitId":      "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX",
    "interstitialAdUnitId":  "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
  },
  "eas": {
    "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

Also update the top-level native config placeholders:

```jsonc
"ios": {
  "config": {
    "googleSignIn": { "reservedClientId": "com.googleusercontent.apps.YOUR_CLIENT_ID" },
    "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  },
  "googleServicesFile": "./GoogleService-Info.plist"   // drop your real file here
},
"android": {
  "config": {
    "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  },
  "googleServicesFile": "./google-services.json"       // drop your real file here
},
"plugins": [
  ["react-native-google-mobile-ads", {
    "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
    "iosAppId":     "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
  }],
  ["@react-native-google-signin/google-signin", {
    "iosUrlScheme": "com.googleusercontent.apps.YOUR_CLIENT_ID"
  }]
]
```

### Option B — .env file (for CI / team)

Create a `.env` file at the project root (already git-ignored):

```
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

`firebase.ts` already reads from `process.env` as a fallback when `Constants.expoConfig.extra.firebase` is not set.

### Legal page URLs

Open `app/(tabs)/profile.tsx` and replace the `LEGAL_URLS` constants at the top with your hosted URLs:

```ts
const LEGAL_URLS = {
  privacyPolicy:       'https://yourdomain.com/privacy-policy',
  affiliateDisclosure: 'https://yourdomain.com/affiliate-disclosure',
  termsOfService:      'https://yourdomain.com/terms-of-service',
};
```

---

## Running the App

### Expo Go (quickest — no native modules)

Requires Expo Go app on your phone (SDK 54).

```bash
npx expo start
```

Then either:
- **Scan the QR code** with Expo Go on your phone
- Press **`a`** to open an Android emulator
- Press **`w`** to open in the browser

> Note: Google Ads and Google Sign-In will not work in Expo Go because they require native modules. Everything else (game logic, Firebase, leaderboards, profile) works normally.

### Development build (full native features)

A development build is a custom version of Expo Go that includes all your native modules. Required to test ads and Google Sign-In.

```bash
# Build the dev client (first time only — takes ~10 min on EAS servers)
npm run build:dev

# Then start the dev server targeting it
npx expo start --dev-client
```

### Android emulator (local)

```bash
npx expo run:android
```

### iOS simulator (Mac only)

```bash
npx expo run:ios
```

---

## Project Structure

```
app/                    Expo Router screens
  (auth)/               Login, Register, Welcome
  (tabs)/               Home, Leaderboard, Profile
  game/                 Play, Results, Product Reveal
  onboarding/           Onboarding carousel
  legal.tsx             WebView for Privacy Policy / Terms
  _layout.tsx           Root navigation stack

src/
  components/
    ads/                BannerAd, RewardedAdModal
    common/             XPProgressBar
  constants/            Theme, game config, app constants
  hooks/                useHaptics
  services/             Firebase auth, Firestore, affiliate links
  stores/               Zustand state (auth, game)
  types/                TypeScript interfaces
  utils/                Formatters

functions/              Firebase Cloud Functions
scripts/                Product seeding script
```

---

## Production Builds (EAS)

### First-time EAS setup

```bash
# Log in to your Expo account
eas login

# Link the project to EAS (generates projectId)
eas init

# Copy the generated projectId into app.json → extra → eas → projectId
```

### Building

```bash
# Production build (uploads to App Store Connect / Play Store automatically)
npm run build:prod

# Preview build (internal distribution — great for TestFlight / internal testing)
npm run build:preview
```

### Required files for production builds

| File | Where to get it |
|------|----------------|
| `GoogleService-Info.plist` | Firebase Console → iOS app → download config |
| `google-services.json` | Firebase Console → Android app → download config |

Place both files in the project root before building.

---

## App Store Submission

### iOS

1. Ensure you have an **Apple Developer account** ($99/yr).
2. Create the app in **App Store Connect**.
3. Fill in `eas.json → submit → production → ios`:
   ```jsonc
   "appleId":    "you@example.com",
   "ascAppId":   "1234567890",   // App Store Connect App ID
   "appleTeamId":"ABCDE12345"
   ```
4. Run: `npm run submit:ios`

### Android

1. Ensure you have a **Google Play Console** account ($25 one-time).
2. Create the app in the Play Console.
3. Download a **service account JSON key** with "Release manager" permissions.
4. Save it as `google-play-service-account.json` in the project root.
5. Run: `npm run submit:android`

> The production `eas.json` currently builds an APK (`"buildType": "apk"`). Change this to `"aab"` for Google Play Store submissions (AAB is required for new apps).

---

## Required Credentials Checklist

Before going live, confirm every item below is configured:

### Firebase
- [ ] Firebase project created at https://console.firebase.google.com
- [ ] Authentication enabled (Email/Password, Google Sign-In)
- [ ] Firestore database created (start in production mode, add security rules)
- [ ] `GoogleService-Info.plist` downloaded and placed in project root
- [ ] `google-services.json` downloaded and placed in project root
- [ ] All `firebase.*` values filled in `app.json → extra → firebase`

### Google Sign-In
- [ ] OAuth 2.0 client ID created in Google Cloud Console
- [ ] `reservedClientId` (iOS URL scheme) filled in `app.json`
- [ ] SHA-1 fingerprint added to Firebase Android app (for prod builds)

### Google AdMob
- [ ] AdMob account created at https://admob.google.com
- [ ] App registered in AdMob for both iOS and Android
- [ ] AdMob App IDs filled in `app.json` (both `googleMobileAdsAppId` fields and the plugin block)
- [ ] Three ad units created: Banner, Rewarded, Interstitial
- [ ] Ad unit IDs filled in `app.json → extra → admob`

### Amazon Associates
- [ ] Amazon Associates account approved
- [ ] Affiliate tag filled in `app.json → extra → amazon → affiliateTag`

### Legal pages
- [ ] Privacy Policy hosted at a public URL
- [ ] Affiliate Disclosure hosted at a public URL
- [ ] Terms of Service hosted at a public URL
- [ ] `LEGAL_URLS` in `app/(tabs)/profile.tsx` updated with real URLs

### EAS / App Stores
- [ ] `eas login` completed
- [ ] `eas init` run and `projectId` added to `app.json`
- [ ] Apple Developer account set up and `eas.json → submit → production → ios` filled in
- [ ] Google Play service account JSON downloaded and placed in project root
- [ ] Android `buildType` changed to `"aab"` in `eas.json` for Play Store submission

---

## Seeding Products

To populate the Firestore `products` collection with sample data:

```bash
# Ensure FIREBASE_* env vars are set, then:
npm run seed
```

---

## Linting & Type Checking

```bash
npm run lint
npm run typecheck
```
