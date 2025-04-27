// This script initializes the Upstash Redis database with default data in production
// It's meant to be run as part of the build process on Vercel

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('This script is only meant to run in production environment');
  process.exit(0);
}

// Import Upstash Redis
const { Redis } = require('@upstash/redis');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Log Redis connection details (without exposing sensitive info)
console.log('Initializing Redis client for tank data');
console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Set ✓' : 'Missing ✗');
console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Set ✓' : 'Missing ✗');

// Sample tank data structure for the UI (matches what is shown in the UI)
const sampleTanksData = {
  // N00 Level Tanks
  n00Tanks: {
    "PBF-S3-03": {
      "id": "PBF-S3-03",
      "name": "SEWAGE WATER | PBF-S3-03",
      "location": "West Section",
      "currentStage": "Waterproofing",
      "progress": [
        {
          "stage": "Formwork Removal",
          "status": "Completed"
        },
        {
          "stage": "Repair and Cleaning",
          "status": "Completed"
        },
        {
          "stage": "Pump Anchors",
          "status": "Completed"
        },
        {
          "stage": "Slope",
          "status": "Completed"
        },
        {
          "stage": "Inspection Stage 1",
          "status": "Completed"
        },
        {
          "stage": "Waterproofing",
          "status": "In Progress"
        },
        {
          "stage": "Inspection Stage 2",
          "status": "Not Started"
        }
      ],
      "coordinates": {
        "top": 495,
        "left": 100,
        "width": 20,
        "height": 20
      },
      "type": "SEWAGE WATER"
    }
  },
  
  // N10 Level Tanks
  n10Tanks: {
    "CAMRI-WQ": {
      id: "CAMRI-WQ",
      name: "CAMRI-WQ",
      location: "Second floor",
      type: "water",
      coordinates: { x: 750, y: 360 },
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'Inspect water supply' },
          { id: 'task2', completed: false, description: 'Check pressure valve' },
          { id: 'task3', completed: false, description: 'Verify flow meter' }
        ]
      }
    },
    "RTP-12": {
      id: "RTP-12",
      name: "RTP-12",
      location: "East wing",
      type: "chemical",
      coordinates: { x: 480, y: 480 },
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'Check pH level' },
          { id: 'task2', completed: false, description: 'Inspect chemical mixture' },
          { id: 'task3', completed: false, description: 'Verify safety protocols' }
        ]
      }
    },
    "FEC-PB-08": {
      id: "FEC-PB-08",
      name: "FEC-PB-08",
      location: "North wing",
      type: "water",
      coordinates: { x: 600, y: 280 },
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'Check water level' },
          { id: 'task2', completed: false, description: 'Inspect filtration system' },
          { id: 'task3', completed: false, description: 'Test valve operation' }
        ]
      }
    },
    "EB16-STE-089": {
      id: "EB16-STE-089",
      name: "EB16-STE-089",
      location: "South wing",
      type: "chemical",
      coordinates: { x: 320, y: 420 },
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'Check chemical levels' },
          { id: 'task2', completed: false, description: 'Inspect mixing mechanism' },
          { id: 'task3', completed: false, description: 'Test safety valve' }
        ]
      }
    },
    "EB1-INTERIOR": {
      id: "EB1-INTERIOR",
      name: "EB1 Interior Tanks",
      location: "EB1 Building",
      type: "water",
      coordinates: { x: 390, y: 340 },
      isGrouped: true,
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'General inspection' },
          { id: 'task2', completed: false, description: 'System check' },
          { id: 'task3', completed: false, description: 'Documentation' }
        ]
      },
      subTanks: [
        {
          id: "INTERIOR-1",
          name: "Interior Tank 1",
          currentStage: "initial",
          progress: {
            tasks: [
              { id: 'task1', completed: false, description: 'Check water quality' },
              { id: 'task2', completed: false, description: 'Inspect interior walls' },
              { id: 'task3', completed: false, description: 'Test pressure system' }
            ]
          }
        },
        {
          id: "INTERIOR-2",
          name: "Interior Tank 2",
          currentStage: "initial",
          progress: {
            tasks: [
              { id: 'task1', completed: false, description: 'Check water level' },
              { id: 'task2', completed: false, description: 'Inspect valves' },
              { id: 'task3', completed: false, description: 'Test circulation system' }
            ]
          }
        }
      ]
    },
    "EB9": {
      id: "EB9",
      name: "EB9 Tanks",
      location: "EB9 Building",
      type: "chemical",
      coordinates: { x: 270, y: 380 },
      isGrouped: true,
      currentStage: "initial",
      progress: {
        tasks: [
          { id: 'task1', completed: false, description: 'General inspection' },
          { id: 'task2', completed: false, description: 'System check' },
          { id: 'task3', completed: false, description: 'Documentation' }
        ]
      },
      subTanks: [
        {
          id: "INTERIOR",
          name: "Interior Chemical Tank",
          currentStage: "initial",
          progress: {
            tasks: [
              { id: 'task1', completed: false, description: 'Check chemical levels' },
              { id: 'task2', completed: false, description: 'Inspect mixing system' },
              { id: 'task3', completed: false, description: 'Test safety valves' }
            ]
          }
        },
        {
          id: "EXTERIOR",
          name: "Exterior Chemical Tank",
          currentStage: "initial",
          progress: {
            tasks: [
              { id: 'task1', completed: false, description: 'Check external integrity' },
              { id: 'task2', completed: false, description: 'Inspect connections' },
              { id: 'task3', completed: false, description: 'Test emergency systems' }
            ]
          }
        }
      ]
    }
  },
  
  // N20 Level Tanks
  n20Tanks: {
    "PBF-S1-01": {
      "id": "PBF-S1-01",
      "name": "RAIN WATER | PBF-S1-01",
      "location": "Center",
      "currentStage": "Inspection Stage 1",
      "progress": [
        {
          "stage": "Formwork Removal",
          "status": "Completed"
        },
        {
          "stage": "Repair and Cleaning",
          "status": "Completed"
        },
        {
          "stage": "Pump Anchors",
          "status": "Completed"
        },
        {
          "stage": "Slope",
          "status": "Completed"
        },
        {
          "stage": "Inspection Stage 1",
          "status": "In Progress"
        },
        {
          "stage": "Waterproofing",
          "status": "Not Started"
        },
        {
          "stage": "Inspection Stage 2",
          "status": "Not Started"
        }
      ],
      "coordinates": {
        "top": 500,
        "left": 500,
        "width": 20,
        "height": 20
      },
      "type": "RAIN WATER"
    }
  }
};

