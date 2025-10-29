# Navigation setup

This project includes a simple React Navigation setup (files under `src/navigation/`) and example screens under `src/screens/`.

Files added
- `src/navigation/AppNavigator.tsx` — root NavigationContainer with two stacks (Auth and Main).
- `src/navigation/AuthStack.tsx` — Splash, Login, Register stack.
- `src/navigation/MainTabNavigator.tsx` — Bottom tab with Home, Business, Profile, Settings.
- `src/screens/*` — example screens for each route.

How to install required packages

React Navigation requires several packages. From the project root run one of the following (choose npm or yarn):

# npm
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# yarn
# yarn add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
# yarn add react-native-screens react-native-safe-area-context

After installing native deps, for iOS run:

cd ios && pod install && cd ..

Quick notes
- If you use Expo, follow the Expo-specific installation instructions from react-navigation docs.
- The code uses TypeScript types for navigation param lists; install `@types/react`/`@types/react-native` if needed for your setup.
- The `SplashScreen` currently mocks an auth flow by navigating to `Login` after a short timeout — replace with your real auth logic.

