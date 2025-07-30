# Elite Dangerous Fleet Carrier Integration

## Overview

This document explains how the Elite Dangerous Fleet Carrier Companion App integrates with the game to provide remote carrier management capabilities.

## Integration Methods

### 1. Journal File Monitoring

The server monitors Elite Dangerous journal files in real-time to detect carrier-related events.

**Journal Events Monitored:**
- `CarrierJump` - Carrier jump completion
- `CarrierStats` - Carrier statistics updates
- `CarrierFinance` - Financial data updates
- `CarrierDockingPermission` - Docking permission changes
- `CarrierNameChanged` - Carrier name changes
- `CarrierServices` - Service activation/deactivation

**Implementation:**
```javascript
// Example journal entry for carrier jump
{
  "timestamp": "2023-07-30T12:00:00Z",
  "event": "CarrierJump",
  "CarrierID": "K7J-H9T",
  "StarSystem": "Sol",
  "SystemAddress": 10477373803,
  "Body": "Sol",
  "BodyID": 0,
  "BodyType": "Star"
}
```

### 2. Command Execution (Future Implementation)

For sending commands to Elite Dangerous, the system can be extended with:

#### Key Automation
Using Windows automation tools to send key sequences to the game:

```javascript
// Example implementation using node-key-sender
const ks = require('node-key-sender');

async function openCarrierManagement() {
  // Send key sequence to open carrier management
  await ks.sendKey('4'); // Open galaxy map
  await ks.sendKey('tab'); // Navigate to carrier
  await ks.sendKey('enter'); // Select carrier
}
```

#### Game Window Integration
Direct integration with the Elite Dangerous game window:

```javascript
// Example using Windows API
const ffi = require('ffi-napi');
const user32 = ffi.Library('user32', {
  'FindWindowA': ['long', ['string', 'string']],
  'SetForegroundWindow': ['bool', ['long']],
  'SendMessageA': ['long', ['long', 'int', 'int', 'int']]
});

function activateEliteDangerous() {
  const window = user32.FindWindowA(null, 'Elite - Dangerous (CLIENT)');
  if (window) {
    user32.SetForegroundWindow(window);
    return true;
  }
  return false;
}
```

## Data Flow

### Real-time Updates

1. **Elite Dangerous** generates journal entries
2. **Server** monitors journal files using `chokidar`
3. **Server** processes relevant events and updates database
4. **Server** broadcasts updates via WebSocket
5. **Client** receives real-time updates and updates UI

### Command Execution

1. **Client** sends command request to server
2. **Server** validates request and user permissions
3. **Server** executes command via game integration
4. **Server** monitors for confirmation in journal
5. **Server** broadcasts success/failure to client

## Security Considerations

### Authentication
- JWT-based authentication for all API requests
- WebSocket authentication for real-time updates
- Rate limiting to prevent abuse

### Game Integration Safety
- Read-only journal monitoring (safe)
- Command execution requires careful implementation
- Validation of all commands before execution
- Graceful error handling

## Elite Dangerous Game States

### Carrier States
- **Idle** - Carrier is stationary and available
- **Jumping** - Carrier is in hyperspace
- **Cooldown** - Carrier cannot jump (fuel/timer)
- **Maintenance** - Carrier undergoing maintenance

### Required Game State
- Elite Dangerous must be running
- Commander must own a Fleet Carrier
- Journal file access must be available

## Configuration

### Journal Path Detection
```javascript
// Auto-detect journal path
const os = require('os');
const path = require('path');

function getJournalPath() {
  const username = os.userInfo().username;
  return path.join(
    'C:', 'Users', username, 'Saved Games', 
    'Frontier Developments', 'Elite Dangerous'
  );
}
```

### Game Installation Detection
```javascript
// Common installation paths
const installPaths = [
  'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Elite Dangerous',
  'C:\\Program Files\\Epic Games\\EliteDangerous',
  'C:\\Program Files\\Frontier\\EDLaunch'
];
```

## Performance Optimization

### Journal Processing
- Process only new entries since last update
- Filter events to carrier-related only
- Batch database updates for efficiency

### Real-time Updates
- Use WebSocket rooms for targeted updates
- Debounce rapid updates to prevent spam
- Compress large data payloads

## Future Enhancements

### Advanced Integration
1. **OCR Integration** - Read game UI elements
2. **Memory Reading** - Direct game memory access
3. **API Integration** - If Frontier provides official API
4. **Voice Commands** - Voice control integration

### Extended Functionality
1. **Route Planning** - Multi-jump route calculation
2. **Market Analysis** - Commodity price tracking
3. **Fleet Coordination** - Multi-carrier management
4. **Mission Integration** - Carrier mission support

## Troubleshooting

### Common Issues

1. **Journal Not Found**
   - Verify Elite Dangerous installation
   - Check journal path configuration
   - Ensure game has been run at least once

2. **No Carrier Events**
   - Confirm commander owns a Fleet Carrier
   - Check if carrier is active in game
   - Verify journal file permissions

3. **Command Execution Fails**
   - Ensure Elite Dangerous is running
   - Check game window focus
   - Verify keybind configuration

### Debug Information
Enable debug logging to track:
- Journal file changes
- Event processing
- Command execution
- WebSocket connections

```javascript
// Example debug configuration
const winston = require('winston');
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'debug.log', level: 'debug' })
  ]
});
```
