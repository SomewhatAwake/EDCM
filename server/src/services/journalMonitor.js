const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const winston = require('winston');
const database = require('../database/db');

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

class JournalMonitor {
  constructor() {
    this.watcher = null;
    this.io = null;
    this.journalPath = process.env.ED_JOURNAL_PATH;
    this.lastProcessedTime = new Date();
  }

  start(io) {
    this.io = io;
    
    if (!this.journalPath) {
      logger.warn('ED_JOURNAL_PATH not configured, journal monitoring disabled');
      return;
    }

    if (!fs.existsSync(this.journalPath)) {
      logger.warn(`Journal path does not exist: ${this.journalPath}`);
      return;
    }

    // Watch for new journal files
    this.watcher = chokidar.watch(path.join(this.journalPath, 'Journal.*.log'), {
      persistent: true,
      ignoreInitial: false
    });

    this.watcher.on('add', (filePath) => {
      logger.info(`New journal file detected: ${filePath}`);
      this.processJournalFile(filePath);
    });

    this.watcher.on('change', (filePath) => {
      logger.info(`Journal file updated: ${filePath}`);
      this.processJournalFile(filePath);
    });

    logger.info('Journal monitor started');
  }

  async processJournalFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          await this.processJournalEntry(entry);
        } catch (parseError) {
          // Skip invalid JSON lines
          continue;
        }
      }
    } catch (error) {
      logger.error(`Error processing journal file ${filePath}:`, error);
    }
  }

  async processJournalEntry(entry) {
    const timestamp = new Date(entry.timestamp);
    
    // Skip entries we've already processed
    if (timestamp <= this.lastProcessedTime) {
      return;
    }

    // Store entry in database
    await database.run(
      'INSERT INTO journal_entries (timestamp, event_type, event_data) VALUES (?, ?, ?)',
      [entry.timestamp, entry.event, JSON.stringify(entry)]
    );

    // Process carrier-related events
    await this.handleCarrierEvent(entry);

    this.lastProcessedTime = timestamp;
  }

  async handleCarrierEvent(entry) {
    switch (entry.event) {
      case 'CarrierJump':
        await this.handleCarrierJump(entry);
        break;
      case 'CarrierStats':
        await this.handleCarrierStats(entry);
        break;
      case 'CarrierFinance':
        await this.handleCarrierFinance(entry);
        break;
      case 'CarrierDockingPermission':
        await this.handleCarrierDockingPermission(entry);
        break;
      case 'CarrierNameChanged':
        await this.handleCarrierNameChanged(entry);
        break;
      default:
        // Handle other carrier events as needed
        break;
    }
  }

  async handleCarrierJump(entry) {
    const { CarrierID, StarSystem } = entry;
    
    if (CarrierID) {
      await database.run(
        'UPDATE carriers SET current_system = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [StarSystem, CarrierID]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${CarrierID}`).emit('carrier_jump', {
        carrierId: CarrierID,
        system: StarSystem,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${CarrierID} jumped to ${StarSystem}`);
    }
  }

  async handleCarrierStats(entry) {
    const { CarrierID, Name, FuelLevel, JumpCooldown } = entry;
    
    if (CarrierID) {
      // Update or insert carrier
      const existingCarrier = await database.get(
        'SELECT id FROM carriers WHERE id = ?',
        [CarrierID]
      );

      if (existingCarrier) {
        await database.run(
          'UPDATE carriers SET name = ?, fuel_level = ?, jump_cooldown = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
          [Name, FuelLevel || 0, JumpCooldown || 0, CarrierID]
        );
      } else {
        await database.run(
          'INSERT INTO carriers (id, name, fuel_level, jump_cooldown) VALUES (?, ?, ?, ?)',
          [CarrierID, Name, FuelLevel || 0, JumpCooldown || 0]
        );
      }

      // Broadcast update to connected clients
      this.io.to(`carrier_${CarrierID}`).emit('carrier_stats', {
        carrierId: CarrierID,
        name: Name,
        fuelLevel: FuelLevel,
        jumpCooldown: JumpCooldown,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${CarrierID} stats updated`);
    }
  }

  async handleCarrierFinance(entry) {
    const { CarrierID, CarrierBalance, ReserveBalance, AvailableBalance } = entry;
    
    if (CarrierID) {
      // Update or insert carrier finance data
      const existingFinance = await database.get(
        'SELECT id FROM carrier_finance WHERE carrier_id = ?',
        [CarrierID]
      );

      if (existingFinance) {
        await database.run(
          'UPDATE carrier_finance SET balance = ? WHERE carrier_id = ?',
          [CarrierBalance, CarrierID]
        );
      } else {
        await database.run(
          'INSERT INTO carrier_finance (carrier_id, balance) VALUES (?, ?)',
          [CarrierID, CarrierBalance]
        );
      }

      // Broadcast update to connected clients
      this.io.to(`carrier_${CarrierID}`).emit('carrier_finance', {
        carrierId: CarrierID,
        balance: CarrierBalance,
        reserveBalance: ReserveBalance,
        availableBalance: AvailableBalance,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${CarrierID} finance updated`);
    }
  }

  async handleCarrierDockingPermission(entry) {
    const { CarrierID, DockingAccess, AllowNotorious } = entry;
    
    if (CarrierID) {
      await database.run(
        'UPDATE carriers SET docking_access = ?, notorious_access = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [DockingAccess, AllowNotorious ? 1 : 0, CarrierID]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${CarrierID}`).emit('carrier_docking_permission', {
        carrierId: CarrierID,
        dockingAccess: DockingAccess,
        allowNotorious: AllowNotorious,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${CarrierID} docking permissions updated`);
    }
  }

  async handleCarrierNameChanged(entry) {
    const { CarrierID, Name } = entry;
    
    if (CarrierID) {
      await database.run(
        'UPDATE carriers SET name = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [Name, CarrierID]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${CarrierID}`).emit('carrier_name_changed', {
        carrierId: CarrierID,
        name: Name,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${CarrierID} name changed to ${Name}`);
    }
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('Journal monitor stopped');
    }
  }
}

module.exports = new JournalMonitor();
