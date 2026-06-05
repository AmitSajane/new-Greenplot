# iOS Pod Install Fix

## Issue
You're encountering a `LoadError - cannot load such file -- ffi_c` error when running `pod install`. This is due to Ruby 2.6.10 compatibility issues with newer gem versions.

## Solutions

### Option 1: Use System CocoaPods (Quick Fix)

If you have CocoaPods installed system-wide, try using it directly:

```bash
cd ios
pod install
```

If this works, you can proceed with building the iOS app.

### Option 2: Upgrade Ruby (Recommended)

Install a newer Ruby version using Homebrew and rbenv:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install rbenv
brew install rbenv ruby-build

# Install Ruby 3.0+
rbenv install 3.0.0

# Set as local version
cd /Users/apple/Desktop/AI/new-Greenplot
rbenv local 3.0.0

# Install gems
gem install bundler
bundle install

# Run pod install
cd ios
bundle exec pod install
```

### Option 3: Manual Fix for ffi Gem

Try rebuilding the ffi gem for your architecture:

```bash
# Remove existing ffi
gem uninstall ffi

# Reinstall ffi
arch -x86_64 gem install ffi
# OR
arch -arm64 gem install ffi

# Then try pod install again
cd ios
pod install
```

### Option 4: Use CocoaPods via Homebrew

```bash
# Install CocoaPods via Homebrew
brew install cocoapods

# Run pod install
cd ios
pod install
```

## Temporary Workaround

If you need to proceed immediately and the above don't work, you can:

1. **Skip iOS for now** - The Android build should work fine
2. **Build Android first**: `npm run android`
3. **Fix iOS setup later** when you have time to upgrade Ruby

## Verification

After fixing, verify the setup:

```bash
cd ios
pod install
# Should complete without errors
```

Then build the iOS app:

```bash
npm run ios
```

## Notes

- The Mapbox SDK will be automatically linked once pod install succeeds
- You'll still need to set your Mapbox access token in `src/screens/SatelliteMapScreen.tsx`
- See `MAPBOX_SETUP.md` for token configuration
