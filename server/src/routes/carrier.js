const express = require('express');
const Joi = require('joi');
const database = require('../database/db');
const auth = require('../middleware/auth');
const carrierService = require('../services/carrierService');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Get all carriers for authenticated user
router.get('/', async (req, res) => {
  try {
    const carriers = await database.all(
      `SELECT c.*, cf.balance, cf.upkeep_cost, cf.next_upkeep 
       FROM carriers c 
       LEFT JOIN carrier_finance cf ON c.id = cf.carrier_id 
       WHERE c.owner_id = ?`,
      [req.user.userId]
    );

    res.json(carriers);
  } catch (error) {
    console.error('Error fetching carriers:', error);
    res.status(500).json({ error: 'Failed to fetch carriers' });
  }
});

// Get specific carrier details
router.get('/:carrierId', async (req, res) => {
  try {
    const { carrierId } = req.params;

    const carrier = await database.get(
      `SELECT c.*, cf.balance, cf.upkeep_cost, cf.next_upkeep 
       FROM carriers c 
       LEFT JOIN carrier_finance cf ON c.id = cf.carrier_id 
       WHERE c.id = ? AND c.owner_id = ?`,
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Get carrier services
    const services = await database.all(
      'SELECT service_type, enabled FROM carrier_services WHERE carrier_id = ?',
      [carrierId]
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
router.put('/:carrierId/docking', async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { dockingAccess, notoriousAccess } = req.body;

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ? AND owner_id = ?',
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Validate docking access values
    const validAccess = ['all', 'friends', 'squadron', 'squadronfriends'];
    if (!validAccess.includes(dockingAccess)) {
      return res.status(400).json({ error: 'Invalid docking access setting' });
    }

    // Execute the command (this would interface with Elite Dangerous)
    const success = await carrierService.updateDockingPermissions(
      carrierId, 
      dockingAccess, 
      notoriousAccess
    );

    if (!success) {
      return res.status(500).json({ error: 'Failed to update docking permissions' });
    }

    // Update database
    await database.run(
      'UPDATE carriers SET docking_access = ?, notorious_access = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [dockingAccess, notoriousAccess ? 1 : 0, carrierId]
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
router.post('/:carrierId/jump', async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { targetSystem } = req.body;

    if (!targetSystem) {
      return res.status(400).json({ error: 'Target system is required' });
    }

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id, current_system, fuel_level FROM carriers WHERE id = ? AND owner_id = ?',
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Check if carrier has enough fuel (simplified check)
    if (carrier.fuel_level < 50) {
      return res.status(400).json({ error: 'Insufficient fuel for jump' });
    }

    // Execute the jump command
    const success = await carrierService.jumpToSystem(carrierId, targetSystem);

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
router.put('/:carrierId/services', async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { services } = req.body;

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ? AND owner_id = ?',
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Update services
    for (const service of services) {
      const success = await carrierService.updateService(
        carrierId, 
        service.type, 
        service.enabled
      );

      if (success) {
        // Update database
        await database.run(
          `INSERT OR REPLACE INTO carrier_services (carrier_id, service_type, enabled) 
           VALUES (?, ?, ?)`,
          [carrierId, service.type, service.enabled ? 1 : 0]
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
router.get('/:carrierId/market', async (req, res) => {
  try {
    const { carrierId } = req.params;

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ? AND owner_id = ?',
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Get market data (this would be populated by journal monitoring)
    const marketData = await carrierService.getMarketData(carrierId);

    res.json(marketData);

  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Update carrier name
router.put('/:carrierId/name', async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Validate carrier ownership
    const carrier = await database.get(
      'SELECT id FROM carriers WHERE id = ? AND owner_id = ?',
      [carrierId, req.user.userId]
    );

    if (!carrier) {
      return res.status(404).json({ error: 'Carrier not found' });
    }

    // Execute the name change command
    const success = await carrierService.updateCarrierName(carrierId, name.trim());

    if (!success) {
      return res.status(500).json({ error: 'Failed to update carrier name' });
    }

    // Update database
    await database.run(
      'UPDATE carriers SET name = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?',
      [name.trim(), carrierId]
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

module.exports = router;
