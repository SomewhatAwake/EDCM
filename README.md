# Elite Dangerous Fleet Carrier Companion App

A companion app for Elite Dangerous that allows remote management of Fleet Carriers through a mobile Android interface.

## Project Structure

- `server/` - Node.js server that interfaces with Elite Dangerous
- `client/` - React Native Android app for remote carrier management
- `docs/` - Documentation and API specifications

## Features

### Server Component
- Monitors Elite Dangerous journal files
- Provides REST API for carrier operations
- WebSocket support for real-time updates
- Command execution for carrier management
- Security with authentication

### Client Component
- Android app with Elite Dangerous-style UI
- Real-time carrier status monitoring
- Remote carrier management controls
- Secure connection to server
- Offline capability with sync

## Getting Started

### Server Setup
1. Navigate to `server/` directory:
   ```powershell
   cd server
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Configure environment:
   ```powershell
   copy .env.example .env
   # Edit .env file with your Elite Dangerous installation path
   ```
4. Start the server:
   ```powershell
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

### Client Setup
1. Navigate to `client/` directory:
   ```powershell
   cd client
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Configure server connection in `src/config.js`
4. Start React Native Metro bundler:
   ```powershell
   npx react-native start
   ```
5. Run the Android app (in a new terminal):
   ```powershell
   npx react-native run-android
   ```

### Quick Setup
You can also use the provided setup script:
```powershell
.\setup.bat
```

## API Documentation

The server provides a RESTful API for all carrier operations. See `docs/api.md` for detailed documentation.

## Security

- JWT-based authentication
- HTTPS/WSS for secure communication
- API rate limiting
- Input validation and sanitization

## License

MIT License
