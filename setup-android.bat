@echo off
echo Setting up Android Development Environment
echo ==========================================

echo.
echo Setting JAVA_HOME to OpenJDK 17...
setx JAVA_HOME "C:\Program Files\Microsoft\jdk-17.0.12.7-hotspot" /M
set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.12.7-hotspot

echo.
echo Setting Android SDK paths...
REM Default Android Studio SDK location
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M
setx ANDROID_SDK_ROOT "%LOCALAPPDATA%\Android\Sdk" /M

REM Add Android tools to PATH
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\tools;%LOCALAPPDATA%\Android\Sdk\tools\bin" /M

echo.
echo Environment variables set! Please restart your terminal or VS Code.
echo.
echo Next steps:
echo 1. Open Android Studio
echo 2. Install Android SDK API 33 or 34
echo 3. Create an Android Virtual Device (AVD)
echo 4. Run: npx react-native doctor (to verify setup)
echo.
pause
