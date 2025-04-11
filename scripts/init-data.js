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
      console.log('Tanks in database:', tanksData.tanks.length);
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