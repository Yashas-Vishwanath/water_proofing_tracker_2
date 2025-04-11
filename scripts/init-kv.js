// This script initializes the database with default data
require('dotenv').config({ path: '.env.local' });

// Set development environment
process.env.NODE_ENV = 'development';

// Import our storage wrapper
const { getTanksData, setTanksData } = require('../lib/storage');

// Sample tank data to initialize
const tanksData = {
  "tanks": [
    {
      "id": "1",
      "name": "Tank 1",
      "type": "Underground Tank",
      "location": "Sector A",
      "progress": [
        {
          "stage": "Stage 1",
          "status": "Completed"
        },
        {
          "stage": "Stage 2",
          "status": "In Progress"
        }
      ]
    },
    {
      "id": "2",
      "name": "Tank 2",
      "type": "Overhead Tank",
      "location": "Sector B",
      "progress": [
        {
          "stage": "Stage 1",
          "status": "Completed"
        }
      ]
    }
  ],
  "lastUpdated": new Date().toISOString()
};

async function initData() {
  try {
    console.log('Initializing database...');
    console.log('Mode: Local Development');
    
    // Set the data
    await setTanksData(tanksData);
    console.log('Successfully initialized database with default data.');
    
    // Verify data was stored
    const verifyData = await getTanksData();
    console.log('Verification:', verifyData.tanks ? 'Data stored successfully ✓' : 'Failed to store data ✗');
    console.log('Tanks in database:', verifyData.tanks ? verifyData.tanks.length : 0);
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initData(); 