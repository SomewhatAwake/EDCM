const EDKeys = require('./EDKeys');
const DirectInput = require('./DirectInput');
const Screen = require('./Screen');
const ImageTemplates = require('./ImageTemplates');
const OCR = require('./OCR');
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
 * Main Carrier Automation Orchestrator
 * Coordinates all automation components to perform Elite Dangerous carrier operations
 */
class CarrierAutomation {
  constructor() {
    this.edKeys = new EDKeys();
    this.directInput = new DirectInput();
    this.screen = new Screen();
    this.templates = new ImageTemplates();
    this.ocr = new OCR();
    
    this.isInitialized = false;
    this.currentState = 'unknown';
    
    this.initialize();
  }

  /**
   * Initialize automation system
   */
  async initialize() {
    try {
      logger.info('Initializing Carrier Automation...');
      
      // Wait for OCR to initialize
      await this.ocr.initializeWorker();
      
      this.isInitialized = true;
      logger.info('Carrier Automation initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Carrier Automation:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Update carrier docking permissions
   */
  async updateDockingPermissions(dockingAccess, notoriousAccess) {
    try {
      logger.info(`Updating docking permissions: ${dockingAccess}, notorious: ${notoriousAccess}`);

      // Ensure we're in the right state
      await this.ensureCarrierManagementOpen();

      // Navigate to docking permissions
      const success = await this.navigateToDockingPermissions();
      if (!success) {
        throw new Error('Failed to navigate to docking permissions');
      }

      // Change docking access setting
      await this.changeDockingAccess(dockingAccess);

      // Change notorious access setting
      await this.changeNotoriousAccess(notoriousAccess);

      // Apply changes
      await this.applyChanges();

      // Verify changes were applied
      const verified = await this.verifyDockingSettings(dockingAccess, notoriousAccess);
      if (!verified) {
        logger.warn('Could not verify docking settings changes');
      }

      logger.info('Docking permissions updated successfully');
      return true;
    } catch (error) {
      logger.error('Failed to update docking permissions:', error);
      return false;
    }
  }

  /**
   * Update carrier service status
   */
  async updateService(serviceType, enabled) {
    try {
      logger.info(`Updating service ${serviceType}: ${enabled ? 'enabled' : 'disabled'}`);

      // Ensure we're in carrier management
      await this.ensureCarrierManagementOpen();

      // Navigate to services panel
      const success = await this.navigateToServices();
      if (!success) {
        throw new Error('Failed to navigate to services');
      }

      // Toggle specific service
      await this.toggleService(serviceType, enabled);

      // Apply changes
      await this.applyChanges();

      // Verify service status
      const verified = await this.verifyServiceStatus(serviceType, enabled);
      if (!verified) {
        logger.warn(`Could not verify service ${serviceType} status`);
      }

      logger.info(`Service ${serviceType} updated successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to update service ${serviceType}:`, error);
      return false;
    }
  }

  /**
   * Initiate carrier jump to target system
   */
  async initiateJump(targetSystem) {
    try {
      logger.info(`Initiating jump to ${targetSystem}`);

      // Open galaxy map
      await this.openGalaxyMap();

      // Search for target system
      await this.searchSystem(targetSystem);

      // Plot jump
      await this.plotJump();

      // Confirm jump
      await this.confirmJump();

      logger.info(`Jump to ${targetSystem} initiated successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to initiate jump to ${targetSystem}:`, error);
      return false;
    }
  }

  /**
   * Ensure carrier management panel is open
   */
  async ensureCarrierManagementOpen() {
    // Check if already open
    const carrierPanel = await this.screen.findTemplate('carrier_management_panel');
    if (carrierPanel) {
      logger.info('Carrier management panel already open');
      return true;
    }

    // Open right panel first
    await this.directInput.openPanel(4);
    await this.directInput.delay(1000);

    // Look for carrier navigation item
    let attempts = 0;
    while (attempts < 5) {
      const carrierNav = await this.screen.findTemplate('panel_navigation_carrier');
      if (carrierNav) {
        // Navigate to and select carrier
        await this.directInput.selectMenuItem();
        await this.directInput.delay(1000);
        
        // Verify carrier management opened
        const panel = await this.screen.findTemplate('carrier_management_panel');
        if (panel) {
          return true;
        }
      }

      // Try navigating down to find carrier option
      await this.directInput.navigateMenu('down', 1);
      await this.directInput.delay(300);
      attempts++;
    }

    throw new Error('Could not open carrier management panel');
  }

  /**
   * Navigate to docking permissions
   */
  async navigateToDockingPermissions() {
    try {
      // Look for docking permissions option
      await this.directInput.navigateMenu('down', 1);
      await this.directInput.selectMenuItem();
      await this.directInput.delay(1000);

      // Wait for docking permissions panel
      const panel = await this.screen.waitForTemplate('docking_permissions', 5000);
      return panel !== null;
    } catch (error) {
      logger.error('Failed to navigate to docking permissions:', error);
      return false;
    }
  }

  /**
   * Navigate to services panel
   */
  async navigateToServices() {
    try {
      // Navigate to services option (usually down 2 from main)
      await this.directInput.navigateMenu('down', 2);
      await this.directInput.selectMenuItem();
      await this.directInput.delay(1000);

      // Wait for services panel
      const panel = await this.screen.waitForTemplate('services_panel', 5000);
      return panel !== null;
    } catch (error) {
      logger.error('Failed to navigate to services:', error);
      return false;
    }
  }

  /**
   * Change docking access setting
   */
  async changeDockingAccess(accessType) {
    try {
      // Find current docking access and change it
      const currentAccess = await this.getCurrentDockingAccess();
      
      if (currentAccess === accessType) {
        logger.info(`Docking access already set to ${accessType}`);
        return true;
      }

      // Navigate to docking access option and cycle through options
      let attempts = 0;
      while (attempts < 3) {
        await this.directInput.selectMenuItem();
        await this.directInput.delay(500);
        
        const newAccess = await this.getCurrentDockingAccess();
        if (newAccess === accessType) {
          return true;
        }
        attempts++;
      }

      logger.warn(`Could not set docking access to ${accessType}`);
      return false;
    } catch (error) {
      logger.error('Failed to change docking access:', error);
      return false;
    }
  }

  /**
   * Change notorious access setting
   */
  async changeNotoriousAccess(allowed) {
    try {
      // Navigate to notorious access checkbox
      await this.directInput.navigateMenu('down', 1);
      
      const currentStatus = await this.getCurrentNotoriousAccess();
      
      if (currentStatus === allowed) {
        logger.info(`Notorious access already set to ${allowed}`);
        return true;
      }

      // Toggle the checkbox
      await this.directInput.selectMenuItem();
      await this.directInput.delay(500);

      return true;
    } catch (error) {
      logger.error('Failed to change notorious access:', error);
      return false;
    }
  }

  /**
   * Toggle a specific service
   */
  async toggleService(serviceType, enabled) {
    try {
      const serviceSteps = {
        refuel: 1,
        shipyard: 2,
        outfitting: 3,
        commodities: 4,
        cartographics: 5
      };

      const steps = serviceSteps[serviceType.toLowerCase()];
      if (!steps) {
        throw new Error(`Unknown service type: ${serviceType}`);
      }

      // Navigate to the service
      await this.directInput.navigateMenu('down', steps - 1);
      
      // Check current status
      const currentStatus = await this.getCurrentServiceStatus(serviceType);
      
      if (currentStatus === enabled) {
        logger.info(`Service ${serviceType} already ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      }

      // Toggle the service
      await this.directInput.selectMenuItem();
      await this.directInput.delay(500);

      return true;
    } catch (error) {
      logger.error(`Failed to toggle service ${serviceType}:`, error);
      return false;
    }
  }

  /**
   * Apply changes (confirm/save)
   */
  async applyChanges() {
    try {
      // Look for apply/confirm button
      const confirmButton = await this.screen.findTemplate('confirm_button');
      if (confirmButton) {
        // Click at button location (could be enhanced with click automation)
        await this.directInput.selectMenuItem();
        await this.directInput.delay(1000);
        return true;
      }

      // Fallback: press Enter
      await this.directInput.selectMenuItem();
      await this.directInput.delay(1000);
      return true;
    } catch (error) {
      logger.error('Failed to apply changes:', error);
      return false;
    }
  }

  /**
   * Open galaxy map
   */
  async openGalaxyMap() {
    try {
      const galaxyKey = this.edKeys.getKeyCode('GalaxyMapOpen') || 'm';
      await this.directInput.sendKey(galaxyKey);
      await this.directInput.delay(2000);

      // Wait for galaxy map to open
      const mapOpen = await this.screen.waitForTemplate('galaxy_map_open', 10000);
      return mapOpen !== null;
    } catch (error) {
      logger.error('Failed to open galaxy map:', error);
      return false;
    }
  }

  /**
   * Search for system in galaxy map
   */
  async searchSystem(systemName) {
    try {
      // Open search (usually Tab key)
      await this.directInput.sendKey('tab');
      await this.directInput.delay(500);

      // Type system name
      await this.directInput.typeText(systemName);
      await this.directInput.delay(500);

      // Press Enter to search
      await this.directInput.sendKey('enter');
      await this.directInput.delay(2000);

      return true;
    } catch (error) {
      logger.error(`Failed to search for system ${systemName}:`, error);
      return false;
    }
  }

  /**
   * Plot jump in galaxy map
   */
  async plotJump() {
    try {
      // Press Enter to select system and plot
      await this.directInput.sendKey('enter');
      await this.directInput.delay(1000);

      return true;
    } catch (error) {
      logger.error('Failed to plot jump:', error);
      return false;
    }
  }

  /**
   * Confirm jump
   */
  async confirmJump() {
    try {
      // Look for confirm button or press Enter
      await this.directInput.sendKey('enter');
      await this.directInput.delay(1000);

      return true;
    } catch (error) {
      logger.error('Failed to confirm jump:', error);
      return false;
    }
  }

  /**
   * Get current docking access setting using OCR
   */
  async getCurrentDockingAccess() {
    try {
      const screenshot = await this.screen.captureScreen();
      const access = await this.ocr.readDockingAccess(screenshot);
      return access;
    } catch (error) {
      logger.error('Failed to read docking access:', error);
      return 'unknown';
    }
  }

  /**
   * Get current notorious access setting
   */
  async getCurrentNotoriousAccess() {
    try {
      // Check if notorious allowed template is visible
      const allowed = await this.screen.findTemplate('notorious_allowed');
      return allowed !== null;
    } catch (error) {
      logger.error('Failed to read notorious access:', error);
      return false;
    }
  }

  /**
   * Get current service status
   */
  async getCurrentServiceStatus(serviceType) {
    try {
      const screenshot = await this.screen.captureScreen();
      const enabled = await this.ocr.readServiceStatus(screenshot, serviceType);
      return enabled;
    } catch (error) {
      logger.error(`Failed to read service status for ${serviceType}:`, error);
      return false;
    }
  }

  /**
   * Verify docking settings were applied correctly
   */
  async verifyDockingSettings(expectedAccess, expectedNotorious) {
    try {
      await this.directInput.delay(1000); // Wait for UI to update
      
      const actualAccess = await this.getCurrentDockingAccess();
      const actualNotorious = await this.getCurrentNotoriousAccess();

      const accessMatch = actualAccess === expectedAccess;
      const notoriousMatch = actualNotorious === expectedNotorious;

      logger.info(`Verification - Access: ${actualAccess} (expected ${expectedAccess}), Notorious: ${actualNotorious} (expected ${expectedNotorious})`);

      return accessMatch && notoriousMatch;
    } catch (error) {
      logger.error('Failed to verify docking settings:', error);
      return false;
    }
  }

  /**
   * Verify service status
   */
  async verifyServiceStatus(serviceType, expectedEnabled) {
    try {
      await this.directInput.delay(1000); // Wait for UI to update
      
      const actualEnabled = await this.getCurrentServiceStatus(serviceType);
      const match = actualEnabled === expectedEnabled;

      logger.info(`Service verification - ${serviceType}: ${actualEnabled} (expected ${expectedEnabled})`);

      return match;
    } catch (error) {
      logger.error(`Failed to verify service status for ${serviceType}:`, error);
      return false;
    }
  }

  /**
   * Get current carrier information using OCR
   */
  async getCarrierInfo() {
    try {
      const screenshot = await this.screen.captureScreen();
      
      const info = {
        name: await this.ocr.readCarrierName(screenshot),
        currentSystem: await this.ocr.readCurrentSystem(screenshot),
        fuelLevel: await this.ocr.readFuelLevel(screenshot),
        jumpCooldown: await this.ocr.readJumpCooldown(screenshot),
        balance: await this.ocr.readBalance(screenshot)
      };

      return info;
    } catch (error) {
      logger.error('Failed to get carrier info:', error);
      return null;
    }
  }

  /**
   * Detect current Elite Dangerous UI state
   */
  async detectCurrentState() {
    try {
      const state = await this.screen.detectEDState();
      this.currentState = state.state;
      return state;
    } catch (error) {
      logger.error('Failed to detect current state:', error);
      return { state: 'unknown', confidence: 0 };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      if (this.ocr) {
        await this.ocr.terminate();
      }
      logger.info('Carrier Automation cleanup completed');
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Get automation status and capabilities
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentState: this.currentState,
      capabilities: {
        dockingPermissions: true,
        serviceManagement: true,
        jumpInitiation: true,
        stateDetection: true,
        ocrReading: this.ocr.isInitialized
      },
      keybindings: this.edKeys.keybindings.size > 0,
      templates: this.screen.templates.size
    };
  }
}

module.exports = CarrierAutomation;