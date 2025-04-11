// A simple in-memory storage implementation for local development
// This will be used when Vercel KV is not available

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
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

// Initialize the store
ensureDataDir();

class LocalStorage {
  private cache: Record<string, any> = {};

  // Get a value from the store
  async get(key: string): Promise<any> {
    // Check in-memory cache first
    if (this.cache[key] !== undefined) {
      return this.cache[key];
    }

    // Try to read from file
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        const data = await readFile(filePath, 'utf-8');
        const value = JSON.parse(data);
        this.cache[key] = value; // Update cache
        return value;
      }
    } catch (error) {
      console.error(`Error reading ${key} from local storage:`, error);
    }

    return null;
  }

  // Set a value in the store
  async set(key: string, value: any): Promise<void> {
    try {
      await ensureDataDir();
      const filePath = path.join(DATA_DIR, `${key}.json`);
      const data = JSON.stringify(value, null, 2);
      await writeFile(filePath, data, 'utf-8');
      this.cache[key] = value; // Update cache
    } catch (error) {
      console.error(`Error writing ${key} to local storage:`, error);
      throw error;
    }
  }

  // Delete a value from the store
  async del(key: string): Promise<void> {
    try {
      const filePath = path.join(DATA_DIR, `${key}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      delete this.cache[key];
    } catch (error) {
      console.error(`Error deleting ${key} from local storage:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
const localStorage = new LocalStorage();

export default localStorage; 