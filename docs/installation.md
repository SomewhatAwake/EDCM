# Installation Guide - Elite Dangerous Carrier Manager

## 🚀 Quick Start (Recommended)

The easiest way to get started is using the automated setup script:

```powershell
# Clone the repository (if not already done)
git clone <repository-url>
cd "Carrier Manager"

# Run the automated setup
.\setup.ps1
```

This script will:
- ✅ Install server dependencies
- ✅ Configure environment variables
- ✅ Install Flutter dependencies
- ✅ Generate required code
- ✅ Set up Tailscale configuration

## 📋 Prerequisites

### System Requirements
- **Windows 10/11** (Primary support)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Flutter 3.8.1+** - [Installation guide](https://docs.flutter.dev/get-started/install)
- **Elite Dangerous** - For journal file monitoring
- **Tailscale Account** - [Free at tailscale.com](https://tailscale.com/)

## 🖥️ Server Setup

### Automated Server Setup
```powershell
cd server
npm install
npm start  # Production mode
# OR
npm run dev  # Development mode with auto-restart
```

### Manual Server Configuration
1. **Install dependencies:**
   ```powershell
   cd server
   npm install
   ```

2. **Configure environment (optional):**
   ```powershell
   # Copy example environment file
   copy .env.example .env
   ```
   
   Edit `.env` file with your paths:
   ```env
   # Elite Dangerous Configuration
   ED_JOURNAL_PATH=C:/Users/YourUsername/Saved Games/Frontier Developments/Elite Dangerous
   ED_INSTALL_PATH=C:/Program Files (x86)/Steam/steamapps/common/Elite Dangerous

   # Server Configuration  
   PORT=3000
   NODE_ENV=development
   
   # Optional: Tailscale Override (usually not needed)
   # TAILSCALE_HOSTNAME=your.tailscale.ip
   ```

3. **Start the server:**
   ```powershell
   npm start
   ```

The server will be available at `http://localhost:3000`

## 📱 Flutter Client Setup

### Automated Client Setup (Recommended)
```powershell
cd edcm
flutter pub get
dart run build_runner build  # Generate JSON serialization
flutter run  # Builds with Tailscale pre-configured
```

### Manual Client Setup

1. **Navigate to Flutter directory:**
   ```powershell
   cd edcm
   ```

2. **Install dependencies:**
   ```powershell
   flutter pub get
   ```

3. **Generate required code:**
   ```powershell
   # Generate JSON serialization classes
   dart run build_runner build
   ```

4. **Build and run:**
   ```powershell
   # Default build (Tailscale enabled)
   flutter run
   
   # Or use the enhanced build script
   ..\build_app.bat
   ```

### 🔧 Enhanced Build Script
Use the interactive build script for different configurations:

```powershell
# From project root
.\build_app.bat
```

**Available options:**
1. **Build with current config** (recommended) - Uses persistent settings
2. **Build for local development** - Override for local testing  
3. **Build for Tailscale** - Override for specific Tailscale config
4. **Build debug version** - Development build with debugging
5. **Edit configuration file** - Modify default settings
6. **Show help/documentation** - Usage information

## 🌐 Network Configuration

### 🔒 Tailscale Setup (Recommended for Remote Access)

**The app comes pre-configured for Tailscale with IP `100.103.140.29`.**

1. **Install Tailscale:**
   - Server: [Download Tailscale](https://tailscale.com/download)
   - Mobile: Install from Play Store/App Store

2. **Setup on server machine:**
   ```powershell
   # Install and authenticate Tailscale
   tailscale up
   # Note your Tailscale IP (usually 100.x.x.x)
   ```

3. **Configure the app (if needed):**
   - Launch the app
   - Tap **"NETWORK SETTINGS"** on login screen
   - Update Tailscale hostname if different from default
   - Settings are automatically saved

### 🏠 Local Development Options
- **Android Emulator**: Uses `10.0.2.2:3000` (automatic)
- **Local WiFi**: Uses `192.168.68.64:3000` (configurable via settings)

## ✅ Verification

### Test Server Connection
1. **Check server status:**
   ```powershell
   # Server should show "Server started on port 3000"
   curl http://localhost:3000/api/health
   ```

2. **Test from app:**
   - Launch the Flutter app
   - Tap **"TEST CONNECTION"** 
   - Verify all endpoints show green status

### Test App Features
1. **Launch the app** - Goes directly to carrier management
2. **Tap "CONNECT TO CARRIER"** to load your carrier data  
3. **Check connection status** - should show "SERVER CONNECTION: ONLINE"
4. **Verify real-time updates** work

## 🎮 Elite Dangerous Integration

### Journal File Monitoring
The server automatically monitors Elite Dangerous journal files for carrier events.

**Default journal location:**
```
C:/Users/[Username]/Saved Games/Frontier Developments/Elite Dangerous
```

**Configuration (if needed):**
Set `ED_JOURNAL_PATH` in server `.env` file to your Elite Dangerous saved games folder.

### Game Integration Features
- ✅ **Real-time carrier status** from journal files
- ✅ **Automatic data updates** when events occur
- ✅ **Carrier location tracking** 
- ✅ **Jump status monitoring**
- ✅ **Service status detection**

## 🔒 Security & Production

### Firewall Configuration
**Required ports:**
- **Server**: Port 3000 (default)
- **Tailscale**: No additional ports needed (mesh network)

**For local network access:**
- Ensure Windows Firewall allows Node.js connections
- Router port forwarding not recommended (use Tailscale instead)

## 🚨 Troubleshooting

### Common Issues

#### "Server Connection: OFFLINE"
1. **Check server is running**: Look for "Server started on port 3000"
2. **Test API endpoint**: `curl http://localhost:3000/api/health`
3. **Check firewall**: Ensure port 3000 is accessible
4. **Network settings**: Use connection test screen to verify endpoints

#### "Failed to connect to Tailscale"
1. **Verify Tailscale status**: `tailscale status` on server
2. **Check IP address**: Update app settings with correct Tailscale IP
3. **Authentication**: Ensure both devices are on same Tailscale network
4. **Refresh config**: Use refresh button in connection test screen

#### Flutter Build Issues
1. **Dependencies**: Run `flutter pub get`
2. **Code generation**: Run `dart run build_runner build`
3. **Clean build**: `flutter clean && flutter pub get`
4. **Android issues**: Check Android SDK setup

### Debug Mode
Enable debug logging:
1. **Server**: Set `LOG_LEVEL=debug` in `.env`
2. **Client**: Use debug build via build script
3. **Network**: Check connection test screen for detailed status

### Getting Help
1. **Check logs**: Server logs in `server/logs/` directory
2. **Connection test**: Use built-in diagnostics
3. **Settings**: Verify configuration in app settings screen

## 📋 Next Steps

After successful installation:

1. **[Read Development Guide](development.md)** - For development setup
2. **[Check API Documentation](api.md)** - For API integration  
3. **[Elite Dangerous Integration](elite-dangerous-integration.md)** - Game-specific features

---

**🎉 Congratulations!** Your Elite Dangerous Carrier Manager is now ready for secure remote carrier management!
- Client: Standard React Native development ports

## Troubleshooting

### Common Issues

1. **Server won't start:**
   - Check Node.js version (`node --version`)
   - Verify all dependencies are installed
   - Check environment variables

2. **Journal monitoring not working:**
   - Verify `ED_JOURNAL_PATH` is correct
   - Ensure Elite Dangerous is running
   - Check file permissions

3. **Client connection issues:**
   - Verify server is running
   - Check `API_BASE_URL` configuration
   - Ensure firewall allows connections

4. **Android build issues:**
   - Verify Android SDK is properly installed
   - Check Java version compatibility
   - Clean and rebuild project

### Logs

Server logs are available in:
- `logs/combined.log` - All log entries
- `logs/error.log` - Error entries only
- Console output - Real-time logging

### Performance

For optimal performance:
- Use a dedicated server for production
- Implement proper database indexing
- Configure appropriate rate limiting
- Monitor resource usage

## Development

### Server Development

```bash
cd server
npm run dev  # Auto-restart on changes
npm test     # Run tests
```

### Client Development

```bash
cd client
npx react-native start  # Start Metro bundler
npx react-native run-android  # Run on Android
```

### Building for Production

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

## Support

For issues and support:
1. Check the troubleshooting section
2. Review log files
3. Verify configuration
4. Check Elite Dangerous compatibility
