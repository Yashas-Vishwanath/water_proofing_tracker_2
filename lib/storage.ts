// This is a wrapper that selects the appropriate storage backend
// In production, it uses Vercel KV
// In development, it uses local file-based storage

import { kv } from '@vercel/kv';
import localStorage from './local-storage';

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
export async function getTanksData() {
  try {
    const data = await storage.get('tanksData');
    return data || { tanks: [], lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Error getting tanks data:', error);
    return { tanks: [], lastUpdated: new Date().toISOString() };
  }
}

export async function setTanksData(data: any) {
  try {
    await storage.set('tanksData', data);
    return true;
  } catch (error) {
    console.error('Error setting tanks data:', error);
    return false;
  }
}

export default storage; 