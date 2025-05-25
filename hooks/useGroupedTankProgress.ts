import { useState } from 'react';
import { WaterTank, ProgressStage } from '@/app/data/tanks';
import { getApplicableStages } from '@/lib/tankUtils';

// Extended WaterTank interface for internal use
interface ExtendedWaterTank extends WaterTank {
  currentSubTankIndex?: number;
}

/**
 * Custom hook to manage progress for grouped tanks with sub-tanks
 */
export const useGroupedTankProgress = (initialTank: WaterTank | null) => {
  const [tank, setTank] = useState<ExtendedWaterTank | null>(initialTank);
  
  /**
   * Set the active sub-tank index
   */
  const setActiveSubTank = (index: number) => {
    if (!tank || !tank.isGrouped || !tank.subTanks || index >= tank.subTanks.length) {
      return;
    }
    
    setTank(prev => prev ? { ...prev, currentSubTankIndex: index } : null);
  };
  
  /**
   * Get the current active sub-tank
   */
  const getActiveSubTank = () => {
    if (!tank || !tank.isGrouped || !tank.subTanks || tank.currentSubTankIndex === undefined) {
      return null;
    }
    
    return tank.subTanks[tank.currentSubTankIndex];
  };
  
  /**
   * Check if a stage is completed for the current sub-tank
   */
  const isStageCompleted = (stage: ProgressStage): boolean => {
    if (!tank) return false;
    
    if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
      const subTank = tank.subTanks[tank.currentSubTankIndex];
      if (!subTank) return false;
      
      const stageProgress = subTank.progress.find(p => p.stage === stage);
      return stageProgress?.status === "Completed";
    }
    
    // For regular tanks
    const stageProgress = tank.progress.find(p => p.stage === stage);
    return stageProgress?.status === "Completed";
  };
  
  /**
   * Check if a stage is in progress for the current sub-tank
   */
  const isStageInProgress = (stage: ProgressStage): boolean => {
    if (!tank) return false;
    
    if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
      const subTank = tank.subTanks[tank.currentSubTankIndex];
      if (!subTank) return false;
      
      const stageProgress = subTank.progress.find(p => p.stage === stage);
      return stageProgress?.status === "In Progress";
    }
    
    // For regular tanks
    const stageProgress = tank.progress.find(p => p.stage === stage);
    return stageProgress?.status === "In Progress";
  };
  
  /**
   * Mark a stage as completed and update the next stage to "In Progress"
   */
  const markStageCompleted = (stage: ProgressStage): ExtendedWaterTank | null => {
    if (!tank) return null;
    
    // Clone the tank to avoid direct state modification
    const updatedTank = { ...tank };
    
    // If dealing with a sub-tank
    if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
      const subTank = tank.subTanks[tank.currentSubTankIndex];
      if (!subTank) return tank;
      
      // Clone the sub-tank and its progress array
      const updatedSubTank = { ...subTank };
      const updatedProgress = [...updatedSubTank.progress];
      
      // Find the stage in the progress array
      const stageIndex = updatedProgress.findIndex(p => p.stage === stage);
      
      if (stageIndex !== -1) {
        // Update status to completed
        updatedProgress[stageIndex] = { ...updatedProgress[stageIndex], status: "Completed" };
        
        // Determine the next stage
        const applicableStages = getApplicableStages({
          ...subTank,
          isSubTank: true,
          parentId: tank.id
        });
        
        const currentStageIndex = applicableStages.indexOf(stage);
        const nextStageIndex = currentStageIndex + 1;
        
        // If there's a next stage, set it to "In Progress"
        if (nextStageIndex < applicableStages.length) {
          const nextStage = applicableStages[nextStageIndex];
          
          // Find or add next stage in progress array
          const nextStageProgressIndex = updatedProgress.findIndex(p => p.stage === nextStage);
          
          if (nextStageProgressIndex !== -1) {
            // Update existing stage
            updatedProgress[nextStageProgressIndex] = { 
              ...updatedProgress[nextStageProgressIndex], 
              status: "In Progress" 
            };
          } else {
            // Add new stage
            updatedProgress.push({ stage: nextStage, status: "In Progress" });
            
            // Sort progress to maintain correct order
            updatedProgress.sort((a, b) => {
              const aIndex = applicableStages.indexOf(a.stage);
              const bIndex = applicableStages.indexOf(b.stage);
              return aIndex - bIndex;
            });
          }
          
          // Update sub-tank with new progress and current stage
          const updatedSubTanks = [...tank.subTanks];
          updatedSubTanks[tank.currentSubTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: nextStage
          };
          
          // Update the parent tank with updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[tank.currentSubTankIndex].currentStage;
        } else {
          // This was the last stage, just mark it as completed
          const updatedSubTanks = [...tank.subTanks];
          updatedSubTanks[tank.currentSubTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: stage // Keep the current stage as the last stage
          };
          
          updatedTank.subTanks = updatedSubTanks;
          updatedTank.currentStage = updatedSubTanks[tank.currentSubTankIndex].currentStage;
        }
      }
    } else {
      // Regular non-grouped tank logic
      const stageIndex = updatedTank.progress.findIndex(p => p.stage === stage);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array and update status
        const updatedProgress = [...updatedTank.progress];
        updatedProgress[stageIndex] = { ...updatedProgress[stageIndex], status: "Completed" };
        
        // Determine the next stage
        const applicableStages = getApplicableStages(updatedTank);
        const currentStageIndex = applicableStages.indexOf(stage);
        const nextStageIndex = currentStageIndex + 1;
        
        if (nextStageIndex < applicableStages.length) {
          const nextStage = applicableStages[nextStageIndex];
          
          // Find or add next stage in progress array
          const nextStageProgressIndex = updatedProgress.findIndex(p => p.stage === nextStage);
          
          if (nextStageProgressIndex !== -1) {
            // Update existing stage
            updatedProgress[nextStageProgressIndex] = { 
              ...updatedProgress[nextStageProgressIndex], 
              status: "In Progress" 
            };
          } else {
            // Add new stage
            updatedProgress.push({ stage: nextStage, status: "In Progress" });
            
            // Sort progress to maintain correct order
            updatedProgress.sort((a, b) => {
              const aIndex = applicableStages.indexOf(a.stage);
              const bIndex = applicableStages.indexOf(b.stage);
              return aIndex - bIndex;
            });
          }
          
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = nextStage;
        } else {
          // This was the last stage, just mark it as completed
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = stage;
        }
      }
    }
    
    // Update local state
    setTank(updatedTank);
    
    return updatedTank;
  };
  
  /**
   * Undo a completed stage
   */
  const undoStageCompletion = (stage: ProgressStage): ExtendedWaterTank | null => {
    if (!tank) return null;
    
    // Clone the tank to avoid direct state modification
    const updatedTank = { ...tank };
    
    // If dealing with a sub-tank
    if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
      const subTank = tank.subTanks[tank.currentSubTankIndex];
      if (!subTank) return tank;
      
      // Clone the sub-tank and its progress array
      const updatedSubTank = { ...subTank };
      
      // Get applicable stages for this sub-tank
      const applicableStages = getApplicableStages({
        ...subTank,
        isSubTank: true,
        parentId: tank.id
      });
      
      const stageIndex = applicableStages.indexOf(stage);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array
        let updatedProgress = [...updatedSubTank.progress];
        
        // Find the stage in progress array
        const stageProgressIndex = updatedProgress.findIndex(p => p.stage === stage);
        
        if (stageProgressIndex !== -1) {
          // Mark this stage as Not Started
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "Not Started" 
          };
          
          // Mark all subsequent stages as Not Started too
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set previous stage as In Progress, if there is one
          if (stageIndex > 0) {
            const prevStage = applicableStages[stageIndex - 1];
            const prevStageIndex = updatedProgress.findIndex(p => p.stage === prevStage);
            
            if (prevStageIndex !== -1) {
              updatedProgress[prevStageIndex] = { 
                ...updatedProgress[prevStageIndex], 
                status: "In Progress" 
              };
              
              // Update the currentStage to previous stage
              const updatedSubTanks = [...tank.subTanks];
              updatedSubTanks[tank.currentSubTankIndex] = {
                ...updatedSubTank,
                progress: updatedProgress,
                currentStage: prevStage
              };
              
              updatedTank.subTanks = updatedSubTanks;
              updatedTank.currentStage = prevStage;
            }
          } else {
            // This is the first stage, mark it as In Progress
            updatedProgress[stageProgressIndex] = {
              ...updatedProgress[stageProgressIndex],
              status: "In Progress"
            };
            
            const updatedSubTanks = [...tank.subTanks];
            updatedSubTanks[tank.currentSubTankIndex] = {
              ...updatedSubTank,
              progress: updatedProgress,
              currentStage: stage
            };
            
            updatedTank.subTanks = updatedSubTanks;
            updatedTank.currentStage = stage;
          }
        }
      }
    } else {
      // Regular non-grouped tank logic
      const applicableStages = getApplicableStages(updatedTank);
      const stageIndex = applicableStages.indexOf(stage);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array
        let updatedProgress = [...updatedTank.progress];
        
        // Find the stage in progress array
        const stageProgressIndex = updatedProgress.findIndex(p => p.stage === stage);
        
        if (stageProgressIndex !== -1) {
          // Mark this stage as Not Started
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "Not Started" 
          };
          
          // Mark all subsequent stages as Not Started too
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set previous stage as In Progress, if there is one
          if (stageIndex > 0) {
            const prevStage = applicableStages[stageIndex - 1];
            const prevStageIndex = updatedProgress.findIndex(p => p.stage === prevStage);
            
            if (prevStageIndex !== -1) {
              updatedProgress[prevStageIndex] = { 
                ...updatedProgress[prevStageIndex], 
                status: "In Progress" 
              };
              
              // Update the tank's progress and currentStage
              updatedTank.progress = updatedProgress;
              updatedTank.currentStage = prevStage;
            }
          } else {
            // This is the first stage, mark it as In Progress
            updatedProgress[stageProgressIndex] = {
              ...updatedProgress[stageProgressIndex],
              status: "In Progress"
            };
            
            updatedTank.progress = updatedProgress;
            updatedTank.currentStage = stage;
          }
        }
      }
    }
    
    // Update local state
    setTank(updatedTank);
    
    return updatedTank;
  };
  
  /**
   * Get all stages applicable to the current tank or sub-tank
   */
  const getApplicableTankStages = (): ProgressStage[] => {
    if (!tank) return [];
    
    if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
      const subTank = tank.subTanks[tank.currentSubTankIndex];
      if (!subTank) return [];
      
      return getApplicableStages({
        ...subTank,
        isSubTank: true,
        parentId: tank.id
      });
    }
    
    return getApplicableStages(tank);
  };
  
  /**
   * Set a new tank - used when changing the selected tank
   */
  const setActiveTank = (newTank: WaterTank | null) => {
    if (newTank && newTank.isGrouped && newTank.subTanks && newTank.subTanks.length > 0) {
      // For grouped tanks, initialize with the first sub-tank selected
      setTank({
        ...newTank,
        currentSubTankIndex: 0
      });
    } else {
      setTank(newTank);
    }
  };
  
  return {
    tank,
    setActiveTank,
    setActiveSubTank,
    getActiveSubTank,
    isStageCompleted,
    isStageInProgress,
    markStageCompleted,
    undoStageCompletion,
    getApplicableTankStages
  };
}; 