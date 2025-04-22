// This script initializes the Redis database with static tank metadata
// This will not overwrite any user progress/state data
require('dotenv').config();

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('This script is intended for production, but we will simulate it for testing...');
}

// Import Redis
const { Redis } = require('@upstash/redis');
const { n00Tanks, n10Tanks, n20Tanks } = require('../app/data/tanks');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create a mapping of level IDs to tank collections
const tanksByLevel = {
  n00Tanks,
  n10Tanks,
  n20Tanks
};

async function seedMetadata() {
  try {
    console.log('Seeding tank metadata to Redis...');
    console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set ✓' : 'Not set ✗');
    console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set ✓' : 'Not set ✗');

    // Set metadata for each tank by level
    for (const [level, tanks] of Object.entries(tanksByLevel)) {
      console.log(`Processing level: ${level}`);
      
      for (const [tankId, tank] of Object.entries(tanks)) {
        console.log(`Setting metadata for tank: ${tankId}`);
        
        // Store only static metadata, not user progress
        await redis.hset(`config:tank:${level}:${tankId}`, {
          id: tank.id,
          name: tank.name,
          location: tank.location,
          type: tank.type,
          coordinates: JSON.stringify(tank.coordinates)
        });
      }
    }
    
    console.log('Metadata seeding completed successfully.');
    
    // Verify a sample of the data
    const sampleLevel = 'n00Tanks';
    const sampleTankId = Object.keys(tanksByLevel[sampleLevel])[0];
    const verifyData = await redis.hgetall(`config:tank:${sampleLevel}:${sampleTankId}`);
    
    console.log('\nVerification sample:');
    console.log(`Tank ${sampleTankId} metadata:`, verifyData);
    
  } catch (error) {
    console.error('Error seeding metadata:', error);
    console.error(error.stack);
  }
}

// Run the seeding function
seedMetadata(); 