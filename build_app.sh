#!/bin/bash

# Build scripts for Elite Dangerous Carrier Manager
# This script helps build different configurations of the app

echo "Elite Dangerous Carrier Manager - Build Helper"
echo "=============================================="

# Function to build for local development
build_local() {
    echo "Building for local development..."
    cd edcm
    flutter build apk --dart-define=USE_TAILSCALE=false
    echo "Local build complete: build/app/outputs/flutter-apk/app-release.apk"
}

# Function to build for Tailscale
build_tailscale() {
    read -p "Enter your Tailscale hostname or IP: " tailscale_host
    read -p "Enter port (default 3000): " tailscale_port
    tailscale_port=${tailscale_port:-3000}
    
    echo "Building for Tailscale with host: $tailscale_host:$tailscale_port"
    cd edcm
    flutter build apk \
        --dart-define=USE_TAILSCALE=true \
        --dart-define=TAILSCALE_HOSTNAME=$tailscale_host \
        --dart-define=TAILSCALE_PORT=$tailscale_port
    echo "Tailscale build complete: build/app/outputs/flutter-apk/app-release.apk"
}

# Function to build debug version
build_debug() {
    echo "Building debug version..."
    cd edcm
    flutter build apk --debug
    echo "Debug build complete: build/app/outputs/flutter-apk/app-debug.apk"
}

# Main menu
echo ""
echo "Select build type:"
echo "1) Local development (emulator/WiFi)"
echo "2) Tailscale (secure remote)"
echo "3) Debug build"
echo "4) Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        build_local
        ;;
    2)
        build_tailscale
        ;;
    3)
        build_debug
        ;;
    4)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "Build complete! Install the APK on your device to test."
