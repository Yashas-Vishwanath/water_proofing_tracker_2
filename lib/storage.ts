// This is a wrapper that selects the appropriate storage backend
// In production, it uses Upstash Redis
// In development, it uses local file-based storage

import { Redis } from '@upstash/redis';
import localStorage from './local-storage';
import { TasksData } from '@/app/data/tanks';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Redis client for production environment
const redis = isProduction 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    })
  : null;

// Storage interface matching our needs
export interface Storage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<any>;
  del: (key: string) => Promise<any>;
}

// Create wrapper for Redis or local storage
const storage: Storage = {
  async get(key: string) {
    if (isProduction && redis) {
      const data = await redis.get(key);
      return data || null;
    } else {
      return await localStorage.get(key);
    }
  },
  
  async set(key: string, value: any) {
    if (isProduction && redis) {
      return await redis.set(key, value);
    } else {
      return await localStorage.set(key, value);
    }
  },
  
  async del(key: string) {
    if (isProduction && redis) {
      return await redis.del(key);
    } else {
      return await localStorage.del(key);
    }
  }
};

// Helper functions for tanks data
export async function getTanksData(): Promise<TasksData> {
  try {
    const data = await storage.get('tanksData') as TasksData | null;
    return data || { 
      n00Tanks: {}, 
      n10Tanks: {}, 
      n20Tanks: {} 
    };
  } catch (error) {
    console.error('Error getting tanks data:', error);
    return { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
  }
}

export async function setTanksData(data: TasksData) {
  try {
    await storage.set('tanksData', data);
    return true;
  } catch (error) {
    console.error('Error setting tanks data:', error);
    return false;
  }
}

// Helper function to get a specific tank
export async function getTank(level: string, tankId: string) {
  try {
    const data = await getTanksData();
    return data[level]?.[tankId] || null;
  } catch (error) {
    console.error(`Error getting tank ${level}/${tankId}:`, error);
    return null;
  }
}

// Helper function to update a specific tank
export async function updateTank(level: string, tankId: string, updatedTank: any) {
  try {
    const data = await getTanksData();
    
    if (!data[level]) {
      data[level] = {};
    }
    
    // Update the tank
    data[level][tankId] = updatedTank;
    
    // Save the updated data
    return await setTanksData(data);
  } catch (error) {
    console.error(`Error updating tank ${level}/${tankId}:`, error);
    return false;
  }
}

export default storage; 