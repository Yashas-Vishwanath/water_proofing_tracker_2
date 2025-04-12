// This script initializes the database with default data
require('dotenv').config({ path: '.env.local' });

// Set development environment
process.env.NODE_ENV = 'development';

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const DATA_DIR = path.join(process.cwd(), '.local-data');

// Ensure the data directory exists
const ensureDataDir = async () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await mkdir(DATA_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
};

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

async function saveToLocalStorage(key, value) {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, `${key}.json`);
    const data = JSON.stringify(value, null, 2);
    await writeFile(filePath, data, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to local storage:`, error);
    return false;
  }
}

async function initData() {
  try {
    console.log('Initializing database...');
    console.log('Mode: Local Development');
    
    // Set the data
    const success = await saveToLocalStorage('tanksData', tanksData);
    
    if (success) {
      console.log('Successfully initialized database with default data.');
      console.log('Data saved to:', path.join(DATA_DIR, 'tanksData.json'));
      console.log('Tanks in database:');
      console.log('  N00:', Object.keys(tanksData.n00Tanks).length);
      console.log('  N10:', Object.keys(tanksData.n10Tanks).length);
      console.log('  N20:', Object.keys(tanksData.n20Tanks).length);
    } else {
      console.error('Failed to save data.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initData(); 