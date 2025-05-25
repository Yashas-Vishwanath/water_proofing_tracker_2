import { useState, useEffect } from 'react';
import { WaterTank, n00Tanks, n10Tanks, n20Tanks, n30Tanks } from '@/app/data/tanks';

export interface TanksDataState {
  n00TanksData: Record<string, WaterTank>;
  n10TanksData: Record<string, WaterTank>;
  n20TanksData: Record<string, WaterTank>;
  loading: boolean;
  initializing: boolean;
}

export const useTanksData = () => {
  // State for tank data
  const [tanksData, setTanksData] = useState<TanksDataState>({
    n00TanksData: n00Tanks,
    n10TanksData: n10Tanks,
    n20TanksData: n20Tanks,
    loading: true,
    initializing: false
  });

  // Fetch tank data on mount
  useEffect(() => {
    fetchTanksData();
  }, []);

  // Function to fetch tanks data from API
  const fetchTanksData = async () => {
    try {
      setTanksData(prev => ({ ...prev, loading: true }));
      console.log("Fetching tank data...");
      const response = await fetch('/api/tasks');
      
      if (response.ok) {
        const data = await response.json();
        console.log("Tank data fetched successfully:", data);
        
        // Update state with data from API
        setTanksData(prev => ({
          ...prev,
          n00TanksData: data.n00Tanks && Object.keys(data.n00Tanks).length > 0 ? data.n00Tanks : prev.n00TanksData,
          n10TanksData: data.n10Tanks && Object.keys(data.n10Tanks).length > 0 ? data.n10Tanks : prev.n10TanksData,
          n20TanksData: data.n20Tanks && Object.keys(data.n20Tanks).length > 0 ? data.n20Tanks : prev.n20TanksData,
          loading: false
        }));
      } else {
        console.log("API returned non-OK status, initializing with default data");
        // If API fails, initialize with default data and save it to the API
        setTanksData(prev => ({ ...prev, initializing: true }));
        await saveTanksData();
        setTanksData(prev => ({ ...prev, initializing: false, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching tasks data:", error);
      // On error, initialize with default data and save it to the API
      setTanksData(prev => ({ ...prev, initializing: true }));
      await saveTanksData();
      setTanksData(prev => ({ ...prev, initializing: false, loading: false }));
    }
  };

  // Function to save all tanks data to the API
  const saveTanksData = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n00Tanks,
          n10Tanks,
          n20Tanks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tanks data');
      }

      // Set the state with the initial data
      setTanksData(prev => ({
        ...prev,
        n00TanksData: n00Tanks,
        n10TanksData: n10Tanks,
        n20TanksData: n20Tanks
      }));
    } catch (error) {
      console.error('Error saving tanks data:', error);
    }
  };

  // Function to update a specific tank
  const updateTank = async (tankId: string, level: string, updatedTank: WaterTank) => {
    // Create a clean version of the tank without temporary properties
    const cleanTank = { ...updatedTank };
    
    // Remove temporary properties that shouldn't be stored
    if ('currentSubTankIndex' in cleanTank) {
      delete (cleanTank as any).currentSubTankIndex;
    }
    
    // Update local state based on level
    let levelKey: keyof TanksDataState = 'n00TanksData';
    
    if (level === 'N10') {
      levelKey = 'n10TanksData';
    } else if (level === 'N20') {
      levelKey = 'n20TanksData';
    }
    
    // Update local state
    setTanksData(prev => ({
      ...prev,
      [levelKey]: {
        ...prev[levelKey],
        [tankId]: cleanTank
      }
    }));
    
    // Then update via API
    try {
      const apiLevel = levelKey;
      await fetch(`/api/tasks/${apiLevel}/${tankId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedTank: cleanTank })
      });
    } catch (error) {
      console.error("Error updating tank via API:", error);
    }
  };

  // Get tanks data for a specific level
  const getTanksForLevel = (level: string): Record<string, WaterTank> => {
    switch (level) {
      case 'N00':
        return tanksData.n00TanksData;
      case 'N10':
        return tanksData.n10TanksData;
      case 'N20':
        return tanksData.n20TanksData;
      default:
        return {};
    }
  };

  return {
    ...tanksData,
    fetchTanksData,
    saveTanksData,
    updateTank,
    getTanksForLevel
  };
}; 