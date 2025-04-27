// This script initializes the Redis database with static tank metadata
// This will not overwrite any user progress/state data
require('dotenv').config();

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('This script is intended for production, but we will simulate it for testing...');
}

// Import Redis
const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Directly define the tank metadata to avoid importing from TypeScript files
// This matches the structure in app/data/tanks.ts but only includes the static metadata
const n00Tanks = {
  "PBF-S3-03": {
    id: "PBF-S3-03",
    name: "SEWAGE WATER | PBF-S3-03",
    location: "West Section",
    type: "SEWAGE WATER",
    coordinates: {
      top: 495,
      left: 100,
      width: 20,
      height: 20,
    }
  },
  "PBF-S3-02": {
    id: "PBF-S3-02",
    name: "SEWAGE WATER | PBF-S3-02",
    location: "Center",
    type: "SEWAGE WATER",
    coordinates: {
      top: 655,
      left: 615,
      width: 20,
      height: 20,
    }
  },
  "PBF-S3-01": {
    id: "PBF-S3-01",
    name: "SEWAGE WATER | PBF-S3-01",
    location: "East Section",
    type: "SEWAGE WATER",
    coordinates: {
      top: 530,
      left: 780,
      width: 20,
      height: 20,
    }
  },
  "CHILLER-ROOM-INSIDE": {
    id: "CHILLER-ROOM-INSIDE",
    name: "SEWAGE WATER | CHILLER ROOM INSIDE",
    location: "Far East",
    type: "SEWAGE WATER",
    coordinates: {
      top: 670,
      left: 1160,
      width: 20,
      height: 20,
    }
  },
  "GARDENTONA-SMALL": {
    id: "GARDENTONA-SMALL",
    name: "RAIN WATER | GARDENTONA SMALL",
    location: "Top Center",
    type: "RAIN WATER",
    coordinates: {
      top: 500,
      left: 670,
      width: 20,
      height: 20,
    }
  },
  "GARDENTONA-BIG": {
    id: "GARDENTONA-BIG",
    name: "RAIN WATER | GARDENTONA BIG",
    location: "Center Right",
    type: "RAIN WATER",
    coordinates: {
      top: 550,
      left: 735,
      width: 20,
      height: 20,
    }
  },
  "CHILLER-ROOM-OUTSIDE": {
    id: "CHILLER-ROOM-OUTSIDE",
    name: "CHILLER ROOM OUTSIDE",
    location: "Bottom Right",
    type: "CHILLER ROOM",
    coordinates: {
      top: 780,
      left: 1150,
      width: 20,
      height: 20,
    }
  }
};

