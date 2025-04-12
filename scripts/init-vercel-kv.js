// This script initializes the Vercel KV database with default data in production
// It's meant to be run as part of the build process on Vercel

// Only run in production environment
if (process.env.NODE_ENV !== 'production') {
  console.log('This script is only meant to run in production environment');
  process.exit(0);
}

// Import Vercel KV
const { kv } = require('@vercel/kv');

// Sample tank data to initialize with the correct structure for the UI
const tanksData = {
  "n00Tanks": {
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
  "n10Tanks": {
    "PBF-S2-01": {
      "id": "PBF-S2-01",
      "name": "SEWAGE WATER | PBF-S2-01",
      "location": "Bottom Right",
      "currentStage": "Formwork Removal",
      "progress": [
        {
          "stage": "Formwork Removal",
          "status": "In Progress"
        },
        {
          "stage": "Repair and Cleaning",
          "status": "Not Started"
        },
        {
          "stage": "Pump Anchors",
          "status": "Not Started"
        },
        {
          "stage": "Slope",
          "status": "Not Started"
        },
        {
          "stage": "Inspection Stage 1",
          "status": "Not Started"
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
        "top": 450,
        "left": 800,
        "width": 20,
        "height": 20
      },
      "type": "SEWAGE WATER"
    }
  },
  "n20Tanks": {
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
    if (verifyData) {
      console.log('Tanks in database:');
      console.log('  N00:', Object.keys(verifyData.n00Tanks || {}).length);
      console.log('  N10:', Object.keys(verifyData.n10Tanks || {}).length);
      console.log('  N20:', Object.keys(verifyData.n20Tanks || {}).length);
    }
    
  } catch (error) {
    console.error('Error initializing Vercel KV:', error);
    // Don't exit with error code to avoid failing the build
  }
}

// Run the initialization
initProductionKV(); 