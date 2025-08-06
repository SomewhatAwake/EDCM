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
 * Elite Dangerous UI Element Recognition
 * Defines templates and patterns for recognizing specific game interface elements
 */
class ImageTemplates {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * Initialize template definitions for Elite Dangerous UI elements
   */
  initializeTemplates() {
    return {
      // Panel states
      panels: {
        right_panel_open: {
          file: 'right_panel_open.png',
          description: 'Right panel is open and visible',
          region: { x: 1600, y: 200, width: 300, height: 100 },
          confidence: 0.8
        },
        left_panel_open: {
          file: 'left_panel_open.png',
          description: 'Left panel is open and visible',
          region: { x: 20, y: 200, width: 300, height: 100 },
          confidence: 0.8
        }
      },

      // Carrier Management UI
      carrier: {
        management_panel: {
          file: 'carrier_management_panel.png',
          description: 'Carrier management panel is open',
          region: { x: 1400, y: 100, width: 500, height: 200 },
          confidence: 0.85
        },
        navigation_item: {
          file: 'panel_navigation_carrier.png',
          description: 'Carrier item in panel navigation',
          region: { x: 1500, y: 300, width: 400, height: 80 },
          confidence: 0.8
        },
        docking_permissions: {
          file: 'docking_permissions.png',
          description: 'Docking permissions screen',
          region: { x: 1300, y: 150, width: 600, height: 400 },
          confidence: 0.85
        },
        services_panel: {
          file: 'services_panel.png',
          description: 'Carrier services management panel',
          region: { x: 1300, y: 150, width: 600, height: 400 },
          confidence: 0.85
        },
        jump_interface: {
          file: 'jump_interface.png',
          description: 'Carrier jump plotting interface',
          region: { x: 1200, y: 100, width: 700, height: 500 },
          confidence: 0.8
        }
      },

      // Docking settings
      docking: {
        access_all: {
          file: 'docking_access_all.png',
          description: 'All access selected for docking',
          region: { x: 1400, y: 300, width: 200, height: 50 },
          confidence: 0.9
        },
        access_squadron: {
          file: 'docking_access_squadron.png',
          description: 'Squadron only access selected',
          region: { x: 1400, y: 300, width: 200, height: 50 },
          confidence: 0.9
        },
        access_friends: {
          file: 'docking_access_friends.png',
          description: 'Friends only access selected',
          region: { x: 1400, y: 300, width: 200, height: 50 },
          confidence: 0.9
        },
        notorious_allowed: {
          file: 'notorious_allowed.png',
          description: 'Notorious commanders allowed checkbox checked',
          region: { x: 1400, y: 400, width: 30, height: 30 },
          confidence: 0.9
        },
        notorious_denied: {
          file: 'notorious_denied.png',
          description: 'Notorious commanders denied checkbox unchecked',
          region: { x: 1400, y: 400, width: 30, height: 30 },
          confidence: 0.9
        }
      },

      // Service management
      services: {
        refuel_enabled: {
          file: 'service_refuel_enabled.png',
          description: 'Refuel service enabled',
          region: { x: 1400, y: 250, width: 400, height: 40 },
          confidence: 0.85
        },
        refuel_disabled: {
          file: 'service_refuel_disabled.png',
          description: 'Refuel service disabled',
          region: { x: 1400, y: 250, width: 400, height: 40 },
          confidence: 0.85
        },
        shipyard_enabled: {
          file: 'service_shipyard_enabled.png',
          description: 'Shipyard service enabled',
          region: { x: 1400, y: 300, width: 400, height: 40 },
          confidence: 0.85
        },
        outfitting_enabled: {
          file: 'service_outfitting_enabled.png',
          description: 'Outfitting service enabled',
          region: { x: 1400, y: 350, width: 400, height: 40 },
          confidence: 0.85
        },
        commodities_enabled: {
          file: 'service_commodities_enabled.png',
          description: 'Commodities market enabled',
          region: { x: 1400, y: 400, width: 400, height: 40 },
          confidence: 0.85
        },
        cartographics_enabled: {
          file: 'service_cartographics_enabled.png',
          description: 'Universal Cartographics enabled',
          region: { x: 1400, y: 450, width: 400, height: 40 },
          confidence: 0.85
        }
      },

      // Common UI elements
      buttons: {
        confirm: {
          file: 'confirm_button.png',
          description: 'Confirm/Accept button',
          region: { x: 1400, y: 600, width: 150, height: 50 },
          confidence: 0.9
        },
        cancel: {
          file: 'cancel_button.png',
          description: 'Cancel/Back button',
          region: { x: 1200, y: 600, width: 150, height: 50 },
          confidence: 0.9
        },
        apply: {
          file: 'apply_button.png',
          description: 'Apply changes button',
          region: { x: 1600, y: 600, width: 150, height: 50 },
          confidence: 0.9
        }
      },

      // Navigation elements
      navigation: {
        menu_selected: {
          file: 'menu_item_selected.png',
          description: 'Currently selected menu item',
          region: { x: 1400, y: 200, width: 400, height: 60 },
          confidence: 0.8
        },
        submenu_arrow: {
          file: 'submenu_arrow.png',
          description: 'Submenu arrow indicator',
          region: { x: 1750, y: 200, width: 30, height: 30 },
          confidence: 0.85
        }
      },

      // System states
      states: {
        galaxy_map_open: {
          file: 'galaxy_map_open.png',
          description: 'Galaxy map is currently open',
          region: { x: 100, y: 50, width: 200, height: 100 },
          confidence: 0.8
        },
        loading_screen: {
          file: 'loading_screen.png',
          description: 'Game loading screen visible',
          region: { x: 800, y: 500, width: 320, height: 80 },
          confidence: 0.9
        },
        menu_transition: {
          file: 'menu_transition.png',
          description: 'Menu transition animation',
          region: { x: 1400, y: 300, width: 400, height: 200 },
          confidence: 0.7
        }
      }
    };
  }

