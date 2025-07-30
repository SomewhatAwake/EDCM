@echo off
echo Starting Elite Dangerous Carrier Companion Development
echo ======================================================

echo.
echo Starting Metro bundler...
cd /d "d:\wbunk0\OneDrive - Department of Education\Carrier Manager\client"
start "Metro Bundler" cmd /k "npx metro start --reset-cache"

echo.
echo Starting Node.js server...
cd /d "d:\wbunk0\OneDrive - Department of Education\Carrier Manager\server"
start "Node Server" cmd /k "npm run dev"

echo.
echo Development servers started!
echo.
echo Metro Bundler: Running in separate window
echo Node Server: Running in separate window
echo.
echo Next: Run "npm run android" in the client directory when Android setup is complete
echo.
pause
