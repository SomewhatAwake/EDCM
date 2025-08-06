const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
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
 * OCR (Optical Character Recognition) for Elite Dangerous
 * Provides text recognition capabilities for reading game UI text
 */
class OCR {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.initializeWorker();
  }

  /**
   * Initialize Tesseract OCR worker
   */
  async initializeWorker() {
    try {
      logger.info('Initializing OCR worker...');
      
      // Check if we're in a testing/offline environment
      if (process.env.NODE_ENV === 'test' || process.env.MOCK_MODE === 'true') {
        logger.info('Running in mock mode, skipping OCR initialization');
        this.isInitialized = true;
        return;
      }

      this.worker = await Tesseract.createWorker('eng');
      
      // Optimize for Elite Dangerous UI text
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -.:,()[]',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: '1'
      });

      this.isInitialized = true;
      logger.info('OCR worker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize OCR worker:', error);
      logger.info('Falling back to mock mode');
      this.isInitialized = true; // Allow graceful fallback
    }
  }

  /**
   * Read text from image buffer or file path
   */
  async readText(imageSource, options = {}) {
    if (!this.isInitialized) {
      logger.warn('OCR worker not initialized, attempting to initialize...');
      await this.initializeWorker();
      if (!this.isInitialized) {
        throw new Error('OCR worker initialization failed');
      }
    }

    try {
      logger.info('Reading text from image...');
      
      // Check if we're in mock mode
      if (!this.worker) {
        logger.info('[MOCK] OCR reading text from image');
        return {
          text: 'Mock OCR Text',
          confidence: 85,
          words: [{ text: 'Mock', confidence: 85, bbox: { x0: 0, y0: 0, x1: 50, y1: 20 } }]
        };
      }
      
      // Preprocess image for better OCR accuracy
      const processedImage = await this.preprocessImage(imageSource, options);
      
      // Perform OCR
      const { data } = await this.worker.recognize(processedImage);
      
      const result = {
        text: data.text.trim(),
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        }))
      };

      logger.info(`OCR result: "${result.text}" (confidence: ${result.confidence}%)`);
      return result;
    } catch (error) {
      logger.error('OCR failed:', error);
      return { text: '', confidence: 0, words: [] };
    }
  }

  /**
   * Read text from specific screen region
   */
  async readTextFromRegion(screenshot, region, options = {}) {
    try {
      // Extract region from screenshot
      const regionImage = screenshot.clone().crop(
        region.x, 
        region.y, 
        region.width, 
        region.height
      );

      // Convert to buffer for OCR
      const buffer = await regionImage.getBufferAsync(Jimp.MIME_PNG);
      
      return await this.readText(buffer, options);
    } catch (error) {
      logger.error('Failed to read text from region:', error);
      return { text: '', confidence: 0, words: [] };
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   */
  async preprocessImage(imageSource, options = {}) {
    try {
      let image;
      
      if (Buffer.isBuffer(imageSource)) {
        image = await Jimp.read(imageSource);
      } else if (typeof imageSource === 'string') {
        image = await Jimp.read(imageSource);
      } else {
        image = imageSource; // Assume it's already a Jimp image
      }

      // Apply preprocessing based on options
      if (options.enhanceContrast !== false) {
        image = image.contrast(0.3);
      }

      if (options.grayscale !== false) {
        image = image.greyscale();
      }

      if (options.threshold !== false) {
        // Apply threshold to make text more distinct
        image = image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
          const gray = this.bitmap.data[idx]; // Grayscale value
          const threshold = options.thresholdValue || 128;
          const newValue = gray > threshold ? 255 : 0;
          
          this.bitmap.data[idx] = newValue;     // R
          this.bitmap.data[idx + 1] = newValue; // G
          this.bitmap.data[idx + 2] = newValue; // B
        });
      }

      if (options.scale && options.scale !== 1) {
        const newWidth = Math.round(image.bitmap.width * options.scale);
        const newHeight = Math.round(image.bitmap.height * options.scale);
        image = image.resize(newWidth, newHeight, Jimp.RESIZE_BICUBIC);
      }

      return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
      logger.error('Image preprocessing failed:', error);
      return imageSource;
    }
  }

  /**
   * Read carrier name from UI
   */
  async readCarrierName(screenshot) {
    if (!this.worker) {
      return 'MOCK CARRIER NAME';
    }
    
    const nameRegion = { x: 1400, y: 120, width: 400, height: 60 };
    
    const result = await this.readTextFromRegion(screenshot, nameRegion, {
      enhanceContrast: true,
      scale: 2
    });

    return result.text;
  }

  /**
   * Read current system name
   */
  async readCurrentSystem(screenshot) {
    if (!this.worker) {
      return 'Mock System';
    }
    
    const systemRegion = { x: 1450, y: 180, width: 350, height: 40 };
    
    const result = await this.readTextFromRegion(screenshot, systemRegion, {
      enhanceContrast: true,
      threshold: true,
      thresholdValue: 140
    });

    return result.text;
  }

  /**
   * Read fuel level information
   */
  async readFuelLevel(screenshot) {
    if (!this.worker) {
      return { current: 750, maximum: 1000, raw: '750 / 1000' };
    }
    
    const fuelRegion = { x: 1400, y: 220, width: 200, height: 40 };
    
    const result = await this.readTextFromRegion(screenshot, fuelRegion, {
      enhanceContrast: true,
      scale: 1.5
    });

    // Extract numeric values from text like "750 / 1000"
    const match = result.text.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      return {
        current: parseInt(match[1]),
        maximum: parseInt(match[2]),
        raw: result.text
      };
    }

    return { current: 0, maximum: 1000, raw: result.text };
  }

  /**
   * Read jump cooldown timer
   */
  async readJumpCooldown(screenshot) {
    const cooldownRegion = { x: 1400, y: 260, width: 150, height: 30 };
    
    const result = await this.readTextFromRegion(screenshot, cooldownRegion, {
      enhanceContrast: true,
      threshold: true
    });

    // Extract time format like "01:23:45"
    const match = result.text.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      return {
        hours,
        minutes,
        seconds,
        totalSeconds: hours * 3600 + minutes * 60 + seconds,
        raw: result.text
      };
    }

    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, raw: result.text };
  }

  /**
   * Read docking access setting
   */
  async readDockingAccess(screenshot) {
    const accessRegion = { x: 1400, y: 320, width: 200, height: 40 };
    
    const result = await this.readTextFromRegion(screenshot, accessRegion, {
      enhanceContrast: true,
      scale: 1.5
    });

    const text = result.text.toLowerCase();
    
    if (text.includes('all')) return 'all';
    if (text.includes('squadron')) return 'squadron';
    if (text.includes('friends')) return 'friends';
    
    return 'unknown';
  }

  /**
   * Read service status (enabled/disabled)
   */
  async readServiceStatus(screenshot, serviceType) {
    const serviceRegions = {
      refuel: { x: 1400, y: 250, width: 400, height: 40 },
      shipyard: { x: 1400, y: 300, width: 400, height: 40 },
      outfitting: { x: 1400, y: 350, width: 400, height: 40 },
      commodities: { x: 1400, y: 400, width: 400, height: 40 },
      cartographics: { x: 1400, y: 450, width: 400, height: 40 }
    };

    const region = serviceRegions[serviceType.toLowerCase()];
    if (!region) {
      logger.warn(`Unknown service type: ${serviceType}`);
      return false;
    }

    const result = await this.readTextFromRegion(screenshot, region, {
      enhanceContrast: true,
      scale: 1.5
    });

    const text = result.text.toLowerCase();
    return text.includes('enabled') || text.includes('online') || text.includes('active');
  }

  /**
   * Read balance/credits information
   */
  async readBalance(screenshot) {
    const balanceRegion = { x: 1400, y: 500, width: 250, height: 40 };
    
    const result = await this.readTextFromRegion(screenshot, balanceRegion, {
      enhanceContrast: true,
      scale: 1.5,
      threshold: true
    });

    // Extract numeric values and units (CR, K, M, B)
    const match = result.text.match(/([\d,]+(?:\.\d+)?)\s*(CR|K|M|B)?/i);
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ''));
      const unit = match[2]?.toUpperCase();
      
      switch (unit) {
        case 'K': value *= 1000; break;
        case 'M': value *= 1000000; break;
        case 'B': value *= 1000000000; break;
      }
      
      return {
        value: Math.round(value),
        formatted: result.text,
        raw: result.text
      };
    }

    return { value: 0, formatted: '0 CR', raw: result.text };
  }

  /**
   * Read menu option text
   */
  async readMenuOption(screenshot, region) {
    const result = await this.readTextFromRegion(screenshot, region, {
      enhanceContrast: true,
      scale: 2,
      threshold: false
    });

    return result.text;
  }

  /**
   * Verify text contains expected content
   */
  verifyText(actualText, expectedText, threshold = 0.7) {
    if (!actualText || !expectedText) return false;

    const actual = actualText.toLowerCase().trim();
    const expected = expectedText.toLowerCase().trim();

    // Exact match
    if (actual === expected) return true;

    // Partial match
    if (actual.includes(expected) || expected.includes(actual)) return true;

    // Similarity check using simple Levenshtein distance
    const similarity = this.calculateSimilarity(actual, expected);
    return similarity >= threshold;
  }

  /**
   * Calculate text similarity (simple implementation)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Cleanup resources
   */
  async terminate() {
    if (this.worker) {
      try {
        await this.worker.terminate();
        logger.info('OCR worker terminated');
      } catch (error) {
        logger.error('Error terminating OCR worker:', error);
      }
    }
  }
}

module.exports = OCR;