  /**
   * Get template definition by category and name
   */
  getTemplate(category, name) {
    if (!this.templates[category] || !this.templates[category][name]) {
      logger.warn(`Template not found: ${category}.${name}`);
      return null;
    }
    return this.templates[category][name];
  }

  /**
   * Get all templates in a category
   */
  getTemplatesByCategory(category) {
    return this.templates[category] || {};
  }

  /**
   * Get template file path
   */
  getTemplateFile(category, name) {
    const template = this.getTemplate(category, name);
    return template ? template.file : null;
  }

  /**
   * Get template search region
   */
  getTemplateRegion(category, name) {
    const template = this.getTemplate(category, name);
    return template ? template.region : null;
  }

  /**
   * Get template confidence threshold
   */
  getTemplateConfidence(category, name) {
    const template = this.getTemplate(category, name);
    return template ? template.confidence : 0.8;
  }

  /**
   * Get all available template categories
   */
  getCategories() {
    return Object.keys(this.templates);
  }

  /**
   * Get all template names in a category
   */
  getTemplateNames(category) {
    const categoryTemplates = this.templates[category];
    return categoryTemplates ? Object.keys(categoryTemplates) : [];
  }

  /**
   * Define carrier management navigation patterns
   */
  getCarrierNavigationPatterns() {
    return {
      // Pattern to open carrier management from right panel
      open_carrier_management: {
        steps: [
          { action: 'open_panel', panel: 4 },
          { action: 'wait_for_template', template: 'panels.right_panel_open' },
          { action: 'navigate_to', template: 'carrier.navigation_item' },
          { action: 'select_item' },
          { action: 'wait_for_template', template: 'carrier.management_panel' }
        ],
        description: 'Open carrier management panel from right panel'
      },

      // Pattern to access docking permissions
      access_docking_permissions: {
        prerequisites: ['carrier_management_open'],
        steps: [
          { action: 'navigate_menu', direction: 'down', steps: 1 },
          { action: 'select_item' },
          { action: 'wait_for_template', template: 'carrier.docking_permissions' }
        ],
        description: 'Navigate to docking permissions from carrier management'
      },

      // Pattern to change docking access
      change_docking_access: {
        prerequisites: ['docking_permissions_open'],
        steps: [
          { action: 'navigate_to_setting', setting: 'docking_access' },
          { action: 'cycle_option' },
          { action: 'confirm_selection' }
        ],
        description: 'Change docking access setting'
      },

      // Pattern to access services management
      access_services: {
        prerequisites: ['carrier_management_open'],
        steps: [
          { action: 'navigate_menu', direction: 'down', steps: 2 },
          { action: 'select_item' },
          { action: 'wait_for_template', template: 'carrier.services_panel' }
        ],
        description: 'Navigate to services management'
      },

      // Pattern to toggle a service
      toggle_service: {
        prerequisites: ['services_panel_open'],
        steps: [
          { action: 'navigate_to_service', service: 'parameter' },
          { action: 'toggle_selection' },
          { action: 'confirm_changes' }
        ],
        description: 'Toggle a carrier service on/off'
      }
    };
  }

  /**
   * Get service-specific templates
   */
  getServiceTemplates() {
    return {
      refuel: ['services.refuel_enabled', 'services.refuel_disabled'],
      shipyard: ['services.shipyard_enabled'],
      outfitting: ['services.outfitting_enabled'],
      commodities: ['services.commodities_enabled'],
      cartographics: ['services.cartographics_enabled']
    };
  }

  /**
   * Get docking access templates
   */
  getDockingAccessTemplates() {
    return {
      all: 'docking.access_all',
      squadron: 'docking.access_squadron',
      friends: 'docking.access_friends'
    };
  }

  /**
   * Get common UI flow templates
   */
  getUIFlowTemplates() {
    return {
      confirmation: ['buttons.confirm', 'buttons.cancel'],
      navigation: ['navigation.menu_selected', 'navigation.submenu_arrow'],
      state_detection: ['states.loading_screen', 'states.menu_transition']
    };
  }

  /**
   * Validate template definition
   */
  validateTemplate(category, name, template) {
    const required = ['file', 'description', 'region', 'confidence'];
    for (const field of required) {
      if (!template[field]) {
        logger.warn(`Template ${category}.${name} missing required field: ${field}`);
        return false;
      }
    }

    if (template.confidence < 0 || template.confidence > 1) {
      logger.warn(`Template ${category}.${name} has invalid confidence: ${template.confidence}`);
      return false;
    }

    return true;
  }

  /**
   * Add custom template
   */
  addTemplate(category, name, templateDef) {
    if (!this.validateTemplate(category, name, templateDef)) {
      return false;
    }

    if (!this.templates[category]) {
      this.templates[category] = {};
    }

    this.templates[category][name] = templateDef;
    logger.info(`Added custom template: ${category}.${name}`);
    return true;
  }

  /**
   * Remove template
   */
  removeTemplate(category, name) {
    if (this.templates[category] && this.templates[category][name]) {
      delete this.templates[category][name];
      logger.info(`Removed template: ${category}.${name}`);
      return true;
    }
    return false;
  }

  /**
   * Get template statistics
   */
  getTemplateStats() {
    const stats = {
      totalCategories: 0,
      totalTemplates: 0,
      templatesPerCategory: {}
    };

    for (const [category, templates] of Object.entries(this.templates)) {
      stats.totalCategories++;
      const count = Object.keys(templates).length;
      stats.totalTemplates += count;
      stats.templatesPerCategory[category] = count;
    }

    return stats;
  }
}

module.exports = ImageTemplates;