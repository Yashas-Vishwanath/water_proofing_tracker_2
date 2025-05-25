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
  // Special case for grouped tanks with sub-tanks - must check sub-tanks
  if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
    // Consider the tank complete only if all sub-tanks are complete
    const allSubTanksCompleted = tank.subTanks.every(subTank => 
      subTank.progress.every(p => p.status === "Completed")
    );
    
    if (allSubTanksCompleted) {
      return "bg-green-600"; // Green for completed tanks
    }
  } else {
    // Check if all tasks are completed for regular tanks
    const allCompleted = tank.progress.every((p) => p.status === "Completed");
    if (allCompleted) {
      return "bg-green-600"; // Green for completed tanks
    }
  }

  // Check if in inspection stage
  const isInspection = tank.currentStage === "Inspection Stage 1" || 
                       tank.currentStage === "Inspection Stage 2" || 
                       tank.currentStage === "Inspection Stage 3";
  if (isInspection) {
    return "bg-purple-600"; // Purple for inspection stages
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
  const tankType = tank.type;
  
  // Special case for EB16-STE-089 tanks that need dwall anchoring stages
  if (
    (tankId && tankId.includes("EB16-STE-089")) ||
    (isSubTank && parentId && parentId.includes("EB16-STE-089"))
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
      "Inspection Stage 3"
    ] as ProgressStage[];
  }
  
  // For EB1-Exterior tanks (Fire Water tanks), only specific stages are applicable
  if (
    (tankId && tankId.includes("EB1") && tankId.includes("Exterior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Exterior"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }

  // For EB1-Interior tanks (Sanitary Water), exclude certain stages
  if (
    (tankId && tankId.includes("EB1") && tankId.includes("Interior")) ||
    (isSubTank && parentId && parentId.includes("EB1") && parentId.includes("Interior"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }

  // For EB9 tanks (Water deposit tanks), exclude certain stages
  if (
    (tankId && tankId.includes("EB9")) ||
    (isSubTank && parentId && parentId.includes("EB9"))
  ) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }

  // For Rain Water - Valve tanks, no pump anchors or slope
  if (tankType && tankType.includes("Rain Water") && tankType.includes("Valve")) {
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2",
      "Inspection Stage 3"
    ] as ProgressStage[];
  }

  // Standard tank stages (Sewage Water, Rain Water Pump, etc.)
  return [
    "Formwork Removal",
    "Repair and Cleaning",
    "Pump Anchors",
    "Slope",
    "Inspection Stage 1",
    "Waterproofing",
    "Inspection Stage 2",
    "Inspection Stage 3"
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