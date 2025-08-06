const database = require('./src/database/db');

(async () => {
  try {
    await database.init();
    console.log('Database initialized');
    
    // Get all CarrierCrewServices events
    const crewEvents = await database.all(
      "SELECT event_data FROM journal_entries WHERE event_type = 'CarrierCrewServices' ORDER BY timestamp"
    );
    
    console.log(`Found ${crewEvents.length} CarrierCrewServices events`);
    
    for (const event of crewEvents) {
      const entry = JSON.parse(event.event_data);
      const { CarrierID, CrewRole, Operation, CrewName } = entry;
      
      if (CarrierID && CrewRole && Operation) {
        const enabled = Operation === 'Activate';
        
        // Update or insert carrier service
        await database.run(
          'INSERT OR REPLACE INTO carrier_services (carrier_id, service_type, enabled) VALUES (?, ?, ?)',
          [CarrierID, CrewRole, enabled ? 1 : 0]
        );

        console.log(`Processed: ${CarrierID} - ${Operation} ${CrewRole} by ${CrewName}`);
      }
    }
    
    console.log('Finished processing crew services events');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
