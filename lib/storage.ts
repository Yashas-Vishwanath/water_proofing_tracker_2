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
    console.log('[DEBUG] Starting getTanksData');
    
    // Create an object to hold the combined data
    const combinedData: TasksData = {
      n00Tanks: {},
      n10Tanks: {},
      n20Tanks: {}
    };

    // Process each level
    for (const level of Object.keys(combinedData)) {
      console.log(`[DEBUG] Processing level ${level}`);
      
      // Get the static tanks for this level
      const staticTanks = staticTanksByLevel[level] || {};
      console.log(`[DEBUG] Found ${Object.keys(staticTanks).length} static tanks for ${level}`);

      // For each static tank, merge with its dynamic state
      for (const [tankId, staticTank] of Object.entries(staticTanks)) {
        // Get the dynamic state for this tank
        let tankState: Record<string, any> = {};
        
        if (isProduction) {
          // In production, get from Redis
          console.log(`[DEBUG] Production mode - fetching ${level}/${tankId} from Redis`);
          tankState = await storage.hgetall(`state:tank:${level}:${tankId}`);
        } else {
          // In development, get from local storage
          console.log(`[DEBUG] Development mode - fetching ${level}/${tankId} from local storage`);
          const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
          tankState = allTanksData[level]?.[tankId] || {};
          
          console.log(`[DEBUG] Found tank state for ${level}/${tankId}: ${Object.keys(tankState).length > 0 ? 'yes' : 'no'}`);
          if (tankState.isGrouped) {
            console.log(`[DEBUG] This is a grouped tank with ${tankState.subTanks?.length || 0} sub-tanks`);
            if (tankState.subTanks && tankState.subTanks.length > 0) {
              console.log(`[DEBUG] First sub-tank progress array:`, 
                tankState.subTanks[0]?.progress ? JSON.stringify(tankState.subTanks[0].progress) : 'no progress data');
            }
          }
        }

        // Merge static data with dynamic state
        const mergedTank = {
          ...staticTank,
          // Use progress from state if available, otherwise use default progress or static progress
          progress: tankState.progress ? 
            (typeof tankState.progress === 'string' ? 
              JSON.parse(tankState.progress) : tankState.progress) : 
            staticTank.progress || INITIAL_PROGRESS,
          // Use currentStage from state if available, otherwise use static value
          currentStage: tankState.currentStage || staticTank.currentStage
        };
        
        // For grouped tanks, handle the sub-tanks specially
        if (staticTank.isGrouped && staticTank.subTanks) {
          console.log(`[DEBUG] Merging a grouped tank: ${tankId}`);
          
          // If we have saved sub-tanks data, use it
          if (tankState.subTanks) {
            console.log(`[DEBUG] Found ${tankState.subTanks.length} saved sub-tanks`);
            
            // Create merged sub-tanks by combining static and dynamic data
            mergedTank.subTanks = staticTank.subTanks.map((staticSubTank, index) => {
              // Find the corresponding saved sub-tank by ID
              const savedSubTank = tankState.subTanks.find((st: any) => st.id === staticSubTank.id);
              
              if (savedSubTank) {
                console.log(`[DEBUG] Found saved data for sub-tank ${staticSubTank.id}`);
                // Merge static and saved data
                return {
                  ...staticSubTank,
                  progress: savedSubTank.progress || staticSubTank.progress || INITIAL_PROGRESS,
                  currentStage: savedSubTank.currentStage || staticSubTank.currentStage
                };
              } else {
                console.log(`[DEBUG] No saved data for sub-tank ${staticSubTank.id}`);
                // Use static data only
                return staticSubTank;
              }
            });
          } else {
            console.log(`[DEBUG] No saved sub-tanks data, using static sub-tanks`);
            mergedTank.subTanks = staticTank.subTanks;
          }
          
          console.log(`[DEBUG] Final merged tank has ${mergedTank.subTanks.length} sub-tanks`);
          if (mergedTank.subTanks.length > 0) {
            console.log(`[DEBUG] First sub-tank progress:`, 
              mergedTank.subTanks[0].progress ? JSON.stringify(mergedTank.subTanks[0].progress) : 'no progress data');
          }
        }
        
        combinedData[level][tankId] = mergedTank;
      }
    }

    console.log('[DEBUG] getTanksData completed');
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
    console.log(`[DEBUG] getTank called for ${level}/${tankId}`);
    
    // Get the static tank data
    const staticTank = staticTanksByLevel[level]?.[tankId];
    
    if (!staticTank) {
      console.log(`[DEBUG] Static tank not found for ${level}/${tankId}`);
      return null;
    }

    // Get the dynamic state
    let tankState: Record<string, any> = {};
    
    if (isProduction) {
      // In production, get from Redis
      console.log(`[DEBUG] Production mode - fetching from Redis`);
      tankState = await storage.hgetall(`state:tank:${level}:${tankId}`);
      
      // If this is a grouped tank, fetch state for each sub-tank
      if (staticTank.isGrouped && staticTank.subTanks) {
        console.log(`[DEBUG] Fetching ${staticTank.subTanks.length} sub-tanks from Redis`);
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
      console.log(`[DEBUG] Development mode - fetching from local storage`);
      const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
      tankState = allTanksData[level]?.[tankId] || {};
      
      console.log(`[DEBUG] Found tank state: ${Object.keys(tankState).length > 0 ? 'yes' : 'no'}`);
      
      // For grouped tanks, we need special handling in local development mode
      if (staticTank.isGrouped && staticTank.subTanks) {
        console.log(`[DEBUG] Processing grouped tank with ${staticTank.subTanks.length} sub-tanks`);
        
        // Create a merged tank object
        const mergedTank = {
          ...staticTank,
          progress: tankState.progress ? 
            (typeof tankState.progress === 'string' ? 
              JSON.parse(tankState.progress) : tankState.progress) : 
            staticTank.progress || INITIAL_PROGRESS,
          currentStage: tankState.currentStage || staticTank.currentStage
        };
        
        // If we have saved sub-tanks data, use it
        if (tankState.subTanks) {
          console.log(`[DEBUG] Found ${tankState.subTanks.length} saved sub-tanks`);
          
          // Create merged sub-tanks by combining static and dynamic data
          mergedTank.subTanks = staticTank.subTanks.map((staticSubTank) => {
            // Find the corresponding saved sub-tank by ID
            const savedSubTank = tankState.subTanks.find((st: any) => st.id === staticSubTank.id);
            
            if (savedSubTank) {
              console.log(`[DEBUG] Found saved data for sub-tank ${staticSubTank.id}`);
              // Merge static and saved data
              return {
                ...staticSubTank,
                progress: savedSubTank.progress || staticSubTank.progress || INITIAL_PROGRESS,
                currentStage: savedSubTank.currentStage || staticSubTank.currentStage
              };
            } else {
              console.log(`[DEBUG] No saved data for sub-tank ${staticSubTank.id}`);
              // Use static data only
              return staticSubTank;
            }
          });
        } else {
          console.log(`[DEBUG] No saved sub-tanks data, using static sub-tanks`);
          mergedTank.subTanks = staticTank.subTanks;
        }
        
        console.log(`[DEBUG] Returning merged tank with ${mergedTank.subTanks.length} sub-tanks`);
        return mergedTank;
      }
    }

    // For non-grouped tanks or production mode
    console.log(`[DEBUG] Returning standard merged tank`);
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
    console.log(`[DEBUG] Starting updateTank for ${level}/${tankId}`);
    console.log(`[DEBUG] Is grouped tank: ${updatedTank.isGrouped}`);
    console.log(`[DEBUG] Has subTanks: ${updatedTank.subTanks ? 'yes, count: ' + updatedTank.subTanks.length : 'no'}`);
    
    // Get the static tank data
    const staticTank = staticTanksByLevel[level]?.[tankId];
    
    if (!staticTank) {
      console.log(`[DEBUG] Static tank not found for ${level}/${tankId}`);
      return false;
    }

    // Only save the dynamic state parts
    if (isProduction) {
      // In production, save to Redis hash
      console.log(`[DEBUG] Production mode - saving to Redis`);
      await storage.hmset(`state:tank:${level}:${tankId}`, {
        progress: JSON.stringify(updatedTank.progress),
        currentStage: updatedTank.currentStage
      });
      
      // If this is a grouped tank with sub-tanks, save each sub-tank's state
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        console.log(`[DEBUG] Saving ${updatedTank.subTanks.length} sub-tanks to Redis`);
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
      console.log(`[DEBUG] Development mode - saving to local storage`);
      const allTanksData = await storage.get('tanksData') || { n00Tanks: {}, n10Tanks: {}, n20Tanks: {} };
      
      if (!allTanksData[level]) {
        console.log(`[DEBUG] Creating level ${level} in tanksData`);
        allTanksData[level] = {};
      }
      
      // Create a deep clone of the updated tank to ensure proper saving
      const tankToSave = {
        ...staticTank,
        progress: JSON.parse(JSON.stringify(updatedTank.progress)),
        currentStage: updatedTank.currentStage
      };
      
      console.log(`[DEBUG] Tank progress before save:`, JSON.stringify(updatedTank.progress));
      
      // For grouped tanks, we need to properly save the sub-tanks
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        console.log(`[DEBUG] Processing ${updatedTank.subTanks.length} sub-tanks for local storage`);
        
        // Create a deep copy of the sub-tanks array with each sub-tank's progress and currentStage
        tankToSave.subTanks = updatedTank.subTanks.map(subTank => {
          console.log(`[DEBUG] Sub-tank ${subTank.id} progress:`, JSON.stringify(subTank.progress));
          return {
            ...subTank,
            // Ensure these fields are deeply copied
            progress: JSON.parse(JSON.stringify(subTank.progress))
          };
        });
        
        console.log(`[DEBUG] Saved ${tankToSave.subTanks.length} sub-tanks`);
      }
      
      // Update the tank data in our local storage structure
      allTanksData[level][tankId] = tankToSave;
      
      console.log(`[DEBUG] Final tank data to save:`, JSON.stringify({
        id: tankToSave.id,
        isGrouped: tankToSave.isGrouped,
        hasSubTanks: tankToSave.subTanks ? true : false,
        subTanksCount: tankToSave.subTanks ? tankToSave.subTanks.length : 0,
        currentStage: tankToSave.currentStage
      }));
      
      // Save the entire updated tank data
      await storage.set('tanksData', allTanksData);
      console.log(`[DEBUG] Saved to local storage successfully`);
      
      // Verify the data was saved
      const verifyData = await storage.get('tanksData');
      const savedTank = verifyData?.[level]?.[tankId];
      console.log(`[DEBUG] Verification - tank exists in storage: ${savedTank ? 'yes' : 'no'}`);
      if (savedTank) {
        console.log(`[DEBUG] Verification - tank is grouped: ${savedTank.isGrouped}`);
        console.log(`[DEBUG] Verification - tank has subTanks: ${savedTank.subTanks ? 'yes, count: ' + savedTank.subTanks.length : 'no'}`);
        if (savedTank.subTanks) {
          console.log(`[DEBUG] Verification - first subtank progress:`, 
            savedTank.subTanks[0] ? JSON.stringify(savedTank.subTanks[0].progress) : 'no subtank available');
        }
      }
    }

    console.log(`[DEBUG] updateTank completed for ${level}/${tankId}`);
    return true;
  } catch (error) {
    console.error(`Error updating tank ${level}/${tankId}:`, error);
    return false;
  }
}

export default storage; 