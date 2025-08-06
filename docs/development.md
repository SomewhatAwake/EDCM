# Development Guide - Elite Dangerous Carrier Manager

## 🚀 Overview

This guide covers setting up the development environment for the Elite Dangerous Carrier Manager, including the Node.js server and Flutter client with modern tooling and best practices.

## 📋 Prerequisites

### Required Software

1. **Node.js** (v16 or higher) ⚡
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Flutter** (v3.8.1 or higher) 📱
   - Follow [Flutter installation guide](https://docs.flutter.dev/get-started/install)
   - Verify: `flutter doctor`

3. **Git** 🔧
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **Visual Studio Code** (Recommended) 💻
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Install Flutter/Dart extensions

### Android Development Setup

1. **Android Studio** 📱
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API level 30+)
   - Set up AVD (Android Virtual Device)

2. **Environment Variables**
   ```powershell
   # Add to your system PATH
   ANDROID_HOME=C:\Users\[Username]\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Android\Android Studio\jre
   ```

## 🛠️ Project Setup

### 1. Repository Setup
```powershell
# Clone the repository
git clone <repository-url>
cd "Carrier Manager"

# Quick setup with automated script
.\setup.ps1
```

### 2. Manual Development Setup

#### Server Development
```powershell
cd server

# Install dependencies
npm install

# Install development tools (optional)
npm install -g nodemon

# Copy environment template
copy .env.example .env

# Start development server
npm run dev  # Auto-restart on changes
```

#### Flutter Development  
```powershell
cd edcm

# Install dependencies
flutter pub get

# Generate JSON serialization code
dart run build_runner build

# Run code generation in watch mode (development)
dart run build_runner watch

# Run the app
flutter run  # Hot reload enabled
```

## ⚙️ Development Configuration

### Server Environment (.env)
```env
# Development Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Elite Dangerous Paths (adjust for your system)
ED_JOURNAL_PATH=C:/Users/YourUsername/Saved Games/Frontier Developments/Elite Dangerous
ED_INSTALL_PATH=C:/Program Files (x86)/Steam/steamapps/common/Elite Dangerous

# JWT Configuration
JWT_SECRET=development-secret-change-in-production
JWT_EXPIRES_IN=24h

# Database
DB_PATH=./data/carrier.db

# Optional: Override network settings (advanced)
# USE_TAILSCALE=false
# TAILSCALE_HOSTNAME=100.x.x.x
```

### Flutter Configuration (app_config.dart)
```dart
class AppConfig {
  // Network Configuration - Edit for development
  static const bool useTailscale = false; // Set to false for local dev
  static const String tailscaleHostname = '100.103.140.29';
  static const String tailscalePort = '3000';
  
  // Local Development Endpoints
  static const String localAndroidEmulator = 'http://10.0.2.2:3000';
  static const String localNetworkIP = 'http://192.168.1.100:3000'; // Your IP
  
  // Debug logging
  static const bool enableDebugLogging = true;
}
```

## 🏗️ Project Architecture

### Server Structure
```
server/
├── src/
│   ├── index.js           # Main server entry point
│   ├── database/          # SQLite database management
│   ├── middleware/        # Express middleware (auth, cors, etc.)
│   ├── routes/           # API routes (auth, carrier)
│   └── services/         # Business logic services
├── data/                 # SQLite database files
├── logs/                 # Application logs
└── package.json          # Dependencies and scripts
```

### Flutter Client Structure  
```
edcm/
├── lib/
│   ├── main.dart                # App entry point
│   ├── config/                  # Configuration management
│   │   ├── app_config.dart      # Default settings
│   │   └── network_config.dart  # Network configuration
│   ├── models/                  # Data models with JSON serialization
│   ├── providers/               # State management (Provider pattern)
│   ├── screens/                 # UI screens
│   │   ├── login_screen.dart    # Authentication
│   │   ├── dashboard_screen.dart # Main carrier view
│   │   ├── connection_test_screen.dart # Network diagnostics
│   │   └── settings_screen.dart # In-app configuration
│   └── services/               # API and WebSocket services
├── android/                    # Android-specific files
└── pubspec.yaml               # Flutter dependencies
```

## 🔧 Development Workflow

### Daily Development Setup

1. **Start the server:**
   ```powershell
   cd server
   npm run dev  # Auto-restart on file changes
   ```

