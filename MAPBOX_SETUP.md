# Mapbox Setup Guide

This project uses `@rnmapbox/maps` for satellite map functionality. Follow these steps to set up Mapbox:

## 1. Get a Mapbox Access Token

1. Sign up for a free account at [https://www.mapbox.com](https://www.mapbox.com)
2. Go to your [Account page](https://account.mapbox.com/access-tokens/)
3. Create a new access token or use your default public token
4. Copy your access token

## 2. Configure the Access Token

### Option A: Environment Variable (Recommended)

Create a `.env` file in the project root:

```
MAPBOX_ACCESS_TOKEN=your_token_here
```

Then install `react-native-dotenv` or similar package to load environment variables.

### Option B: Direct Configuration

Update `src/screens/SatelliteMapScreen.tsx`:

```typescript
Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN_HERE');
```

Replace `'YOUR_MAPBOX_ACCESS_TOKEN_HERE'` with your actual token.

## 3. iOS Setup

After installing dependencies, run:

```bash
cd ios
pod install
cd ..
```

The Mapbox SDK will be automatically linked via CocoaPods.

## 4. Android Setup

The Android configuration is already set up in:
- `android/app/src/main/AndroidManifest.xml` - Location permissions added
- `android/app/build.gradle` - Auto-linking handles Mapbox dependencies

## 5. Run the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Notes

- The Mapbox free tier includes 50,000 map loads per month
- For production, consider using environment variables or secure storage for the access token
- The current implementation uses a placeholder token - **you must replace it with your own token**

## Troubleshooting

### Map not loading
- Verify your access token is correct
- Check that location permissions are granted
- Ensure internet connection is available

### Build errors
- Run `cd ios && pod install` for iOS
- Clean build: `cd android && ./gradlew clean` for Android
- Rebuild the app
