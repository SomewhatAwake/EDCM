#!/bin/bash

echo "Elite Dangerous Fleet Carrier Companion App Setup"
echo "================================================"

echo ""
echo "Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install server dependencies"
    exit 1
fi

echo ""
echo "Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install client dependencies"
    exit 1
fi

echo ""
echo "Setting up environment files..."
cd ../server
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please configure your settings"
fi

echo ""
echo "Creating directories..."
mkdir -p data
mkdir -p logs

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure server/.env with your Elite Dangerous paths"
echo "2. Configure client/src/config.js with your server URL"
echo "3. Start the server: npm run dev (in server directory)"
echo "4. Start the client: npx react-native run-android (in client directory)"
echo ""
