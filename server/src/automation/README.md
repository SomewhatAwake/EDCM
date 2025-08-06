# Elite Dangerous Carrier Automation

This module implements sophisticated keyboard automation techniques for Elite Dangerous carrier management, similar to EDCoPilot/EDAP.

## Architecture

The automation system consists of five core components:

### Core Components

1. **EDKeys.js** - Elite Dangerous keybinding management and key sending
   - Reads Elite Dangerous keybinding configuration files
   - Maps game actions to system key codes
   - Supports custom keybinding detection

2. **DirectInput.js** - Low-level keyboard input automation
   - Cross-platform keyboard input simulation
   - Menu navigation and key sequence automation
   - Elite Dangerous specific UI actions

3. **Screen.js** - Screen capture and template matching analysis
   - Screenshot capture and processing
   - Template matching for UI element detection
   - State change monitoring

4. **ImageTemplates.js** - UI element recognition and matching
   - Predefined templates for Elite Dangerous UI elements
   - Navigation patterns for carrier management
   - Service and docking permission templates

5. **OCR.js** - Text recognition from game interface
   - Tesseract.js integration for text extraction
   - Elite Dangerous UI text reading
   - Carrier information parsing (name, system, fuel, etc.)

6. **CarrierAutomation.js** - Main automation orchestrator
   - Coordinates all automation components
   - Implements high-level carrier operations
   - Provides verification and error handling

## Features

### Carrier Management Automation

- **Docking Permissions**: Automated management of carrier docking access
- **Service Management**: Enable/disable carrier services (refuel, shipyard, etc.)
- **Jump Operations**: Galaxy map navigation and jump plotting
- **Information Reading**: OCR-based carrier status extraction

### Elite Dangerous Integration

- **Keybinding Detection**: Reads Elite Dangerous configuration files
- **UI State Detection**: Computer vision-based state recognition
- **Cross-platform Support**: Works on Windows, Linux, and macOS
- **Safe Operation**: Verifies actions and provides fallback mechanisms

## Usage

### API Integration

The automation system integrates with the existing carrier management API:

```javascript
// Enable automation
POST /api/carriers/automation/toggle
{ "enabled": true }

// Check automation status
GET /api/carriers/automation/status

// Update docking permissions (with automation)
PUT /api/carriers/:callsign/docking
{ "docking_access": "friends", "notorious_access": true }

// Read carrier info from game UI
GET /api/carriers/:callsign/game-info

// Detect current game state
GET /api/carriers/automation/game-state
```

### Environment Variables

```bash
# Enable automation
ENABLE_ED_AUTOMATION=true

# Elite Dangerous bindings path (optional)
ED_BINDINGS_PATH=/path/to/elite/bindings

# Mock mode for testing
MOCK_MODE=true
```

### Dependencies

```json
{
  "tesseract.js": "^5.0.4",    // OCR text recognition
  "jimp": "^0.22.10",          // Image processing
  "xml2js": "^0.6.2",          // Keybinding file parsing
  "fast-xml-parser": "^4.3.2"  // Enhanced XML parsing
}
```

## Production Deployment

### With Native Automation

For production use with real Elite Dangerous automation:

1. Install native dependencies (Windows):
   ```bash
   npm install robotjs  # Requires Visual Studio build tools
   ```

2. Set up Elite Dangerous:
   - Ensure Elite Dangerous is installed and configured
   - Set `ED_BINDINGS_PATH` to your bindings directory
   - Enable automation: `ENABLE_ED_AUTOMATION=true`

3. Configure templates:
   - Place UI template images in `src/automation/templates/`
   - Calibrate for your screen resolution and UI settings

### Mock Mode

For development and testing without Elite Dangerous:

```bash
MOCK_MODE=true npm start
```

## Security Considerations

- **Process Detection**: Verifies Elite Dangerous is running before automation
- **Template Matching**: Uses image recognition for safe UI interaction
- **Fallback Mechanisms**: Graceful degradation when automation fails
- **Logging**: Comprehensive logging for debugging and monitoring

## Technical Details

### Template Matching

The system uses Jimp-based template matching with configurable thresholds:

- **Confidence Threshold**: 80% similarity required by default
- **Region-based Search**: Optimized search areas for each UI element
- **Multi-scale Matching**: Supports different screen resolutions

### OCR Integration

Tesseract.js integration with Elite Dangerous optimizations:

- **Character Whitelist**: Limited to game UI character set
- **Preprocessing**: Contrast enhancement and noise reduction
- **Region Extraction**: Targeted text reading from specific UI areas

### Cross-platform Support

- **Windows**: Full automation with robotjs and Windows APIs
- **Linux/macOS**: Mock mode for development and testing
- **Process Detection**: Platform-specific Elite Dangerous detection

## Contributing

When adding new automation features:

1. Add templates to `ImageTemplates.js`
2. Implement automation logic in `CarrierAutomation.js`
3. Add API endpoints in carrier routes
4. Test in both mock and production modes
5. Update documentation

## Troubleshooting

### Common Issues

1. **Templates not found**: Ensure template images match your UI settings
2. **OCR failures**: Check text contrast and image preprocessing
3. **Keybinding errors**: Verify Elite Dangerous bindings path
4. **Platform issues**: Use mock mode for non-Windows development

### Debug Mode

Enable detailed logging:

```bash
DEBUG=automation:* npm start
```

### Testing

Run automation tests:

```bash
MOCK_MODE=true node test-automation.js
```