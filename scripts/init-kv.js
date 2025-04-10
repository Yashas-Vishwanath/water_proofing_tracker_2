// Script to initialize Vercel KV with default data
const { kv } = require('@vercel/kv');
const { n00Tanks, n10Tanks, n20Tanks } = require('../app/data/tanks');

async function initializeKV() {
  try {
    console.log('Initializing Vercel KV with default data...');
    
    // Check if data already exists
    const existingData = await kv.get('tanksData');
    if (existingData) {
      console.log('Data already exists in KV, skipping initialization');
      process.exit(0);
      return;
    }
    
    // Create default data structure
    const defaultData = {
      n00Tanks,
      n10Tanks,
      n20Tanks
    };
    
    // Save to KV
    await kv.set('tanksData', defaultData);
    console.log('Successfully initialized Vercel KV with default data');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing Vercel KV:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeKV(); 