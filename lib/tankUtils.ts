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
  // Helper function to check if a tank has completed all required stages except Ladder Installation
  const hasCompletedAllRequiredStages = (stages: ProgressStage[], progress: StageProgress[]) => {
    // Get all applicable stages except Ladder Installation
    const requiredStages = stages.filter(stage => stage !== "Ladder Installation");
    
    // Check if all required stages are completed
    return requiredStages.every(stage => {
      const stageProgress = progress.find(p => p.stage === stage);
      return stageProgress?.status === "Completed";
    });
  };
  
  // For grouped tanks with sub-tanks
  if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
    // 1. Check if ALL sub-tanks have completed all required stages except Ladder Installation
    const allSubTanksCompleted = tank.subTanks.every(subTank => {
      // Get the applicable stages for this sub-tank
      const applicableStages = getApplicableStages({
        ...subTank,
        isSubTank: true,
        parentId: tank.id
      });
      
      // Check if all required stages are completed
      return hasCompletedAllRequiredStages(applicableStages, subTank.progress);
    });
    
    if (allSubTanksCompleted) {
      return "bg-green-600"; // Green for all completed
    }
    
    // 2. Check if ANY sub-tank has an IN PROGRESS inspection stage
    const anySubTankInInspection = tank.subTanks.some(subTank => {
      // Specifically look for "In Progress" inspection stages in the progress array
      const inspectionStage1 = subTank.progress.find(p => p.stage === "Inspection Stage 1");
      const inspectionStage2 = subTank.progress.find(p => p.stage === "Inspection Stage 2");
      const inspectionStage3 = subTank.progress.find(p => p.stage === "Inspection Stage 3");
      
      return (inspectionStage1 && inspectionStage1.status === "In Progress") ||
             (inspectionStage2 && inspectionStage2.status === "In Progress") ||
             (inspectionStage3 && inspectionStage3.status === "In Progress");
    });
    
    if (anySubTankInInspection) {
      return "bg-purple-600"; // Purple if any sub-tank has an inspection stage in progress
    }
    
    // 3. Default to red for grouped tanks with incomplete sub-tanks
    return "bg-red-600"; // Red for any incomplete sub-tanks
  } 
  // For regular tanks (non-grouped)
  else {
    // 1. Check if this tank has completed all required stages except Ladder Installation
    const applicableStages = getApplicableStages(tank);
    
    if (hasCompletedAllRequiredStages(applicableStages, tank.progress)) {
      return "bg-green-600"; // Green for completed tanks
    }
    
    // 2. Check if any inspection stage is specifically "In Progress"
    const inspectionStage1 = tank.progress.find(p => p.stage === "Inspection Stage 1");
    const inspectionStage2 = tank.progress.find(p => p.stage === "Inspection Stage 2");
    const inspectionStage3 = tank.progress.find(p => p.stage === "Inspection Stage 3");
    
    const hasInProgressInspection = (inspectionStage1 && inspectionStage1.status === "In Progress") ||
                                   (inspectionStage2 && inspectionStage2.status === "In Progress") ||
                                   (inspectionStage3 && inspectionStage3.status === "In Progress");
    
    if (hasInProgressInspection) {
      return "bg-purple-600"; // Purple for inspection stages
    }
    
    // 3. Default for regular tanks with incomplete tasks
    return "bg-red-600"; // Red for ongoing operations
  }
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
  
  // Check if this is a pump pit by ID
  const isPumpPit = tankId && (
    // N00 pump pits
    tankId === "PBF-S3-01" || 
    tankId === "PBF-S3-02" || 
    tankId === "PBF-S3-03" || 
    tankId === "PBF-S3-04" || 
    tankId === "PBP-S3-GT" || 
    tankId === "S3-PBP-1G+CP" ||
    // N10 pump pits 
    tankId === "PBF-S2-01" || 
    tankId === "PBF-S2-03" || 
    tankId === "PBF-S2-11" || 
    tankId === "PBF-S2-12" || 
    tankId === "PBF-S2-13" || 
    tankId === "S2-PB-04" || 
    tankId === "S2-PB-05" || 
    tankId === "S2-PB-06" || 
    tankId === "S2-PB-07" || 
    tankId === "S2-PB-15" || 
    tankId === "PBP-S2-01" || 
    tankId === "FEC-PB-08" ||
    // N20 pump pits
    tankId === "PBF-S1-02" || 
    tankId === "PBF-S1-03" || 
    tankId === "PBF-S1-04" || 
    tankId === "PBF-S1-05" || 
    tankId === "PBF-S1-08" ||
    // Chiller room tanks (all are pump pits)
    tankId === "CHILLER-ROOM-INSIDE" || 
    tankId === "CHILLER-ROOM-OUTSIDE" ||
    tankId === "EB16-STE-088" ||
    tankId === "EB16-STE-089-CR" ||
    // Tank types
    (tankType && (
      tankType.includes("CHILLER ROOM") ||
      tankType === "CHILLER ROOM"
    ))
  );
  
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
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Dwall anchorage removal",
      "Dwall anchorage waterproofing",
      "Grout openings in wall",
      "Inspection Stage 1",
      "Waterproofing of walls",
      "Inspection Stage 2",
      "Waterproofing of floor",
      "Inspection Stage 3"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }
  
  // Other EB16-STE-089 tanks (Tank-02, Tank-03) - no dwall stages
  if (
    (tankId && tankId.includes("EB16-STE-089")) ||
    (isSubTank && parentId && parentId.includes("EB16-STE-089"))
  ) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing of walls",
      "Inspection Stage 2",
      "Waterproofing of floor",
      "Inspection Stage 3"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }
  
  // For Sanitary Water tanks (EB1-Interior)
  if (
    (tankType && tankType.includes("Sanitary Water")) ||
    (tankId && tankId.includes("EB1") && tankId.includes("Interior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Interior"))
  ) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }

  // For Fire Water tanks (EB1-Exterior)
  if (
    (tankType && tankType.includes("Fire Water")) ||
    (tankId && tankId.includes("EB1") && tankId.includes("Exterior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Exterior"))
  ) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }

  // For Water deposit tanks (EB9)
  if (
    (tankType && tankType.includes("Water deposit")) ||
    (tankId && tankId.includes("EB9")) ||
    (isSubTank && parentId && parentId.includes("EB9"))
  ) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }

  // For Rain Water - Pump tanks
  if (tankType && tankType.includes("Rain Water") && tankType.includes("Pump")) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }
  
  // For Rain Water - Valve tanks
  if (tankType && tankType.includes("Rain Water") && tankType.includes("Valve")) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }

  // For Chiller Room tanks
  if (
    (tankType && tankType.includes("Chiller Room")) ||
    (tankId && (
      tankId === "CHILLER-ROOM-INSIDE" ||
      tankId === "CHILLER-ROOM-OUTSIDE" ||
      tankId === "EB16-STE-088" ||
      tankId === "EB16-STE-089-CR"
    ))
  ) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit - these are all considered pump pits now
    stages.push("Ladder Installation");
    
    return stages;
  }

  // For Gardenrona tanks
  if (tankType && (tankType.includes("Gardenrona") || tankType.includes("Gardenroba"))) {
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
  }

  // Standard Sewage Water tanks - with pump pits
  const stages = [
    "Formwork Removal",
    "Repair and Cleaning",
    "Pump Anchors",
    "Slope",
    "Inspection Stage 1",
    "Waterproofing",
    "Inspection Stage 2"
  ] as ProgressStage[];
  
  // Add Ladder Installation if this is a pump pit
  if (isPumpPit) {
    stages.push("Ladder Installation");
  }
  
  return stages;
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
  // Helper function to check if all required stages are completed (except Ladder Installation)
  const areRequiredStagesCompleted = (stages: ProgressStage[], progress: StageProgress[]) => {
    // Get all applicable stages except Ladder Installation
    const requiredStages = stages.filter(stage => stage !== "Ladder Installation");
    
    // Check if all required stages are completed
    return requiredStages.every(stage => {
      const stageProgress = progress.find(p => p.stage === stage);
      return stageProgress?.status === "Completed";
    });
  };

  if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
    return tank.subTanks.every(subTank => {
      const applicableStages = getApplicableStages({
        ...subTank,
        isSubTank: true,
        parentId: tank.id
      });
      
      return areRequiredStagesCompleted(applicableStages, subTank.progress);
    });
  }
  
  const applicableStages = getApplicableStages(tank);
  return areRequiredStagesCompleted(applicableStages, tank.progress);
}; 