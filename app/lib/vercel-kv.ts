// Import the Upstash Redis client instead of Vercel KV
import { Redis } from '@upstash/redis';
import { TasksData } from '../data/tanks';

// For local development without Redis, we'll use a fallback
// to local file system
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Path for local fallback when Redis is not available
const localDataFilePath = path.join(process.cwd(), 'data', 'tasks.json');

// Initialize Redis client for production environment
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

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

// Check if we have Redis available or need to use local fallback
function isRedisAvailable() {
  // Check for Upstash Redis environment variables
  return process.env.NODE_ENV === 'production' || 
         (process.env.UPSTASH_REDIS_REST_URL !== undefined && 
          process.env.UPSTASH_REDIS_REST_TOKEN !== undefined);
}

// Get all tanks data
export async function getTanksData(): Promise<TasksData> {
  try {
    if (isRedisAvailable()) {
      console.log('Using Upstash Redis for data storage');
      // Use Upstash Redis in production
      const data = await redis.get('tanksData');
      if (data) {
        return data as TasksData;
      } else {
        // If no data exists yet in Redis, return empty structure
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
    if (isRedisAvailable()) {
      // Use Upstash Redis in production
      await redis.set('tanksData', data);
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