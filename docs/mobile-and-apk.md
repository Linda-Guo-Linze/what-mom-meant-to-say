# Mobile, PWA, and APK route

## Current release

The responsive web app uses the same interface on desktop and mobile. Its web-app manifest allows supported Android browsers to add it to the home screen and open it in a standalone window. This is the fastest cross-platform route and does not require an app-store account.

## Android APK after web release

The validated web app can be wrapped with Capacitor or packaged as a Trusted Web Activity. The UI and server API remain shared. An Android phone can install a signed APK directly after the user explicitly permits installation from that source. Direct installation does not require Google Play, but Play distribution requires a Google Play Console account and its current registration requirements.

APK packaging is intentionally a post-release step because the public HTTPS deployment URL, application identifier, signing strategy, and ownership details must be final first. Those choices affect update continuity and should not be guessed.

## iPhone and iPad

iOS cannot install an APK. The cross-platform no-account option is **Add to Home Screen** in Safari. A native iOS package distributed through TestFlight or the App Store requires Apple tooling, signing, and an Apple Developer account.

## Speech on phones

The app calls the browser's `speechSynthesis` interface and prefers an installed English voice. Availability and exact voice quality depend on the browser and operating system. No voice file is uploaded and no voice-cloning model is used.
