// Mock implementation for environments without native dependencies
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
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
 * Screen capture and computer vision for Elite Dangerous automation
 * Provides template matching and UI state detection capabilities
 */
class Screen {
  constructor() {
    this.templatePath = path.join(__dirname, 'templates');
    this.screenshotPath = path.join(__dirname, 'screenshots');
    this.ensureDirectories();
    
    // Template matching thresholds
    this.matchThreshold = 0.8; // 80% similarity required
    this.templates = new Map();
    
    this.loadTemplates();
  }

  /**
   * Ensure required directories exist
   */
  ensureDirectories() {
    [this.templatePath, this.screenshotPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Load template images for UI element recognition
   */
  async loadTemplates() {
    try {
      if (!fs.existsSync(this.templatePath)) {
        logger.warn('Templates directory not found, creating with default templates');
        await this.createDefaultTemplates();
        return;
      }

      const templateFiles = fs.readdirSync(this.templatePath)
        .filter(file => file.match(/\.(png|jpg|jpeg)$/i));

      for (const file of templateFiles) {
        try {
          const templateName = path.parse(file).name;
          const templatePath = path.join(this.templatePath, file);
          const template = await Jimp.read(templatePath);
          
          this.templates.set(templateName, {
            image: template,
            path: templatePath,
            width: template.bitmap.width,
            height: template.bitmap.height
          });
          
          logger.info(`Loaded template: ${templateName}`);
        } catch (error) {
          logger.warn(`Failed to load template ${file}:`, error.message);
        }
      }

      logger.info(`Loaded ${this.templates.size} templates`);
    } catch (error) {
      logger.error('Failed to load templates:', error);
    }
  }

  /**
   * Create default template placeholders
   */
  async createDefaultTemplates() {
    // Create placeholder templates for common Elite Dangerous UI elements
    const defaultTemplates = [
      'carrier_management_panel',
      'docking_permissions',
      'services_panel',
      'jump_plot_button',
      'confirm_button',
      'cancel_button',
      'panel_navigation_carrier',
      'right_panel_open',
      'galaxy_map_open'
    ];

    try {
      // Create simple colored rectangles as template placeholders
      for (const templateName of defaultTemplates) {
        const placeholder = new Jimp(100, 50, 0x000000ff); // Black rectangle
        await placeholder.print(Jimp.FONT_SANS_16_WHITE, 10, 15, templateName.toUpperCase());
        
        const templatePath = path.join(this.templatePath, `${templateName}.png`);
        await placeholder.writeAsync(templatePath);
        
        this.templates.set(templateName, {
          image: placeholder,
          path: templatePath,
          width: 100,
          height: 50
        });
      }

      logger.info(`Created ${defaultTemplates.length} default template placeholders`);
    } catch (error) {
      logger.error('Failed to create default templates:', error);
    }
  }

  /**
   * Capture current screen
   */
  async captureScreen(region = null) {
    try {
      logger.info('[MOCK] Capturing screen...');
      
      // Create a mock screenshot (black image)
      const width = region?.width || 1920;
      const height = region?.height || 1080;
      
      const jimpImage = new Jimp(width, height, 0x000000ff); // Black image
      
      // Add some mock UI elements for testing (simplified without fonts)
      // In production, this would capture real screenshots

      // Save screenshot for debugging
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotPath = path.join(this.screenshotPath, `mock_screenshot_${timestamp}.png`);
      await jimpImage.writeAsync(screenshotPath);
      
      logger.info(`Mock screenshot saved: ${screenshotPath}`);
      return jimpImage;
    } catch (error) {
      logger.error('Failed to capture screen:', error);
      return null;
    }
  }

  /**
   * Find template in screenshot using template matching
   */
  async findTemplate(templateName, screenshot = null, options = {}) {
    try {
      if (!this.templates.has(templateName)) {
        logger.warn(`Template ${templateName} not found`);
        return null;
      }

      const template = this.templates.get(templateName);
      const currentScreenshot = screenshot || await this.captureScreen();
      
      if (!currentScreenshot) {
        return null;
      }

      logger.info(`Searching for template: ${templateName}`);

      // Perform template matching
      const matches = await this.templateMatch(currentScreenshot, template.image, options);
      
      if (matches.length > 0) {
        const bestMatch = matches[0];
        logger.info(`Found ${templateName} at (${bestMatch.x}, ${bestMatch.y}) with confidence ${bestMatch.confidence}`);
        return bestMatch;
      }

      logger.info(`Template ${templateName} not found on screen`);
      return null;
    } catch (error) {
      logger.error(`Error finding template ${templateName}:`, error);
      return null;
    }
  }

  /**
   * Template matching algorithm
   */
  async templateMatch(screenshot, template, options = {}) {
    const threshold = options.threshold || this.matchThreshold;
    const maxMatches = options.maxMatches || 1;
    const matches = [];

    try {
      const screenshotWidth = screenshot.bitmap.width;
      const screenshotHeight = screenshot.bitmap.height;
      const templateWidth = template.bitmap.width;
      const templateHeight = template.bitmap.height;

      // Simple template matching by sliding window
      for (let y = 0; y <= screenshotHeight - templateHeight; y += 5) {
        for (let x = 0; x <= screenshotWidth - templateWidth; x += 5) {
          const similarity = await this.compareRegions(
            screenshot, x, y, templateWidth, templateHeight,
            template, 0, 0, templateWidth, templateHeight
          );

          if (similarity >= threshold) {
            matches.push({
              x,
              y,
              width: templateWidth,
              height: templateHeight,
              confidence: similarity
            });

            if (matches.length >= maxMatches) {
              break;
            }
          }
        }
        if (matches.length >= maxMatches) {
          break;
        }
      }

      // Sort by confidence (highest first)
      matches.sort((a, b) => b.confidence - a.confidence);
      return matches;
    } catch (error) {
      logger.error('Template matching failed:', error);
      return [];
    }
  }

  /**
   * Compare two image regions for similarity
   */
  async compareRegions(img1, x1, y1, w1, h1, img2, x2, y2, w2, h2) {
    try {
      if (w1 !== w2 || h1 !== h2) {
        return 0; // Different sizes
      }

      let totalPixels = 0;
      let matchingPixels = 0;
      const tolerance = 30; // Color tolerance

      for (let y = 0; y < h1; y++) {
        for (let x = 0; x < w1; x++) {
          const pixel1 = Jimp.intToRGBA(img1.getPixelColor(x1 + x, y1 + y));
          const pixel2 = Jimp.intToRGBA(img2.getPixelColor(x2 + x, y2 + y));

          const rDiff = Math.abs(pixel1.r - pixel2.r);
          const gDiff = Math.abs(pixel1.g - pixel2.g);
          const bDiff = Math.abs(pixel1.b - pixel2.b);

          if (rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance) {
            matchingPixels++;
          }
          totalPixels++;
        }
      }

      return totalPixels > 0 ? matchingPixels / totalPixels : 0;
    } catch (error) {
      logger.error('Region comparison failed:', error);
      return 0;
    }
  }

  /**
   * Wait for a template to appear on screen
   */
  async waitForTemplate(templateName, timeoutMs = 10000, intervalMs = 500) {
    const startTime = Date.now();
    
    logger.info(`Waiting for template ${templateName} (timeout: ${timeoutMs}ms)`);

    while (Date.now() - startTime < timeoutMs) {
      const match = await this.findTemplate(templateName);
      if (match) {
        logger.info(`Template ${templateName} appeared after ${Date.now() - startTime}ms`);
        return match;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    logger.warn(`Template ${templateName} not found within ${timeoutMs}ms timeout`);
    return null;
  }

  /**
   * Wait for a template to disappear from screen
   */
  async waitForTemplateDisappear(templateName, timeoutMs = 5000, intervalMs = 500) {
    const startTime = Date.now();
    
    logger.info(`Waiting for template ${templateName} to disappear (timeout: ${timeoutMs}ms)`);

    while (Date.now() - startTime < timeoutMs) {
      const match = await this.findTemplate(templateName);
      if (!match) {
        logger.info(`Template ${templateName} disappeared after ${Date.now() - startTime}ms`);
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    logger.warn(`Template ${templateName} still visible after ${timeoutMs}ms timeout`);
    return false;
  }

  /**
   * Detect Elite Dangerous UI state
   */
  async detectEDState() {
    try {
      const screenshot = await this.captureScreen();
      if (!screenshot) {
        return { state: 'unknown', confidence: 0 };
      }

      // Check for common UI states
      const states = [
        { name: 'right_panel_open', template: 'right_panel_open' },
        { name: 'carrier_management', template: 'carrier_management_panel' },
        { name: 'galaxy_map', template: 'galaxy_map_open' },
        { name: 'docking_permissions', template: 'docking_permissions' },
        { name: 'services_panel', template: 'services_panel' }
      ];

      for (const state of states) {
        const match = await this.findTemplate(state.template, screenshot);
        if (match) {
          return { 
            state: state.name, 
            confidence: match.confidence,
            position: { x: match.x, y: match.y }
          };
        }
      }

      return { state: 'main_game', confidence: 0.5 };
    } catch (error) {
      logger.error('Failed to detect ED state:', error);
      return { state: 'unknown', confidence: 0 };
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Array.from(this.templates.keys());
  }

  /**
   * Add new template from file
   */
  async addTemplate(name, imagePath) {
    try {
      const template = await Jimp.read(imagePath);
      this.templates.set(name, {
        image: template,
        path: imagePath,
        width: template.bitmap.width,
        height: template.bitmap.height
      });
      
      logger.info(`Added template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Failed to add template ${name}:`, error);
      return false;
    }
  }

  /**
   * Save current screen region as template
   */
  async saveRegionAsTemplate(name, region) {
    try {
      const screenshot = await this.captureScreen(region);
      if (!screenshot) {
        return false;
      }

      const templatePath = path.join(this.templatePath, `${name}.png`);
      await screenshot.writeAsync(templatePath);
      
      await this.addTemplate(name, templatePath);
      logger.info(`Saved region as template: ${name}`);
      return true;
    } catch (error) {
      logger.error(`Failed to save region as template ${name}:`, error);
      return false;
    }
  }
}

module.exports = Screen;