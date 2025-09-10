# Android Setup and APK Build Script for Flutter
# This script helps set up Android development environment and build the APK

Write-Host "=== Flutter Android Setup and Build Script ===" -ForegroundColor Green

# Check if Flutter is installed
Write-Host "Checking Flutter installation..." -ForegroundColor Yellow
try {
    $flutterVersion = flutter --version
    Write-Host "Flutter found: $($flutterVersion.Split("`n")[0])" -ForegroundColor Green
} catch {
    Write-Host "Flutter not found. Please install Flutter first." -ForegroundColor Red
    exit 1
}

# Check if Android SDK is available
Write-Host "Checking for Android SDK..." -ForegroundColor Yellow
$androidHome = $env:ANDROID_HOME
if (-not $androidHome -or -not (Test-Path $androidHome)) {
    Write-Host "Android SDK not found. You need to install Android Studio or Android SDK." -ForegroundColor Red
    Write-Host ""
    Write-Host "Options to install Android SDK:" -ForegroundColor Yellow
    Write-Host "1. Install Android Studio (Recommended)" -ForegroundColor Cyan
    Write-Host "   Download from: https://developer.android.com/studio"
    Write-Host ""
    Write-Host "2. Install Android SDK Tools only" -ForegroundColor Cyan
    Write-Host "   Download command line tools from: https://developer.android.com/studio#command-tools"
    Write-Host ""
    Write-Host "After installation, set ANDROID_HOME environment variable to SDK path" -ForegroundColor Yellow
    Write-Host "Example: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor Cyan
    Write-Host ""
    
    # Ask if user wants to continue with setup guide
    $response = Read-Host "Would you like to see the complete setup guide? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "=== Complete Android Setup Guide ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "1. Download and Install Android Studio:" -ForegroundColor Yellow
        Write-Host "   - Go to https://developer.android.com/studio"
        Write-Host "   - Download Android Studio"
        Write-Host "   - Run the installer and follow the setup wizard"
        Write-Host "   - Make sure to install Android SDK during setup"
        Write-Host ""
        Write-Host "2. Set Environment Variables:" -ForegroundColor Yellow
        Write-Host "   - Open System Properties -> Environment Variables"
        Write-Host "   - Add new system variable:"
        Write-Host "     Variable name: ANDROID_HOME"
        Write-Host "     Variable value: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
        Write-Host "   - Add to PATH: %ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
        Write-Host ""
        Write-Host "3. Install Required SDK Components:" -ForegroundColor Yellow
        Write-Host "   - Open Android Studio"
        Write-Host "   - Go to Tools > SDK Manager"
        Write-Host "   - Install Android SDK Platform 33 (or latest)"
        Write-Host "   - Install Android SDK Build-Tools"
        Write-Host "   - Install Android SDK Platform-Tools"
        Write-Host ""
        Write-Host "4. Accept Android Licenses:" -ForegroundColor Yellow
        Write-Host "   - Run: flutter doctor --android-licenses"
        Write-Host "   - Accept all licenses by typing 'y'"
        Write-Host ""
        Write-Host "5. Verify Setup:" -ForegroundColor Yellow
        Write-Host "   - Run: flutter doctor"
        Write-Host "   - All Android toolchain items should show green checkmarks"
        Write-Host ""
        Write-Host "6. Build APK:" -ForegroundColor Yellow
        Write-Host "   - Navigate to project directory"
        Write-Host "   - Run: flutter build apk"
        Write-Host ""
    }
    
    exit 1
}

# Android SDK found, continue with build
Write-Host "Android SDK found at: $androidHome" -ForegroundColor Green

# Run Flutter doctor to check setup
Write-Host "Running Flutter doctor..." -ForegroundColor Yellow
flutter doctor

# Check if there are any issues
Write-Host "If Flutter doctor shows any issues, please resolve them first." -ForegroundColor Yellow
$continueResponse = Read-Host "Continue with build? (y/n)"
if ($continueResponse -ne 'y' -and $continueResponse -ne 'Y') {
    Write-Host "Build cancelled." -ForegroundColor Red
    exit 1
}

# Get dependencies
Write-Host "Getting Flutter dependencies..." -ForegroundColor Yellow
flutter pub get

# Build APK
Write-Host "Building APK..." -ForegroundColor Yellow
flutter build apk --release

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== BUILD SUCCESSFUL ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK built successfully!" -ForegroundColor Green
    Write-Host "Location: build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor Cyan
    
    # Show APK info
    $apkPath = "build\app\outputs\flutter-apk\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length
        $apkSizeMB = [math]::Round($apkSize / 1MB, 2)
        Write-Host "APK Size: $apkSizeMB MB" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "You can now install this APK on your Android device:" -ForegroundColor Yellow
    Write-Host "1. Transfer the APK file to your Android device" -ForegroundColor Cyan
    Write-Host "2. Enable 'Unknown Sources' in device settings" -ForegroundColor Cyan
    Write-Host "3. Install the APK by tapping on it" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "=== BUILD FAILED ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "The APK build failed. Please check the error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Missing Android SDK components" -ForegroundColor Cyan
    Write-Host "- Android licenses not accepted" -ForegroundColor Cyan
    Write-Host "- Gradle issues" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Try running 'flutter doctor' to diagnose issues." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script completed." -ForegroundColor Green