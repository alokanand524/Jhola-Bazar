@echo off
echo Starting EAS APK Build Process...
echo.

echo Step 1: Checking EAS CLI installation...
eas --version
if %errorlevel% neq 0 (
    echo Installing EAS CLI...
    npm install -g @expo/eas-cli
)

echo.
echo Step 2: Logging into EAS...
eas login

echo.
echo Step 3: Building APK...
eas build -p android --profile preview --clear-cache

echo.
echo Build process completed!
echo Check your EAS dashboard for the APK download link.
pause