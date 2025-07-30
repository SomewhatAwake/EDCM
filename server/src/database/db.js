const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    const dbPath = process.env.DB_PATH || './data/carrier.db';
    const dbDir = path.dirname(dbPath);
    
    // Ensure data directory exists
    await fs.ensureDir(dbDir);
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS carriers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id INTEGER,
        current_system TEXT,
        docking_access TEXT DEFAULT 'all',
        notorious_access BOOLEAN DEFAULT 0,
        fuel_level INTEGER DEFAULT 0,
        jump_cooldown INTEGER DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS carrier_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        carrier_id TEXT,
        service_type TEXT NOT NULL,
        enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY (carrier_id) REFERENCES carriers (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS carrier_finance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        carrier_id TEXT,
        balance INTEGER DEFAULT 0,
        upkeep_cost INTEGER DEFAULT 0,
        next_upkeep DATETIME,
        FOREIGN KEY (carrier_id) REFERENCES carriers (id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME,
        event_type TEXT,
        event_data TEXT,
        processed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();