2. **Start Flutter with hot reload:**
   ```powershell
   cd edcm
   flutter run  # Hot reload enabled for instant UI updates
   ```

3. **Code generation (when models change):**
   ```powershell
   # In separate terminal
   cd edcm
   dart run build_runner watch  # Auto-regenerate on model changes
   ```

### Testing & Debugging

#### Server Testing
```powershell
# Run server tests
cd server
npm test

# Manual API testing
curl http://10.0.2.2:3000/api/health  # Android emulator
# or curl http://192.168.1.x:3000/api/health  # Your local IP
# or curl http://100.103.140.29:3000/api/health  # Tailscale IP

# Check server logs
type logs\combined.log
```

#### Flutter Testing
```powershell
# Run Flutter tests
cd edcm
flutter test

# Widget tests
flutter test test/widget_test.dart

# Integration tests
flutter drive --target=test_driver/app.dart
```

#### Connection Testing
1. **Use built-in connection test:**
   - Launch app
   - Tap "TEST CONNECTION"
   - Verify all endpoints

2. **Network diagnostics:**
   - Check "NETWORK SETTINGS" 
   - Test different configurations
   - Use refresh button to reload settings

## 🛠️ Development Tools

### Recommended VS Code Extensions

**Flutter/Dart:**
- Flutter (Dart-Code.flutter)
- Dart (Dart-Code.dart-code)

**Node.js/JavaScript:**
- ES7+ React/Redux/React-Native snippets
- REST Client (for API testing)

**General:**
- GitLens
- Bracket Pair Colorizer
- Auto Rename Tag

### Build Scripts for Development

#### Enhanced Build Script
```powershell
# Interactive build with config options
.\build_app.bat

# Direct development build
cd edcm
flutter run --debug
```

#### Watch Mode for Code Generation
```powershell
# Auto-regenerate JSON serialization on model changes
cd edcm
dart run build_runner watch --delete-conflicting-outputs
```

## 🔧 Configuration Management

### Persistent Settings System

The app uses a three-tier configuration system:

1. **SharedPreferences** (highest priority) - User settings
2. **Environment Variables** - Development overrides  
3. **app_config.dart** - Default fallback values

#### Modifying Default Configuration
Edit `edcm/lib/config/app_config.dart`:

```dart
class AppConfig {
  // For local development, set useTailscale to false
  static const bool useTailscale = false;
  static const String localNetworkIP = 'http://YOUR_IP:3000';
  
  // Enable debug logging for development
  static const bool enableDebugLogging = true;
}
```

#### Runtime Configuration Changes
Use the in-app settings screen:
1. Launch app → "NETWORK SETTINGS"
2. Modify settings as needed
3. Settings persist automatically

### Environment Variable Overrides
For advanced development scenarios:

```powershell
# Override default Tailscale setting
$env:USE_TAILSCALE = "false"

# Override hostname for testing
$env:TAILSCALE_HOSTNAME = "192.168.1.100"

# Run with overrides
flutter run
```

## 🐛 Common Development Issues & Solutions

### Server Issues

1. **Port Already in Use**
   ```powershell
   # Find process using port 3000
   netstat -ano | findstr :3000
   # Kill process (replace PID)
   taskkill /PID <process-id> /F
   ```

2. **Journal File Access Denied**
   ```powershell
   # Ensure Elite Dangerous is not running
   # Check file permissions on journal directory
   # Verify ED_JOURNAL_PATH in .env
   ```

3. **Database Connection Issues**
   ```powershell
   # Check if data directory exists
   mkdir server\data
   # Delete and recreate database
   del server\data\carrier.db
   npm run dev  # Will recreate database
   ```

### Flutter Issues

1. **Hot Reload Not Working**
   ```powershell
   # Restart Flutter app
   flutter run
   # Or press 'r' in terminal for hot reload
   # Press 'R' for hot restart
   ```

2. **Build Runner Issues**
   ```powershell
   # Clean and regenerate
   flutter packages pub run build_runner clean
   dart run build_runner build --delete-conflicting-outputs
   ```

3. **Android Build Failures**
   ```powershell
   # Clean Flutter build
   flutter clean
   flutter pub get
   
   # Clean Android build  
   cd android
   .\gradlew clean
   ```

