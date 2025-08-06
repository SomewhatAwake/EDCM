const fs = require('fs');
const path = require('path');
const os = require('os');
const { XMLParser } = require('fast-xml-parser');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Elite Dangerous Keybinding Management
 * Reads and manages Elite Dangerous keybinding files for automation
 */
class EDKeys {
  constructor() {
    this.keybindings = new Map();
    this.bindingsPath = this.findBindingsPath();
    this.loadKeybindings();
  }

  /**
   * Find Elite Dangerous keybindings directory
   */
  findBindingsPath() {
    const homeDir = os.homedir();
    const possiblePaths = [
      path.join(homeDir, 'AppData', 'Local', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings'),
      path.join(homeDir, 'Documents', 'Frontier Developments', 'Elite Dangerous', 'Options', 'Bindings'),
      process.env.ED_BINDINGS_PATH
    ].filter(Boolean);

    for (const bindingsPath of possiblePaths) {
      if (fs.existsSync(bindingsPath)) {
        logger.info(`Found Elite Dangerous bindings at: ${bindingsPath}`);
        return bindingsPath;
      }
    }

    logger.warn('Elite Dangerous bindings directory not found. Please set ED_BINDINGS_PATH environment variable.');
    return null;
  }

  /**
   * Load keybindings from Elite Dangerous configuration files
   */
  loadKeybindings() {
    if (!this.bindingsPath) {
      logger.warn('Cannot load keybindings - bindings path not found');
      return;
    }

    try {
      // Look for the most recent .binds file
      const bindFiles = fs.readdirSync(this.bindingsPath)
        .filter(file => file.endsWith('.binds'))
        .map(file => {
          const filePath = path.join(this.bindingsPath, file);
          const stat = fs.statSync(filePath);
          return { file, path: filePath, mtime: stat.mtime };
        })
        .sort((a, b) => b.mtime - a.mtime);

      if (bindFiles.length === 0) {
        logger.warn('No .binds files found in bindings directory');
        return;
      }

      const latestBindFile = bindFiles[0];
      logger.info(`Loading keybindings from: ${latestBindFile.file}`);

      const xmlContent = fs.readFileSync(latestBindFile.path, 'utf8');
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
      });

      const result = parser.parse(xmlContent);
      this.parseKeybindings(result);

      logger.info(`Loaded ${this.keybindings.size} keybindings`);
    } catch (error) {
      logger.error('Failed to load keybindings:', error);
    }
  }

  /**
   * Parse XML keybindings structure
   */
  parseKeybindings(xmlData) {
    if (!xmlData.Root) {
      logger.warn('Invalid keybindings XML structure');
      return;
    }

    // Extract keybindings from XML structure
    this.extractBindings(xmlData.Root);
  }

  /**
   * Recursively extract keybindings from XML data
   */
  extractBindings(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('@_')) continue; // Skip attributes

      const currentPath = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object') {
        // Check if this is a binding with Primary/Secondary
        if (value.Primary || value.Secondary) {
          const binding = this.parseBinding(value);
          if (binding) {
            this.keybindings.set(currentPath, binding);
          }
        } else {
          // Continue recursing
          this.extractBindings(value, currentPath);
        }
      }
    }
  }

  /**
   * Parse individual binding entry
   */
  parseBinding(bindingData) {
    const binding = {
      primary: null,
      secondary: null
    };

    if (bindingData.Primary) {
      binding.primary = this.parseKeyData(bindingData.Primary);
    }

    if (bindingData.Secondary) {
      binding.secondary = this.parseKeyData(bindingData.Secondary);
    }

    return binding.primary || binding.secondary ? binding : null;
  }

  /**
   * Parse key data from binding
   */
  parseKeyData(keyData) {
    if (!keyData || typeof keyData !== 'object') return null;

    return {
      device: keyData['@_Device'] || 'Keyboard',
      key: keyData['@_Key'],
      modifiers: []
    };
  }

  /**
   * Get keybinding for a specific action
   */
  getBinding(action) {
    return this.keybindings.get(action);
  }

  /**
   * Get key for common carrier management actions
   */
  getCarrierKeys() {
    return {
      // Panel navigation
      rightPanel: this.getKeyCode('UI_NextPanel'),
      leftPanel: this.getKeyCode('UI_PrevPanel'),
      
      // UI navigation
      uiUp: this.getKeyCode('UI_Up'),
      uiDown: this.getKeyCode('UI_Down'),
      uiLeft: this.getKeyCode('UI_Left'),
      uiRight: this.getKeyCode('UI_Right'),
      uiSelect: this.getKeyCode('UI_Select'),
      uiBack: this.getKeyCode('UI_Back'),
      
      // Panel specific
      systemPanel: this.getKeyCode('SystemPanel'),
      targetPanel: this.getKeyCode('TargetPanel'),
      commsPanel: this.getKeyCode('CommsPanel'),
      rolePanel: this.getKeyCode('RolePanel'),
      
      // Galaxy map
      galaxyMap: this.getKeyCode('GalaxyMapOpen'),
      
      // Common keys
      escape: 'Escape',
      enter: 'Return',
      tab: 'Tab'
    };
  }

  /**
   * Convert Elite Dangerous key name to system key code
   */
  getKeyCode(actionName) {
    const binding = this.getBinding(actionName);
    if (!binding || !binding.primary) {
      logger.warn(`No binding found for action: ${actionName}`);
      return null;
    }

    return this.convertEDKeyToKeyCode(binding.primary.key);
  }

  /**
   * Convert Elite Dangerous key names to standard key codes
   */
  convertEDKeyToKeyCode(edKey) {
    if (!edKey) return null;

    // Map Elite Dangerous key names to standard key codes
    const keyMap = {
      // Function keys
      'Key_F1': 'F1', 'Key_F2': 'F2', 'Key_F3': 'F3', 'Key_F4': 'F4',
      'Key_F5': 'F5', 'Key_F6': 'F6', 'Key_F7': 'F7', 'Key_F8': 'F8',
      'Key_F9': 'F9', 'Key_F10': 'F10', 'Key_F11': 'F11', 'Key_F12': 'F12',
      
      // Numbers
      'Key_1': '1', 'Key_2': '2', 'Key_3': '3', 'Key_4': '4', 'Key_5': '5',
      'Key_6': '6', 'Key_7': '7', 'Key_8': '8', 'Key_9': '9', 'Key_0': '0',
      
      // Letters
      'Key_A': 'a', 'Key_B': 'b', 'Key_C': 'c', 'Key_D': 'd', 'Key_E': 'e',
      'Key_F': 'f', 'Key_G': 'g', 'Key_H': 'h', 'Key_I': 'i', 'Key_J': 'j',
      'Key_K': 'k', 'Key_L': 'l', 'Key_M': 'm', 'Key_N': 'n', 'Key_O': 'o',
      'Key_P': 'p', 'Key_Q': 'q', 'Key_R': 'r', 'Key_S': 's', 'Key_T': 't',
      'Key_U': 'u', 'Key_V': 'v', 'Key_W': 'w', 'Key_X': 'x', 'Key_Y': 'y',
      'Key_Z': 'z',
      
      // Arrow keys
      'Key_UpArrow': 'up', 'Key_DownArrow': 'down',
      'Key_LeftArrow': 'left', 'Key_RightArrow': 'right',
      
      // Special keys
      'Key_Enter': 'return', 'Key_Space': 'space', 'Key_Tab': 'tab',
      'Key_Escape': 'escape', 'Key_Backspace': 'backspace',
      'Key_Delete': 'delete', 'Key_Insert': 'insert',
      'Key_Home': 'home', 'Key_End': 'end',
      'Key_PageUp': 'pageup', 'Key_PageDown': 'pagedown',
      
      // Modifiers
      'Key_LeftShift': 'shift', 'Key_RightShift': 'shift',
      'Key_LeftControl': 'control', 'Key_RightControl': 'control',
      'Key_LeftAlt': 'alt', 'Key_RightAlt': 'alt'
    };

    return keyMap[edKey] || edKey.replace('Key_', '').toLowerCase();
  }

  /**
   * Get all loaded keybindings for debugging
   */
  getAllBindings() {
    const bindings = {};
    for (const [action, binding] of this.keybindings.entries()) {
      bindings[action] = binding;
    }
    return bindings;
  }

  /**
   * Reload keybindings (useful if user changes bindings)
   */
  reload() {
    this.keybindings.clear();
    this.loadKeybindings();
  }
}

module.exports = EDKeys;