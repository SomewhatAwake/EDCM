@echo off
echo Elite Dangerous Fleet Carrier Companion App Setup
echo ================================================

echo.
echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo Setting up environment files...
cd ..\server
if not exist .env (
    copy .env.example .env
    echo Created .env file - please configure your settings
)

echo.
echo Creating directories...
if not exist data mkdir data
if not exist logs mkdir logs

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Configure server/.env with your Elite Dangerous paths
echo 2. Configure client/src/config.js with your server URL
echo 3. Start the server: npm run dev (in server directory)
echo 4. Start the client: npx react-native run-android (in client directory)
echo.
pause
