@echo off
:: Build scripts for Elite Dangerous Carrier Manager (Windows)
:: This script helps build different configurations of the app

echo Elite Dangerous Carrier Manager - Build Helper
echo ==============================================

:: Check if configuration file exists
if not exist "edcm\lib\config\app_config.dart" (
    echo Error: Configuration file not found!
    echo Please make sure edcm\lib\config\app_config.dart exists.
    pause
    exit /b 1
)

:: Show current configuration
echo.
echo Current Configuration:
findstr /C:"useTailscale" edcm\lib\config\app_config.dart
findstr /C:"tailscaleHostname" edcm\lib\config\app_config.dart
echo.

:menu
echo.
echo Select build type:
echo 1) Build with current config (recommended)
echo 2) Build for local development (override config)
echo 3) Build for Tailscale (override config) 
echo 4) Build debug version
echo 5) Edit configuration file
echo 6) Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto build_current
if "%choice%"=="2" goto build_local
if "%choice%"=="3" goto build_tailscale
if "%choice%"=="4" goto build_debug
if "%choice%"=="5" goto edit_config
if "%choice%"=="6" goto exit
echo Invalid choice. Please try again.
goto menu

:build_current
echo Building with current configuration...
cd edcm
flutter build apk
echo Build complete: build\app\outputs\flutter-apk\app-release.apk
goto end

:build_local
echo Building for local development (overriding config)...
cd edcm
flutter build apk --dart-define=USE_TAILSCALE=false
echo Local build complete: build\app\outputs\flutter-apk\app-release.apk
goto end

:build_tailscale
set /p tailscale_host="Enter your Tailscale hostname or IP (default: 100.103.140.29): "
if "%tailscale_host%"=="" set tailscale_host=100.103.140.29
set /p tailscale_port="Enter port (default 3000): "
if "%tailscale_port%"=="" set tailscale_port=3000

echo Building for Tailscale with host: %tailscale_host%:%tailscale_port%
cd edcm
flutter build apk --dart-define=USE_TAILSCALE=true --dart-define=TAILSCALE_HOSTNAME=%tailscale_host% --dart-define=TAILSCALE_PORT=%tailscale_port%
echo Tailscale build complete: build\app\outputs\flutter-apk\app-release.apk
goto end

:build_debug
echo Building debug version...
cd edcm
flutter build apk --debug
echo Debug build complete: build\app\outputs\flutter-apk\app-debug.apk
goto end

:edit_config
echo Opening configuration file for editing...
start notepad edcm\lib\config\app_config.dart
echo.
echo Configuration file opened in Notepad.
echo After making changes, you can build with option 1.
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0

:end
echo.
echo Build complete! Install the APK on your device to test.
echo.
echo Tips:
echo - Use option 1 for most builds (uses your saved config)
echo - Edit config with option 5 to change default settings
echo - Use options 2-3 to temporarily override settings
echo.
pause
