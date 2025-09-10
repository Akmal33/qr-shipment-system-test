# Flutter Mobile Scanner App

A mobile barcode scanner application for the Warehouse Management System built with Flutter.

## Features

- **QR/Barcode Scanning**: Real-time scanning with camera
- **Offline Support**: Works without internet connection
- **Item Validation**: Validates scanned items against inventory
- **Scan History**: Local storage of all scan activities
- **User Authentication**: Secure login system
- **Haptic Feedback**: Audio and vibration feedback
- **Real-time Sync**: Syncs with server when connected

## Prerequisites

- Flutter SDK 3.10.0 or higher
- Android Studio / Xcode for mobile development
- Android device or emulator with camera

## Installation

1. **Install Flutter dependencies**:
   ```bash
   flutter pub get
   ```

2. **Generate model files**:
   ```bash
   flutter packages pub run build_runner build
   ```

3. **Run the app**:
   ```bash
   flutter run
   ```

## Configuration

### API Endpoints

Update the API endpoints in `lib/services/api_service.dart`:

```dart
static const String baseUrl = 'http://your-scanner-api:8003';
static const String authBaseUrl = 'http://your-dashboard-api:8001';
```

### Permissions

The app requires the following permissions:
- Camera (for scanning)
- Internet (for API calls)
- Storage (for local data)
- Vibration (for feedback)

## Demo Credentials

For testing purposes, you can use:
- **Username**: admin
- **Password**: admin

## Build APK

### Prerequisites for APK Building

Before building the APK, ensure you have:

1. **Android SDK installed**:
   - Install Android Studio from: https://developer.android.com/studio
   - Or install Android SDK command line tools
   - Set ANDROID_HOME environment variable
   - Add Android tools to system PATH

2. **Android licenses accepted**:
   ```bash
   flutter doctor --android-licenses
   ```

3. **Verify setup**:
   ```bash
   flutter doctor
   ```

### Building Methods

#### Method 1: Using Build Scripts (Recommended)

**PowerShell Script** (run from mobile-scanner directory):
```powershell
.\setup-android-and-build.ps1
```

**Batch Script** (run from mobile-scanner directory):
```cmd
build-apk.bat
```

#### Method 2: Manual Build

1. **Get dependencies**:
   ```bash
   flutter pub get
   ```

2. **Build release APK**:
   ```bash
   flutter build apk --release
   ```

3. **Build debug APK** (for testing):
   ```bash
   flutter build apk --debug
   ```

#### Method 3: App Bundle (for Play Store)
```bash
flutter build appbundle --release
```

### Output Location

The built APK will be located at:
```
build/app/outputs/flutter-apk/app-release.apk
```

### Installing the APK

1. **Transfer to Android device** via USB, email, or cloud storage
2. **Enable "Unknown Sources"** in device security settings
3. **Tap the APK file** to install

### Troubleshooting Build Issues

**"No Android SDK found"**:
- Install Android Studio or Android SDK
- Set ANDROID_HOME environment variable
- Add to PATH: `%ANDROID_HOME%\tools` and `%ANDROID_HOME%\platform-tools`

**"Android licenses not accepted"**:
```bash
flutter doctor --android-licenses
```

**Gradle build errors**:
```bash
flutter clean
flutter pub get
flutter build apk --release
```

**Plugin compatibility issues**:
```bash
flutter upgrade
flutter pub upgrade
```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
├── services/                 # API and storage services
├── providers/                # State management
├── screens/                  # UI screens
├── widgets/                  # Reusable widgets
└── utils/                    # Utilities and themes
```

## Key Features

### Barcode Scanning
- Supports QR codes and various barcode formats
- Real-time scanning with overlay
- Flashlight toggle for low light
- Haptic and audio feedback

### Offline Mode
- Local storage of scan history
- Offline validation with cached data
- Automatic sync when connected

### User Interface
- Clean, material design UI
- Dark/light theme support
- Responsive layout
- Intuitive navigation

## Backend Integration

The app communicates with:
- **Scanner API** (Port 8003): For item validation
- **Dashboard API** (Port 8001): For authentication

## Testing

Run tests with:
```bash
flutter test
```

## Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Test on physical device (emulator camera may be limited)

### Network Issues
- Check API endpoints are correct
- Verify backend services are running
- Test with demo credentials first

### Build Issues
- Run `flutter clean` and `flutter pub get`
- Check Flutter doctor: `flutter doctor`