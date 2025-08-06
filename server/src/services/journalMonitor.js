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
          logger.error(`Error parsing journal line in ${filePath}:`, parseError);
        }
      }
    } catch (error) {
      logger.error(`Error processing journal file ${filePath}:`, error);
    }
  }

  async processJournalEntry(entry) {
    const timestamp = new Date(entry.timestamp);
    
    // For initial processing, process all carrier events regardless of timestamp
    // For ongoing monitoring, only process recent entries
    const isCarrierEvent = entry.event && entry.event.includes('Carrier');
    const isRecentEntry = timestamp > this.lastProcessedTime;
    
    if (!isCarrierEvent && !isRecentEntry) {
      return;
    }

    // Log all carrier entries for debugging
    if (isCarrierEvent) {
      logger.info(`Processing carrier journal entry: ${entry.event} at ${entry.timestamp} for carrier ${entry.CarrierID || 'unknown'}`);
    }

    // Store entry in database
    await database.run(
      'INSERT OR REPLACE INTO journal_entries (timestamp, event_type, event_data) VALUES (?, ?, ?)',
      [entry.timestamp, entry.event, JSON.stringify(entry)]
    );

    // Process carrier-related events
    if (isCarrierEvent) {
      await this.handleCarrierEvent(entry);
    }

    if (isRecentEntry) {
      this.lastProcessedTime = timestamp;
    }
  }

  async handleCarrierEvent(entry) {
    logger.info(`handleCarrierEvent called with event: ${entry.event}`);
    
    switch (entry.event) {
      case 'CarrierJump':
        logger.info(`Processing CarrierJump for carrier ${entry.CarrierID}`);
        await this.handleCarrierJump(entry);
        break;
      case 'CarrierStats':
        logger.info(`Processing CarrierStats for carrier ${entry.CarrierID}`);
        await this.handleCarrierStats(entry);
        break;
      case 'CarrierFinance':
        logger.info(`Processing CarrierFinance for carrier ${entry.CarrierID}`);
        await this.handleCarrierFinance(entry);
        break;
      case 'CarrierDockingPermission':
        logger.info(`Processing CarrierDockingPermission for carrier ${entry.CarrierID}`);
        await this.handleCarrierDockingPermission(entry);
        break;
      case 'CarrierNameChanged':
        logger.info(`Processing CarrierNameChanged for carrier ${entry.CarrierID}`);
        await this.handleCarrierNameChanged(entry);
        break;
      case 'CarrierLocation':
        logger.info(`Processing CarrierLocation for carrier ${entry.CarrierID} in system ${entry.StarSystem}`);
        await this.handleCarrierLocation(entry);
        break;
      case 'CarrierCrewServices':
        logger.info(`Processing CarrierCrewServices for carrier ${entry.CarrierID}: ${entry.Operation} ${entry.CrewRole}`);
        await this.handleCarrierCrewServices(entry);
        break;
      default:
        // Handle other carrier events as needed
        break;
    }
  }

  async handleCarrierJump(entry) {
    const { CarrierID, StarSystem } = entry;
    
    if (CarrierID) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;

      await database.run(
        'UPDATE carriers SET current_system = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [StarSystem, carrierCallsign]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_jump', {
        carrierId: carrierCallsign,
        system: StarSystem,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} jumped to ${StarSystem}`);
    }
  }

  async handleCarrierStats(entry) {
    const { CarrierID, Callsign, Name, FuelLevel, JumpCooldown } = entry;
    
    if (Callsign) {
      // Update or insert carrier using Callsign as ID
      const existingCarrier = await database.get(
        'SELECT id FROM carriers WHERE id = ?',
        [Callsign]
      );

      if (existingCarrier) {
        await database.run(
          'UPDATE carriers SET internal_id = ?, name = ?, fuel_level = ?, jump_cooldown = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
          [CarrierID, Name, FuelLevel || 0, JumpCooldown || 0, Callsign]
        );
      } else {
        await database.run(
          'INSERT INTO carriers (id, internal_id, name, fuel_level, jump_cooldown) VALUES (?, ?, ?, ?, ?)',
          [Callsign, CarrierID, Name, FuelLevel || 0, JumpCooldown || 0]
        );
      }

      // Broadcast update to connected clients
      this.io.to(`carrier_${Callsign}`).emit('carrier_stats', {
        carrierId: Callsign,
        name: Name,
        fuelLevel: FuelLevel,
        jumpCooldown: JumpCooldown,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${Callsign} (${Name}) stats updated`);
    }
  }

  async handleCarrierFinance(entry) {
    const { CarrierID, CarrierBalance, ReserveBalance, AvailableBalance } = entry;
    
    if (CarrierID) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;

      // Update or insert carrier finance data
      const existingFinance = await database.get(
        'SELECT id FROM carrier_finance WHERE carrier_id = ?',
        [carrierCallsign]
      );

      if (existingFinance) {
        await database.run(
          'UPDATE carrier_finance SET balance = ? WHERE carrier_id = ?',
          [CarrierBalance, carrierCallsign]
        );
      } else {
        await database.run(
          'INSERT INTO carrier_finance (carrier_id, balance) VALUES (?, ?)',
          [carrierCallsign, CarrierBalance]
        );
      }

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_finance', {
        carrierId: carrierCallsign,
        balance: CarrierBalance,
        reserveBalance: ReserveBalance,
        availableBalance: AvailableBalance,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} finance updated`);
    }
  }

  async handleCarrierDockingPermission(entry) {
    const { CarrierID, DockingAccess, AllowNotorious } = entry;
    
    if (CarrierID) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;

      await database.run(
        'UPDATE carriers SET docking_access = ?, notorious_access = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [DockingAccess, AllowNotorious ? 1 : 0, carrierCallsign]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_docking_permission', {
        carrierId: carrierCallsign,
        dockingAccess: DockingAccess,
        allowNotorious: AllowNotorious,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} docking permissions updated`);
    }
  }

  async handleCarrierNameChanged(entry) {
    const { CarrierID, Name } = entry;
    
    if (CarrierID) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;

      await database.run(
        'UPDATE carriers SET name = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [Name, carrierCallsign]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_name_changed', {
        carrierId: carrierCallsign,
        name: Name,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} name changed to ${Name}`);
    }
  }

  async handleCarrierLocation(entry) {
    const { CarrierID, StarSystem } = entry;
    
    if (CarrierID && StarSystem) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;

      await database.run(
        'UPDATE carriers SET current_system = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
        [StarSystem, carrierCallsign]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_location_changed', {
        carrierId: carrierCallsign,
        currentSystem: StarSystem,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} location updated to ${StarSystem}`);
    }
  }

  async handleCarrierCrewServices(entry) {
    const { CarrierID, CrewRole, Operation, CrewName } = entry;
    
    if (CarrierID && CrewRole && Operation) {
      // Look up the Callsign based on the CarrierID
      const carrier = await database.get(
        'SELECT id FROM carriers WHERE internal_id = ?',
        [CarrierID]
      );

      if (!carrier) {
        logger.warn(`Carrier with internal ID ${CarrierID} not found in database`);
        return;
      }

      const carrierCallsign = carrier.id;
      const enabled = Operation === 'Activate';
      
      // Update or insert carrier service
      await database.run(
        'INSERT OR REPLACE INTO carrier_services (carrier_id, service_type, enabled) VALUES (?, ?, ?)',
        [carrierCallsign, CrewRole, enabled ? 1 : 0]
      );

      // Broadcast update to connected clients
      this.io.to(`carrier_${carrierCallsign}`).emit('carrier_service_changed', {
        carrierId: carrierCallsign,
        serviceType: CrewRole,
        enabled: enabled,
        crewName: CrewName,
        timestamp: entry.timestamp
      });

      logger.info(`Carrier ${carrierCallsign} service ${CrewRole} ${enabled ? 'activated' : 'deactivated'} by ${CrewName}`);
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