const n10Tanks = {
  "PBF-S2-01": {
    id: "PBF-S2-01",
    name: "SEWAGE WATER | PBF-S2-01",
    location: "Bottom Right",
    type: "SEWAGE WATER",
    coordinates: {
      top: 570,
      left: 860,
      width: 20,
      height: 20,
    }
  },
  "PBF-S2-11": {
    id: "PBF-S2-11",
    name: "SEWAGE WATER | PBF-S2-11",
    location: "Middle Left",
    type: "SEWAGE WATER",
    coordinates: {
      top: 220,
      left: 300,
      width: 20,
      height: 20,
    }
  },
  "PBF-S2-12": {
    id: "PBF-S2-12",
    name: "SEWAGE WATER | PBF-S2-12",
    location: "Left",
    type: "SEWAGE WATER",
    coordinates: {
      top: 300,
      left: 260,
      width: 20,
      height: 20,
    }
  },
  "PBF-S2-13": {
    id: "PBF-S2-13",
    name: "SEWAGE WATER | PBF-S2-13",
    location: "Bottom Left",
    type: "SEWAGE WATER",
    coordinates: {
      top: 420,
      left: 275,
      width: 20,
      height: 20,
    }
  },
  "S2-PB-04": {
    id: "S2-PB-04",
    name: "SEWAGE WATER | S2-PB-04",
    location: "Top Center",
    type: "SEWAGE WATER",
    coordinates: {
      top: 90,
      left: 515,
      width: 20,
      height: 20,
    }
  },
  "S2-PB-05": {
    id: "S2-PB-05",
    name: "SEWAGE WATER | S2-PB-05",
    location: "Top Left",
    type: "SEWAGE WATER",
    coordinates: {
      top: 120,
      left: 420,
      width: 20,
      height: 20,
    }
  },
  "PBF-S2-03": {
    id: "PBF-S2-03",
    name: "SEWAGE WATER | PBF-S2-03",
    location: "Top Right",
    type: "SEWAGE WATER",
    coordinates: {
      top: 90,
      left: 780,
      width: 20,
      height: 20,
    }
  },
  "S2-PB-06": {
    id: "S2-PB-06",
    name: "SEWAGE WATER | S2-PB-06",
    location: "Bottom Center",
    type: "SEWAGE WATER",
    coordinates: {
      top: 585,
      left: 470,
      width: 20,
      height: 20,
    }
  },
  "S2-PB-07": {
    id: "S2-PB-07",
    name: "SEWAGE WATER | S2-PB-07",
    location: "Bottom Center-Right",
    type: "SEWAGE WATER",
    coordinates: {
      top: 560,
      left: 780,
      width: 20,
      height: 20,
    }
  },
  "PBP-S2-01": {
    id: "PBP-S2-01",
    name: "SEWAGE WATER | PBP-S2-01",
    location: "Bottom Center",
    type: "SEWAGE WATER",
    coordinates: {
      top: 720,
      left: 650,
      width: 20,
      height: 20,
    }
  },
  "S2-PB-15": {
    id: "S2-PB-15",
    name: "SEWAGE WATER | S2-PB-15",
    location: "Bottom Center",
    type: "SEWAGE WATER",
    coordinates: {
      top: 765,
      left: 665,
      width: 20,
      height: 20,
    }
  },
  "FEC-PB-08": {
    id: "FEC-PB-08",
    name: "WATER TANKS | FEC-PB-08",
    location: "Bottom Left",
    type: "WATER TANKS",
    coordinates: {
      top: 685,
      left: 425,
      width: 20,
      height: 20,
    }
  },
  "EB16-STE-089": {
    id: "EB16-STE-089",
    name: "WATER TANKS | EB16-STE-089",
    location: "Left Center",
    type: "WATER TANKS",
    coordinates: {
      top: 455,
      left: 280,
      width: 20,
      height: 20,
    },
    isGrouped: true
  },
  "EB1-INTERIOR-1": {
    id: "EB1-INTERIOR-1",
    name: "WATER TANKS | EB1-INTERIOR",
    location: "Right Center Upper",
    type: "WATER TANKS",
    coordinates: {
      top: 370,
      left: 950,
      width: 20,
      height: 20,
    },
    isGrouped: true
  },
  "EB1-INTERIOR-2": {
    id: "EB1-INTERIOR-2",
    name: "WATER TANKS | EB1-INTERIOR",
    location: "Right Center Lower",
    type: "WATER TANKS",
    coordinates: {
      top: 405,
      left: 950,
      width: 20,
      height: 20,
    },
    isGrouped: true
  },
  "EB1-EXTERIOR": {
    id: "EB1-EXTERIOR",
    name: "WATER TANKS | EB1-EXTERIOR",
    location: "Right Upper",
    type: "WATER TANKS",
    coordinates: {
      top: 350,
      left: 1015,
      width: 20,
      height: 20,
    },
    isGrouped: true
  },
  "EB9": {
    id: "EB9",
    name: "WATER TANKS | EB9",
    location: "Bottom Right",
    type: "WATER TANKS",
    coordinates: {
      top: 715,
      left: 980,
      width: 20,
      height: 20,
    },
    isGrouped: true
  }
};

const n20Tanks = {
  "PBF-S1-05": {
    id: "PBF-S1-05",
    name: "RAIN WATER | PBF-S1-05",
    location: "Top Left",
    type: "RAIN WATER",
    coordinates: {
      top: 130,
      left: 540,
      width: 20,
      height: 20,
    }
  },
  "PBF-S1-04": {
    id: "PBF-S1-04",
    name: "RAIN WATER | PBF-S1-04",
    location: "Top Right",
    type: "RAIN WATER",
    coordinates: {
      top: 130,
      left: 710,
      width: 20,
      height: 20,
    }
  },
  "PBF-S1-03": {
    id: "PBF-S1-03",
    name: "RAIN WATER | PBF-S1-03",
    location: "Middle Left",
    type: "RAIN WATER",
    coordinates: {
      top: 420,
      left: 165,
      width: 20,
      height: 20,
    }
  },
  "PBF-S1-02": {
    id: "PBF-S1-02",
    name: "RAIN WATER | PBF-S1-02",
    location: "Bottom Left",
    type: "RAIN WATER",
    coordinates: {
      top: 575,
      left: 170,
      width: 20,
      height: 20,
    }
  },
  "PBF-S1-08": {
    id: "PBF-S1-08",
    name: "RAIN WATER | PBF-S1-08",
    location: "Bottom Right",
    type: "RAIN WATER",
    coordinates: {
      top: 605,
      left: 1080,
      width: 20,
      height: 20,
    }
  }
};

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