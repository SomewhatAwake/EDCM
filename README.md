# Elite Dangerous Carrier Manager (EDCM)

A modern companion app for Elite Dangerous that provides **secure remote management** of Fleet Carriers through a Flutter Android interface with **Tailscale VPN integration** for worldwide access.

## 🚀 Features

### 🖥️ Server Component
- **Real-time journal monitoring** - Automatically tracks Elite Dangerous events
- **REST API & WebSocket** - Full carrier management capabilities
- **JWT Authentication** - Secure user management system
- **Tailscale Integration** - Zero-config secure remote access
- **SQLite Database** - Persistent data storage
- **Comprehensive Logging** - Winston-based logging system

### 📱 Flutter Client
- **Elite Dangerous-themed UI** - Authentic game-style interface
- **Real-time Updates** - Live carrier status via WebSocket
- **Persistent Configuration** - Settings saved between app sessions
- **Multiple Network Options** - Local, WiFi, and Tailscale connectivity
- **Connection Testing** - Built-in diagnostics and troubleshooting
- **In-app Settings** - Easy network configuration management

### 🔐 Security & Access
- **Tailscale VPN** - End-to-end encrypted mesh networking (Recommended)
- **JWT Authentication** - Secure API access with token management
- **Multiple Endpoints** - Automatic failover and connection options
- **No Port Forwarding** - Secure remote access without exposing ports

## 🌐 Network Configuration

The app supports multiple connection methods with **automatic configuration**:

### 🔒 Remote Access (Recommended)
- **Tailscale VPN**: Secure access from anywhere in the world
- **Pre-configured**: Works out-of-the-box with Tailscale IP `100.103.140.29`
- **Zero Configuration**: No environment variables needed
- **Easy Changes**: In-app settings for configuration updates

### 🏠 Local Development
- **Android Emulator**: `10.0.2.2:3000` (automatic)
- **Local Network**: `192.168.68.64:3000` (configurable)
- **Localhost**: `localhost:3000` (testing)

## ⚡ Quick Start

### 1. Automated Setup (Easiest)
```powershell
# Run the complete setup script
.\setup.ps1
```

### 2. Manual Setup

#### Server
```powershell
cd server
npm install
npm start  # or 'npm run dev' for development
```

#### Flutter App
```powershell
cd edcm
flutter pub get
dart run build_runner build  # Generate JSON serialization
flutter run  # Builds with Tailscale enabled by default
```

### 3. Enhanced Build System
```powershell
# Use the interactive build script
.\build_app.bat

# Options available:
# 1) Build with current config (recommended)
# 2) Build for local development  
# 3) Build for Tailscale
# 4) Build debug version
# 5) Edit configuration file
# 6) Show help/documentation
```
## 🛠️ Configuration Management

### Persistent Settings (New!)
The app now features **persistent configuration** that eliminates the need for environment variables:

- **Default Tailscale Config**: Works immediately with IP `100.103.140.29`
- **In-App Settings**: Change network settings from within the app
- **Automatic Persistence**: Settings survive app restarts and rebuilds
- **Environment Override**: Advanced users can still use environment variables

### Settings Access
1. Open the app and go to the **Login Screen**
2. Tap **"NETWORK SETTINGS"** 
3. Configure Tailscale/Local network options
4. Settings are **automatically saved** and persist between sessions

### Configuration Hierarchy
1. **SharedPreferences** (in-app settings) - Highest priority
2. **Environment Variables** - Advanced user override
3. **app_config.dart** - Default fallback values

## 🔧 Development

### Project Structure
```
├── server/           # Node.js backend server
├── edcm/            # Flutter Android application  
├── docs/            # Documentation
├── build_app.bat    # Enhanced build script
└── setup.ps1        # Automated setup script
```

### Key Components
- **`lib/config/`** - Configuration management system
- **`lib/services/`** - API and WebSocket services
- **`lib/screens/`** - UI screens including new Settings screen
- **`lib/providers/`** - State management with Provider pattern

## 🧪 Testing & Debugging

### Connection Testing
Access the built-in connection test tool:
1. Launch the app
2. Tap **"TEST CONNECTION"** on login screen
3. View current configuration and test all endpoints
4. Use **refresh button** to reload settings after changes

### Debug Features
- **Live configuration display** with refresh capability
- **Multiple endpoint testing** (localhost, WiFi, Tailscale)
- **Real-time connection status** indicators
- **Comprehensive error logging** in both client and server

## 📖 Documentation

- **[Installation Guide](docs/installation.md)** - Detailed setup instructions
- **[Development Guide](docs/development.md)** - Development environment setup  
- **[API Documentation](docs/api.md)** - REST API reference
- **[Elite Dangerous Integration](docs/elite-dangerous-integration.md)** - Game integration details

## 🚀 Recent Updates

### v2.0 - Persistent Configuration System
- ✅ **SharedPreferences Integration** - Settings persist between sessions
- ✅ **In-App Settings Screen** - User-friendly configuration management
- ✅ **Enhanced Build Scripts** - Interactive build options with config editing
- ✅ **Automatic Tailscale Setup** - Zero-config remote access
- ✅ **Connection Test Improvements** - Live configuration display with refresh
- ✅ **Cache Management** - Instant setting updates without restart

### Previous Updates
- ✅ **Tailscale VPN Integration** - Secure remote access worldwide
- ✅ **Flutter Migration** - Modern UI framework with native performance
- ✅ **WebSocket Real-time Updates** - Live carrier status monitoring
- ✅ **JSON Serialization** - Efficient data handling with code generation
- ✅ **JWT Authentication** - Secure user management system

## 📝 License

MIT License - Feel free to use and modify for your Elite Dangerous adventures!

---

**Current Status**: ✅ **Fully Functional** with Tailscale remote access and persistent configuration system
