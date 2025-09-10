@echo off
echo === Flutter APK Build Script ===
echo.

REM Check if we're in the right directory
if not exist "pubspec.yaml" (
    echo Error: This script must be run from the Flutter project directory
    echo Make sure you're in the mobile-scanner folder
    pause
    exit /b 1
)

REM Check Flutter installation
echo Checking Flutter installation...
flutter --version >nul 2>&1
if errorlevel 1 (
    echo Error: Flutter not found. Please install Flutter first.
    pause
    exit /b 1
)

REM Check Android SDK
echo Checking Android SDK...
if "%ANDROID_HOME%"=="" (
    echo Error: ANDROID_HOME environment variable not set
    echo Please install Android Studio and set ANDROID_HOME to your SDK path
    echo Example: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
    echo.
    echo Download Android Studio from: https://developer.android.com/studio
    pause
    exit /b 1
)

if not exist "%ANDROID_HOME%" (
    echo Error: Android SDK not found at %ANDROID_HOME%
    echo Please check your ANDROID_HOME environment variable
    pause
    exit /b 1
)

echo Android SDK found at: %ANDROID_HOME%
echo.

REM Run Flutter doctor
echo Running Flutter doctor...
flutter doctor
echo.

REM Get dependencies
echo Getting Flutter dependencies...
flutter pub get
if errorlevel 1 (
    echo Error: Failed to get dependencies
    pause
    exit /b 1
)

REM Build APK
echo Building APK...
flutter build apk --release
if errorlevel 1 (
    echo Error: APK build failed
    pause
    exit /b 1
)

echo.
echo === BUILD SUCCESSFUL ===
echo.
echo APK built successfully!
echo Location: build\app\outputs\flutter-apk\app-release.apk
echo.
echo You can now install this APK on your Android device.
echo.
pause