4. **Network Configuration Issues**
   - Use connection test screen to diagnose
   - Check firewall settings
   - Verify IP addresses in app_config.dart
   - Try different network endpoints

## 📝 Code Style & Best Practices

### Flutter/Dart Guidelines
- Use `const` constructors where possible
- Follow Dart naming conventions (camelCase for variables)
- Implement proper error handling with try-catch
- Use `async`/`await` for asynchronous operations
- Leverage Provider for state management

### Node.js Guidelines  
- Use ES6+ features (arrow functions, destructuring)
- Implement proper middleware patterns
- Use Winston for structured logging
- Handle errors with proper HTTP status codes
- Follow RESTful API conventions

### Git Workflow
```powershell
# Feature development
git checkout -b feature/carrier-management
git add .
git commit -m "feat: add carrier service management"
git push origin feature/carrier-management
```

## 🔍 Debugging & Monitoring

### Server Debugging
```powershell
# Enable debug logging
# In .env: LOG_LEVEL=debug

# View real-time logs
Get-Content server\logs\combined.log -Wait

# API testing
curl http://10.0.2.2:3000/api/health  # Android emulator
# or curl http://192.168.1.x:3000/api/health  # Your local IP
# or curl http://100.103.140.29:3000/api/health  # Tailscale IP
```

### Flutter Debugging
```powershell
# Run with debugging enabled
flutter run --debug

# Hot reload: press 'r'
# Hot restart: press 'R'  
# Open dev tools: press 'w' (web) or use VS Code debugger
```

### Network Debugging
1. **Connection Test Screen** - Built-in diagnostics
2. **Settings Screen** - Verify current configuration  
3. **Server Logs** - Check incoming requests
4. **Chrome DevTools** - Inspect network requests

## 📚 Documentation & Resources

### Project Documentation
- **[Installation Guide](installation.md)** - Setup instructions
- **[API Reference](api.md)** - REST API documentation
- **[Elite Dangerous Integration](elite-dangerous-integration.md)** - Game integration

### External Resources
- **[Flutter Documentation](https://docs.flutter.dev/)**
- **[Node.js Documentation](https://nodejs.org/docs/)**
- **[Elite Dangerous Journal Documentation](https://elite-journal.readthedocs.io/)**
- **[Tailscale Documentation](https://tailscale.com/kb/)**

## 🎯 Next Steps

After completing development setup:

1. **Explore the codebase** - Understand the architecture
2. **Make a small change** - Test the development workflow
3. **Run all tests** - Ensure everything works
4. **Set up Tailscale** - Test remote access functionality
5. **Review API documentation** - Understand available endpoints

---

**Happy coding!** 🚀 Your Elite Dangerous Carrier Manager development environment is ready!

2. **Database Connection Issues**
   - Check data directory permissions
   - Verify SQLite installation
   - Clear database and restart

3. **Journal Monitoring Issues**
   - Verify Elite Dangerous path
   - Check file permissions
   - Ensure Elite Dangerous is running

### Client Issues

1. **Metro Bundler Issues**
   ```bash
   cd client
   npx react-native start --reset-cache
   ```

2. **Android Build Issues**
   ```bash
   cd client/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **Connection Issues**
   - Check server URL configuration
   - Verify server is running
   - Check firewall settings

## Performance Monitoring

### Server Performance
- Monitor CPU and memory usage
- Track database query performance
- Monitor WebSocket connections
- Log response times

### Client Performance
- Use React Native Performance Monitor
- Track render times
- Monitor memory usage
- Optimize image loading

## Code Quality Tools

### Linting
```bash
# Server
cd server
npm run lint

# Client
cd client
npm run lint
```

### Type Checking (If using TypeScript)
```bash
npm run type-check
```

### Code Formatting
```bash
npm run format
```

## Deployment Preparation

### Build for Production

#### Server
```bash
cd server
npm install --production
NODE_ENV=production npm start
```

#### Client
```bash
cd client
npx react-native run-android --variant=release
```

### Environment Setup
1. Configure production environment variables
2. Set up proper SSL certificates
3. Configure reverse proxy (nginx)
4. Set up monitoring and logging

## Resources

### Documentation
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

### Elite Dangerous
- [Elite Dangerous Journal Documentation](https://elite-journal.readthedocs.io/)
- [Elite Dangerous Community](https://www.reddit.com/r/EliteDangerous/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Mobile app debugging
