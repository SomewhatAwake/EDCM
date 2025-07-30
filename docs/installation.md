# Installation Guide

## Prerequisites

### Server Requirements
- Node.js 16 or higher
- NPM or Yarn package manager
- Elite Dangerous installation (for journal monitoring)

### Client Requirements
- React Native development environment
- Android Studio (for Android development)
- Java Development Kit (JDK) 8 or higher
- Android SDK

## Server Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   CLIENT_ORIGIN=http://localhost:8081
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   ED_JOURNAL_PATH=C:/Users/YourUsername/Saved Games/Frontier Developments/Elite Dangerous
   ED_INSTALL_PATH=C:/Program Files (x86)/Steam/steamapps/common/Elite Dangerous
   DB_PATH=./data/carrier.db
   LOG_LEVEL=info
   ```

4. **Create necessary directories:**
   ```bash
   mkdir data
   mkdir logs
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:3000`

## Client Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure server connection:**
   Edit `src/config.js` and update the server URL:
   ```javascript
   export const API_BASE_URL = 'http://your-server-ip:3000';
   ```

4. **Install React Native CLI (if not already installed):**
   ```bash
   npm install -g react-native-cli
   ```

5. **Set up Android development environment:**
   - Install Android Studio
   - Set up Android SDK
   - Create an Android Virtual Device (AVD) or connect a physical device

6. **Start Metro bundler:**
   ```bash
   npx react-native start
   ```

7. **Run the Android app:**
   ```bash
   npx react-native run-android
   ```

## Elite Dangerous Configuration

### Journal File Location

The server monitors Elite Dangerous journal files to detect carrier events. Ensure the `ED_JOURNAL_PATH` in your `.env` file points to the correct directory:

**Default locations:**
- **Steam:** `C:/Users/[Username]/Saved Games/Frontier Developments/Elite Dangerous`
- **Epic:** `C:/Users/[Username]/Saved Games/Frontier Developments/Elite Dangerous`
- **Standalone:** `C:/Users/[Username]/Saved Games/Frontier Developments/Elite Dangerous`

### Game Integration

The server can interface with Elite Dangerous through:

1. **Journal File Monitoring** (Automatic)
   - Real-time monitoring of game events
   - Automatic carrier data updates

2. **Command Execution** (Manual Implementation Required)
   - Key sequence automation
   - Game window interaction
   - Custom keybind integration

## Security Configuration

### JWT Secret

**Important:** Change the JWT secret in production:

```env
JWT_SECRET=your-unique-super-secret-key-here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### HTTPS/WSS (Production)

For production deployment, configure HTTPS and WSS:

1. Obtain SSL certificates
2. Update server configuration
3. Update client configuration

### Firewall Configuration

Ensure the following ports are accessible:
- Server: Port 3000 (or your configured port)
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