// Helper function to check if data exists in Redis
async function checkDataExists() {
  try {
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      console.log('Data already exists in Redis:', keys);
      // Check if we have the expected data structure
      const n10TanksData = await redis.get('tanksData:n10Tanks');
      if (n10TanksData) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking data:', error);
    return false;
  }
}

// Initialize Redis with the sample data
async function initProductionRedis() {
  try {
    const dataExists = await checkDataExists();
    
    if (dataExists) {
      console.log('Tank data already exists in Redis, skipping initialization.');
      return;
    }
    
    console.log('Initializing Redis with sample tank data...');
    
    // Set the main tanksData structure
    await redis.set('tanksData', sampleTanksData);
    
    // Also set individual level data for easier access
    await redis.set('tanksData:n00Tanks', sampleTanksData.n00Tanks);
    await redis.set('tanksData:n10Tanks', sampleTanksData.n10Tanks);
    await redis.set('tanksData:n20Tanks', sampleTanksData.n20Tanks);
    
    // Initialize individual tank states in Redis hashes
    // This will make it easier to update individual tanks later
    for (const [level, tanks] of Object.entries(sampleTanksData)) {
      const levelKey = level.replace('Tanks', ''); // Convert n00Tanks to n00
      
      for (const [tankId, tank] of Object.entries(tanks)) {
        // Store the main tank data
        await redis.hmset(`state:tank:${levelKey}:${tankId}`, {
          progress: JSON.stringify(tank.progress),
          currentStage: tank.currentStage
        });
        
        // If this is a grouped tank with sub-tanks, store each sub-tank separately
        if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
          for (const subTank of tank.subTanks) {
            await redis.hmset(`state:subtank:${levelKey}:${tankId}:${subTank.id}`, {
              progress: JSON.stringify(subTank.progress),
              currentStage: subTank.currentStage
            });
          }
        }
      }
    }
    
    // Verify data was saved correctly
    const verifyData = await redis.get('tanksData:n10Tanks');
    console.log('Verification - N10 Tanks data saved:', !!verifyData);
    
    console.log('Redis initialization complete!');
  } catch (error) {
    console.error('Error initializing Redis:', error);
  }
}

// Run the initialization
initProductionRedis().then(() => {
  console.log('Initialization process completed.');
  // Note: In serverless environments, we need to explicitly exit
  process.exit(0);
}).catch(error => {
  console.error('Initialization process failed:', error);
  process.exit(1);
}); 