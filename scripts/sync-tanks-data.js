// This script synchronizes the tank data from app/data/tanks.ts to local storage
const fs = require('fs');
const path = require('path');

// Path to the data directory
const DATA_DIR = path.join(process.cwd(), '.local-data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Import the tanks data from the TypeScript file
// We'll need to require the compiled JavaScript from .next/server
try {
  // First, require the compiled JavaScript
  const tanksModule = await import('../app/data/tanks');
  console.log('Loaded tanks module');
  
  // Extract the static tank data
  const { n00Tanks, n10Tanks, n20Tanks, n30Tanks } = tanksModule;
  console.log('Extracted static tank data');
  
  // Create the data structure for storage
  const tanksData = {
    n00Tanks,
    n10Tanks,
    n20Tanks,
    n30Tanks
  };
  
  // Save the data to the local storage file
  const tanksDataPath = path.join(DATA_DIR, 'tanksData.json');
  fs.writeFileSync(tanksDataPath, JSON.stringify(tanksData, null, 2), 'utf8');
  
  console.log(`Successfully synchronized tank data to ${tanksDataPath}`);
} catch (error) {
  console.error('Error synchronizing tank data:', error);
  process.exit(1);
} 