import { 
  ProgressStage,
  ProgressStatus,
  StageProgress,
  WaterTank
} from "../app/data/tanks";

/**
 * Determines the color of a tank based on its progress status
 */
export const getTankColor = (tank: WaterTank) => {
  // Special case for grouped tanks with sub-tanks
  if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
    // Use the currentSubTankIndex if provided, otherwise check all sub-tanks
    const currentSubTankIndex = (tank as any).currentSubTankIndex;
    
    if (currentSubTankIndex !== undefined) {
      // If a specific sub-tank is active, use its status
      const subTank = tank.subTanks[currentSubTankIndex];
      if (subTank) {
        // Check if all tasks are completed for this sub-tank
        const allCompleted = subTank.progress.every(p => p.status === "Completed");
        if (allCompleted) {
          return "bg-green-600"; // Green for completed sub-tank
        }
        
        // Check if in inspection stage
        const isInspection = subTank.currentStage === "Inspection Stage 1" || 
                             subTank.currentStage === "Inspection Stage 2" || 
                             subTank.currentStage === "Inspection Stage 3";
        if (isInspection) {
          return "bg-purple-600"; // Purple for inspection stages
        }
        
        // Default is red for ongoing operations
        return "bg-red-600";
      }
    } else {
      // Consider the tank complete only if all sub-tanks are complete
      const allSubTanksCompleted = tank.subTanks.every(subTank => 
        subTank.progress.every(p => p.status === "Completed")
      );
      
      if (allSubTanksCompleted) {
        return "bg-green-600"; // Green for completed tanks
      }
      
      // Check if any sub-tank is in inspection stage
      const anyInInspection = tank.subTanks.some(subTank => 
        subTank.currentStage === "Inspection Stage 1" || 
        subTank.currentStage === "Inspection Stage 2" || 
        subTank.currentStage === "Inspection Stage 3"
      );
      
      if (anyInInspection) {
        return "bg-purple-600"; // Purple if any sub-tank is in inspection
      }
      
      // Default to red for grouped tanks with incomplete sub-tanks
      return "bg-red-600";
    }
  } else {
    // Check if all tasks are completed for regular tanks
    const allCompleted = tank.progress.every((p) => p.status === "Completed");
    if (allCompleted) {
      return "bg-green-600"; // Green for completed tanks
    }
    
    // Check if in inspection stage
    const isInspection = tank.currentStage === "Inspection Stage 1" || 
                        tank.currentStage === "Inspection Stage 2" || 
                        tank.currentStage === "Inspection Stage 3";
    if (isInspection) {
      return "bg-purple-600"; // Purple for inspection stages
    }
  }

  // Default is red for ongoing operations
  return "bg-red-600";
};

/**
 * Gets applicable stages for a tank based on its type and ID
 */
export const getApplicableStages = (tank: any): ProgressStage[] => {
  const isSubTank = tank.isSubTank;
  const parentId = tank.parentId;
  const tankId = tank.id;
  const tankName = tank.name;
  const tankType = tank.type;
  
  // Special case for EB16-STE-089 Tank-01 (the large tank with dwall stages)
  // We need to detect if this is the first sub-tank (index 0) of EB16-STE-089
  if (
    // Check for exact tank IDs
    (tankId && (
      tankId.includes("EB16-STE-089-TANK-01") || 
      tankId.includes("LARGE TANK-01")
    )) ||
    // Check by name 
    (tankName && (
      tankName.includes("LARGE TANK-01") || 
      tankName === "01" || 
      tankName === "TANK-01"
    )) ||
    // Check if this is a sub-tank of EB16-STE-089 with index 0
    (isSubTank && parentId && parentId.includes("EB16-STE-089") && 
     ((tankId && (tankId.includes("TANK-01") || tankId.includes("01"))) || 
      (tank.index === 0)))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Dwall anchorage removal",
      "Dwall anchorage waterproofing",
      "Grout openings in wall",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Waterproofing of floor",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }
  
  // Other EB16-STE-089 tanks (Tank-02, Tank-03) - no dwall stages
  if (
    (tankId && tankId.includes("EB16-STE-089")) ||
    (isSubTank && parentId && parentId.includes("EB16-STE-089"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Waterproofing of floor",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }
  
  // For Sanitary Water tanks (EB1-Interior)
  if (
    (tankType && tankType.includes("Sanitary Water")) ||
    (tankId && tankId.includes("EB1") && tankId.includes("Interior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Interior"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // For Fire Water tanks (EB1-Exterior)
  if (
    (tankType && tankType.includes("Fire Water")) ||
    (tankId && tankId.includes("EB1") && tankId.includes("Exterior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Exterior"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // For Water deposit tanks (EB9)
  if (
    (tankType && tankType.includes("Water deposit")) ||
    (tankId && tankId.includes("EB9")) ||
    (isSubTank && parentId && parentId.includes("EB9"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // For Rain Water - Pump tanks
  if (tankType && tankType.includes("Rain Water") && tankType.includes("Pump")) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }
  
  // For Rain Water - Valve tanks
  if (tankType && tankType.includes("Rain Water") && tankType.includes("Valve")) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // For Chiller Room tanks
  if (tankType && tankType.includes("Chiller Room")) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // For Gardenrona tanks
  if (tankType && (tankType.includes("Gardenrona") || tankType.includes("Gardenroba"))) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  }

  // Standard Sewage Water tanks - with pump pits
  return [
    "Formwork Removal",
    "Repair and Cleaning",
    "Pump Anchors",
    "Slope",
    "Inspection Stage 1",
    "Waterproofing",
    "Inspection Stage 2"
  ] as ProgressStage[];
};

/**
 * Gets the status of a specific stage for a tank
 */
export const getTankStageStatus = (tank: any, stageName: string) => {
  // Handle both regular tanks and sub-tanks
  if (tank.isGrouped && tank.subTanks && tank.currentSubTankIndex !== undefined) {
    const subTank = tank.subTanks[tank.currentSubTankIndex];
    if (!subTank) return { status: "Not Started", applicable: false };
    
    const stageProgress = subTank.progress.find((p: { stage: ProgressStage }) => p.stage === stageName);
    const applicableStages = getApplicableStages({
      ...subTank,
      isSubTank: true,
      parentId: tank.id
    });
    
    return {
      status: stageProgress?.status || "Not Started",
      applicable: applicableStages.includes(stageName as ProgressStage)
    };
  }
  
  // Regular tank logic
  const stageProgress = tank.progress.find((p: { stage: ProgressStage }) => p.stage === stageName);
  const applicableStages = getApplicableStages(tank);
  
  return {
    status: stageProgress?.status || "Not Started",
    applicable: applicableStages.includes(stageName as ProgressStage)
  };
};

/**
 * Checks if a tank is fully completed
 */
export const isFullyCompleted = (tank: WaterTank) => {
  if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
    return tank.subTanks.every(subTank => {
      const applicableStages = getApplicableStages({
        ...subTank,
        isSubTank: true,
        parentId: tank.id
      });
      return applicableStages.every(stage => {
        const stageProgress = subTank.progress.find(p => p.stage === stage);
        return stageProgress?.status === "Completed";
      });
    });
  }
  
  const applicableStages = getApplicableStages(tank);
  return applicableStages.every(stage => {
    const stageProgress = tank.progress.find(p => p.stage === stage);
    return stageProgress?.status === "Completed";
  });
}; 