// This is a wrapper that selects the appropriate storage backend
// In production, it uses Vercel KV
// In development, it uses local file-based storage

import { kv } from '@vercel/kv';
import localStorage from './local-storage';
import { TasksData } from '@/app/data/tanks';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Storage interface matching KV
export interface Storage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<any>;
  del: (key: string) => Promise<any>;
}

// Use Vercel KV in production, local storage in development
const storage: Storage = isProduction ? kv : localStorage;

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