// Import the Vercel KV client
import { kv } from '@vercel/kv';
import { TasksData } from '../data/tanks';

// For local development without the actual KV, we'll use a fallback
// to local file system for now
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Path for local fallback when KV is not available
const localDataFilePath = path.join(process.cwd(), 'data', 'tasks.json');

// Ensure the data directory exists for local development
async function ensureLocalDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fsPromises.access(dataDir);
  } catch (error) {
    // Directory doesn't exist, create it
    await fsPromises.mkdir(dataDir, { recursive: true });
  }
}

// Check if we have KV available or need to use local fallback
function isVercelKVAvailable() {
  // Check for Vercel KV environment variables
  return process.env.VERCEL_ENV === 'production' || 
         (process.env.KV_URL !== undefined && 
          process.env.KV_REST_API_URL !== undefined && 
          process.env.KV_REST_API_TOKEN !== undefined);
}

// Get all tanks data
export async function getTanksData(): Promise<TasksData> {
  try {
    if (isVercelKVAvailable()) {
      console.log('Using Vercel KV for data storage');
      // Use Vercel KV in production
      const data = await kv.get<TasksData>('tanksData');
      if (data) {
        return data;
      } else {
        // If no data exists yet in KV, return empty structure
        return { 
          n00Tanks: {}, 
          n10Tanks: {}, 
          n20Tanks: {} 
        };
      }
    } else {
      console.log('Using local file system for data storage');
      // Fallback to file system for local development
      await ensureLocalDataDirectoryExists();
      
      try {
        const data = await fsPromises.readFile(localDataFilePath, 'utf8');
        return JSON.parse(data) as TasksData;
      } catch (error) {
        // If file doesn't exist or is invalid, return default data structure
        console.log('Initializing with empty data structure');
        return { 
          n00Tanks: {}, 
          n10Tanks: {}, 
          n20Tanks: {} 
        };
      }
    }
  } catch (error) {
    console.error('Error reading tanks data:', error);
    throw error;
  }
}

// Save all tanks data
export async function saveTanksData(data: TasksData): Promise<boolean> {
  try {
    if (isVercelKVAvailable()) {
      // Use Vercel KV in production
      await kv.set('tanksData', data);
      return true;
    } else {
      // Fallback to file system for local development
      await ensureLocalDataDirectoryExists();
      await fsPromises.writeFile(localDataFilePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    }
  } catch (error) {
    console.error('Error saving tanks data:', error);
    return false;
  }
}

// Get a specific tank
export async function getTank(level: string, tankId: string) {
  const tasksData = await getTanksData();
  if (!tasksData[level]) return null;
  return tasksData[level][tankId] || null;
}

// Update a specific tank
export async function updateTank(level: string, tankId: string, tankData: any): Promise<boolean> {
  try {
    const tasksData = await getTanksData();
    if (!tasksData[level]) return false;
    
    tasksData[level][tankId] = tankData;
    return await saveTanksData(tasksData);
  } catch (error) {
    console.error('Error updating tank:', error);
    return false;
  }
} 