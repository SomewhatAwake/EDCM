# Development Setup Guide

## Overview

This guide will help you set up the development environment for the Elite Dangerous Fleet Carrier Companion App.

## Prerequisites

### Required Software

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

3. **Visual Studio Code** (Recommended)
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Android Development (Client)

1. **Java Development Kit (JDK 8 or 11)**
   - Download from [Oracle](https://www.oracle.com/java/technologies/javase-downloads.html) or [OpenJDK](https://openjdk.java.net/)
   - Set JAVA_HOME environment variable

2. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and required tools
   - Set ANDROID_HOME environment variable

3. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd elite-dangerous-carrier-companion
```

### 2. Install Dependencies

#### Server Dependencies
```bash
cd server
npm install
```

#### Client Dependencies
```bash
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment
```bash
cd ../server
cp .env.example .env
```

Edit `.env` file:
```env
NODE_ENV=development
PORT=3000
CLIENT_ORIGIN=http://localhost:8081
JWT_SECRET=your-development-secret-key
JWT_EXPIRES_IN=24h
ED_JOURNAL_PATH=C:/Users/YourUsername/Saved Games/Frontier Developments/Elite Dangerous
ED_INSTALL_PATH=C:/Program Files (x86)/Steam/steamapps/common/Elite Dangerous
DB_PATH=./data/carrier.db
LOG_LEVEL=debug
```

#### Client Configuration
Edit `client/src/config.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3000'; // Server URL
```

### 4. Database Setup

The server will automatically create the SQLite database on first run. Ensure the data directory exists:

```bash
cd server
mkdir data
mkdir logs
```

## Development Workflow

### VS Code Setup

Install recommended extensions:
1. **ES7+ React/Redux/React-Native snippets**
2. **React Native Tools**
3. **Prettier - Code formatter**
4. **ESLint**
5. **GitLens**

### Running the Application

#### Method 1: Using VS Code Tasks

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
3. Type "Tasks: Run Task"
4. Select "Setup Environment" to install all dependencies

Then run individual components:
- "Start Server (Development)" - Runs server with auto-restart
- "Start React Native Metro" - Starts React Native bundler
- "Run Android App" - Builds and runs Android app

#### Method 2: Manual Commands

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - React Native Metro:**
```bash
cd client
npx react-native start
```

**Terminal 3 - Android App:**
```bash
cd client
npx react-native run-android
```

## Development Best Practices

### Code Style

#### JavaScript/React Native
- Use ESLint and Prettier for consistent formatting
- Follow React Hooks patterns
- Use functional components over class components
- Implement proper error boundaries

#### Node.js
- Use async/await over callbacks
- Implement proper error handling
- Use middleware for common functionality
- Follow RESTful API conventions

### Git Workflow

1. **Branching Strategy:**
   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b bugfix/issue-description
   ```

2. **Commit Messages:**
   ```
   feat: add carrier jump functionality
   fix: resolve websocket connection issue
   docs: update API documentation
   style: format code with prettier
   ```

3. **Pull Requests:**
   - Create descriptive PR titles
   - Include testing instructions
   - Link related issues

### Testing

#### Server Testing
```bash
cd server
npm test
```

#### Client Testing
```bash
cd client
npm test
```

### Debugging

#### Server Debugging
1. Use VS Code debugger with Node.js configuration
2. Add breakpoints in source code
3. Use `console.log` for quick debugging
4. Check log files in `server/logs/`

#### Client Debugging
1. Use React Native Debugger
2. Enable Chrome DevTools
3. Use Flipper for advanced debugging
4. Check Metro bundler logs

#### Elite Dangerous Integration Debugging
1. Monitor journal files manually
2. Use test journal entries
3. Verify file permissions
4. Check Elite Dangerous game state

## Environment Variables

### Development vs Production

#### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=development-secret-key
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=secure-production-key
```

### Security Considerations

1. **Never commit sensitive data**
2. **Use different secrets for dev/prod**
3. **Implement proper input validation**
4. **Use HTTPS in production**

## Common Development Issues

### Server Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000
   # Kill process
   taskkill /PID <process-id> /F
   ```

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
