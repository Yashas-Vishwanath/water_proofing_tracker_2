// This is a wrapper that selects the appropriate storage backend
// In production, it uses Upstash Redis
// In development, it uses local file-based storage

import { Redis } from '@upstash/redis';
import localStorage from './local-storage';
import { TasksData, WaterTank, StageProgress, allProgressStages } from '@/app/data/tanks';
import { n00Tanks, n10Tanks, n20Tanks } from '@/app/data/tanks';

// Default progress for new tanks
const INITIAL_PROGRESS: StageProgress[] = allProgressStages.map(stage => ({
  stage,
  status: "Not Started"
}));

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
  hget: (key: string, field: string) => Promise<any>;
  hgetall: (key: string) => Promise<any>;
  hset: (key: string, field: string, value: any) => Promise<any>;
  hmset: (key: string, values: Record<string, any>) => Promise<any>;
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
  },

  async hget(key: string, field: string) {
    if (isProduction && redis) {
      return await redis.hget(key, field);
    } else {
      const data = await localStorage.get(key) || {};
      return data[field] || null;
    }
  },

  async hgetall(key: string) {
    if (isProduction && redis) {
      return await redis.hgetall(key) || {};
    } else {
      return await localStorage.get(key) || {};
    }
  },

  async hset(key: string, field: string, value: any) {
    if (isProduction && redis) {
      return await redis.hset(key, { [field]: value });
    } else {
      const data = await localStorage.get(key) || {};
      data[field] = value;
      return await localStorage.set(key, data);
    }
  },

  async hmset(key: string, values: Record<string, any>) {
    if (isProduction && redis) {
      return await redis.hset(key, values);
    } else {
      const data = await localStorage.get(key) || {};
      Object.assign(data, values);
      return await localStorage.set(key, data);
    }
  }
};

// Static tank data by level
const staticTanksByLevel: Record<string, Record<string, WaterTank>> = {
  n00Tanks,
  n10Tanks,
  n20Tanks
};

// Helper functions for tanks data
export async function getTanksData(): Promise<TasksData> {
  try {
    // Create an object to hold the combined data
    const combinedData: TasksData = {
      n00Tanks: {},
      n10Tanks: {},
      n20Tanks: {}
    };

    // Process each level
    for (const level of Object.keys(combinedData)) {
      // Get the static tanks for this level
      const staticTanks = staticTanksByLevel[level] || {};

      // For each static tank, merge with its dynamic state
      for (const [tankId, staticTank] of Object.entries(staticTanks)) {
        // Get the dynamic state for this tank
        let tankState: Record<string, any> = {};
        
        if (isProduction) {
          // In production, get from Redis
          tankState = await storage.hgetall(`state:tank:${level}:${tankId}`);
        } else {
          // In development, get from local storage
          const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
          tankState = allTanksData[level]?.[tankId] || {};
        }

        // Merge static data with dynamic state
        combinedData[level][tankId] = {
          ...staticTank,
          // Use progress from state if available, otherwise use default progress or static progress
          progress: tankState.progress ? 
            (typeof tankState.progress === 'string' ? 
              JSON.parse(tankState.progress) : tankState.progress) : 
            staticTank.progress || INITIAL_PROGRESS,
          // Use currentStage from state if available, otherwise use static value
          currentStage: tankState.currentStage || staticTank.currentStage
        };
      }
    }

    return combinedData;
  } catch (error) {
    console.error('Error getting tanks data:', error);
    return { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
  }
}

export async function setTanksData(data: TasksData) {
  try {
    if (isProduction) {
      // In production, we don't save all data at once
      // The API should call updateTank for each tank instead
      console.warn('setTanksData is not fully supported in production. Use updateTank instead.');
      return false;
    } else {
      // In development, save everything to local storage
      await storage.set('tanksData', data);
      return true;
    }
  } catch (error) {
    console.error('Error setting tanks data:', error);
    return false;
  }
}

// Helper function to get a specific tank
export async function getTank(level: string, tankId: string): Promise<WaterTank | null> {
  try {
    // Get the static tank data
    const staticTank = staticTanksByLevel[level]?.[tankId];
    
    if (!staticTank) {
      return null;
    }

    // Get the dynamic state
    let tankState: Record<string, any> = {};
    
    if (isProduction) {
      // In production, get from Redis
      tankState = await storage.hgetall(`state:tank:${level}:${tankId}`);
      
      // If this is a grouped tank, fetch state for each sub-tank
      if (staticTank.isGrouped && staticTank.subTanks) {
        const updatedSubTanks = await Promise.all(
          staticTank.subTanks.map(async (subTank) => {
            const subTankState = await storage.hgetall(`state:subtank:${level}:${tankId}:${subTank.id}`);
            
            // Merge static sub-tank data with dynamic state
            return {
              ...subTank,
              progress: subTankState.progress ? 
                (typeof subTankState.progress === 'string' ? 
                  JSON.parse(subTankState.progress) : subTankState.progress) : 
                subTank.progress,
              currentStage: subTankState.currentStage || subTank.currentStage
            };
          })
        );
        
        // Merge static tank with dynamic data including updated sub-tanks
        return {
          ...staticTank,
          progress: tankState.progress ? 
            (typeof tankState.progress === 'string' ? 
              JSON.parse(tankState.progress) : tankState.progress) : 
            staticTank.progress || INITIAL_PROGRESS,
          currentStage: tankState.currentStage || staticTank.currentStage,
          subTanks: updatedSubTanks
        };
      }
    } else {
      // In development, get from local storage
      const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
      tankState = allTanksData[level]?.[tankId] || {};
    }

    // Merge static data with dynamic state
    return {
      ...staticTank,
      progress: tankState.progress ? 
        (typeof tankState.progress === 'string' ? 
          JSON.parse(tankState.progress) : tankState.progress) : 
        staticTank.progress || INITIAL_PROGRESS,
      currentStage: tankState.currentStage || staticTank.currentStage,
      subTanks: tankState.subTanks || staticTank.subTanks
    };
  } catch (error) {
    console.error(`Error getting tank ${level}/${tankId}:`, error);
    return null;
  }
}

// Helper function to update a specific tank
export async function updateTank(level: string, tankId: string, updatedTank: WaterTank) {
  try {
    // Get the static tank data
    const staticTank = staticTanksByLevel[level]?.[tankId];
    
    if (!staticTank) {
      return false;
    }

    // Only save the dynamic state parts
    if (isProduction) {
      // In production, save to Redis hash
      await storage.hmset(`state:tank:${level}:${tankId}`, {
        progress: JSON.stringify(updatedTank.progress),
        currentStage: updatedTank.currentStage
      });
      
      // If this is a grouped tank with sub-tanks, save each sub-tank's state
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        await Promise.all(
          updatedTank.subTanks.map(async (subTank) => {
            return storage.hmset(`state:subtank:${level}:${tankId}:${subTank.id}`, {
              progress: JSON.stringify(subTank.progress),
              currentStage: subTank.currentStage
            });
          })
        );
      }
    } else {
      // In development, update within local storage
      const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
      
      if (!allTanksData[level]) {
        allTanksData[level] = {};
      }
      
      allTanksData[level][tankId] = {
        ...staticTank,
        progress: updatedTank.progress,
        currentStage: updatedTank.currentStage,
        subTanks: updatedTank.subTanks
      };
      
      await storage.set('tanksData', allTanksData);
    }

    return true;
  } catch (error) {
    console.error(`Error updating tank ${level}/${tankId}:`, error);
    return false;
  }
}

export default storage; 