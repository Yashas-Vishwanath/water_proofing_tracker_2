// This script initializes the Vercel KV database with default data in production
// It's meant to be run as part of the build process on Vercel

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('This script is only meant to run in production environment');
  process.exit(0);
}

// Import Vercel KV
const { kv } = require('@vercel/kv');

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

async function initProductionKV() {
  try {
    console.log('Checking Vercel KV in production...');
    
    // Check if data already exists
    const existingData = await kv.get('tanksData');
    
    if (existingData) {
      console.log('Data already exists in Vercel KV, skipping initialization');
      return;
    }
    
    console.log('Initializing Vercel KV with default data...');
    await kv.set('tanksData', tanksData);
    console.log('Successfully initialized Vercel KV');
    
    // Verify data was stored
    const verifyData = await kv.get('tanksData');
    console.log('Verification:', verifyData ? 'Data stored successfully' : 'Failed to store data');
    
  } catch (error) {
    console.error('Error initializing Vercel KV:', error);
    // Don't exit with error code to avoid failing the build
  }
}

// Run the initialization
initProductionKV(); 