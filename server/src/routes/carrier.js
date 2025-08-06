const express = require('express');
const database = require('../database/db');
const carrierService = require('../services/carrierService');

const router = express.Router();

// Get all carriers
router.get('/', async (req, res) => {
  try {
    const carriers = await database.all(
      `SELECT c.*, cf.balance, cf.upkeep_cost, cf.next_upkeep 
       FROM carriers c 
       LEFT JOIN carrier_finance cf ON c.id = cf.carrier_id`
    );

    // Get services for each carrier
    for (const carrier of carriers) {
      const services = await database.all(
        'SELECT service_type, enabled FROM carrier_services WHERE carrier_id = ?',
        [carrier.id]
      );
      carrier.services = services;
    }

    res.json(carriers);
  } catch (error) {
    console.error('Error fetching carriers:', error);
    res.status(500).json({ error: 'Failed to fetch carriers' });
  }
});

// Get specific carrier details
router.get('/:callsign', async (req, res) => {
  try {
    const { callsign } = req.params;

    const carrier = await database.get(
      `SELECT c.*, cf.balance, cf.upkeep_cost, cf.next_upkeep 
       FROM carriers c 
       LEFT JOIN carrier_finance cf ON c.id = cf.carrier_id 
       WHERE c.id = ?`,
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Get carrier services
    const services = await database.all(
      'SELECT service_type, enabled FROM carrier_services WHERE carrier_id = ?',
      [callsign]
    );

    res.json({
      ...carrier,
      services
    });
  } catch (error) {
    console.error('Error fetching carrier:', error);
    res.status(500).json({ error: 'Failed to fetch carrier' });
  }
});

// Update carrier docking permissions
router.put('/:callsign/docking', async (req, res) => {
  try {
    const { callsign } = req.params;
    const { docking_access: dockingAccess, notorious_access: notoriousAccess } = req.body;

    // Check if carrier exists
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Validate docking access values
    const validAccess = ['all', 'friends', 'squadron', 'squadronfriends'];
    if (!validAccess.includes(dockingAccess)) {
      return res.status(400).json({ error: 'Invalid docking access setting' });
    }

    // Execute the docking permission change
    const success = await carrierService.updateDockingPermissions(callsign, dockingAccess, notoriousAccess);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update docking permissions' });
    }

    // Update database
    await database.run(
      'UPDATE carriers SET docking_access = ?, notorious_access = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [dockingAccess, notoriousAccess ? 1 : 0, callsign]
    );

    res.json({ 
      message: 'Docking permissions updated successfully',
      dockingAccess,
      notoriousAccess
    });

  } catch (error) {
    console.error('Error updating docking permissions:', error);
    res.status(500).json({ error: 'Failed to update docking permissions' });
  }
});

// Jump carrier to system
router.post('/:callsign/jump', async (req, res) => {
  try {
    const { callsign } = req.params;
    const { targetSystem } = req.body;

    if (!targetSystem) {
      return res.status(400).json({ error: 'Target system is required' });
    }

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id, current_system, fuel_level FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Check if carrier has enough fuel (simplified check)
    if (carrier.fuel_level < 50) {
      return res.status(400).json({ error: 'Insufficient fuel for jump' });
    }

    // Execute the jump command
    const success = await carrierService.jumpToSystem(callsign, targetSystem);

    if (!success) {
      return res.status(500).json({ error: 'Failed to initiate jump' });
    }

    res.json({ 
      message: 'Jump initiated successfully',
      targetSystem,
      currentSystem: carrier.current_system
    });

  } catch (error) {
    console.error('Error initiating jump:', error);
    res.status(500).json({ error: 'Failed to initiate jump' });
  }
});

// Update carrier services
router.put('/:callsign/services', async (req, res) => {
  try {
    const { callsign } = req.params;
    const { services } = req.body;

    // Check if carrier exists
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Update services
    for (const service of services) {
      const success = await carrierService.updateService(
        callsign, 
        service.type, 
        service.enabled
      );

      if (success) {
        // Update database
        await database.run(
          `INSERT OR REPLACE INTO carrier_services (carrier_id, service_type, enabled) 
           VALUES (?, ?, ?)`,
          [callsign, service.type, service.enabled ? 1 : 0]
        );
      }
    }

    res.json({ message: 'Services updated successfully' });

  } catch (error) {
    console.error('Error updating services:', error);
    res.status(500).json({ error: 'Failed to update services' });
  }
});

// Get carrier market data
router.get('/:callsign/market', async (req, res) => {
  try {
    const { callsign } = req.params;

    // Check if carrier exists
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Get market data (this would be populated by journal monitoring)
    const marketData = await carrierService.getMarketData(callsign);

    res.json(marketData);

  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Update carrier name
router.put('/:callsign/name', async (req, res) => {
  try {
    const { callsign } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if carrier exists
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Execute the name change command
    const success = await carrierService.updateCarrierName(callsign, name.trim());

    if (!success) {
      return res.status(500).json({ error: 'Failed to update carrier name' });
    }

    // Update database
    await database.run(
      'UPDATE carriers SET name = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), callsign]
    );

    res.json({ 
      message: 'Carrier name updated successfully',
      name: name.trim()
    });

  } catch (error) {
    console.error('Error updating carrier name:', error);
    res.status(500).json({ error: 'Failed to update carrier name' });
  }
});

// Get automation system status
router.get('/automation/status', async (req, res) => {
  try {
    const status = await carrierService.getAutomationStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting automation status:', error);
    res.status(500).json({ error: 'Failed to get automation status' });
  }
});

// Get current carrier information from game UI (via OCR)
router.get('/:callsign/game-info', async (req, res) => {
  try {
    const { callsign } = req.params;

    // Check if carrier exists
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ?',
      [callsign]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    const gameInfo = await carrierService.getCarrierInfoFromGame();
    
    if (!gameInfo) {
      return res.status(503).json({ 
        error: 'Unable to read carrier information from game',
        reason: 'Elite Dangerous may not be running or automation not available'
      });
    }

    res.json({
      carrierId: callsign,
      gameData: gameInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting carrier info from game:', error);
    res.status(500).json({ error: 'Failed to get carrier info from game' });
  }
});

// Detect current Elite Dangerous UI state
router.get('/automation/game-state', async (req, res) => {
  try {
    const state = await carrierService.detectGameState();
    res.json({
      state: state.state,
      confidence: state.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error detecting game state:', error);
    res.status(500).json({ error: 'Failed to detect game state' });
  }
});

// Enable/disable automation
router.post('/automation/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean value' });
    }

    carrierService.setAutomationEnabled(enabled);

    res.json({
      message: `Automation ${enabled ? 'enabled' : 'disabled'}`,
      enabled
    });

  } catch (error) {
    console.error('Error toggling automation:', error);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
});

module.exports = router;
