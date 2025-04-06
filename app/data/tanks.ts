// Types for our water tank data
export type ProgressStage =
  | "Formwork Removal"
  | "Repair and Cleaning"
  | "Pump Anchors"
  | "Slope"
  | "Inspection Stage 1"
  | "Waterproofing"
  | "Inspection Stage 2"

export type ProgressStatus = "Not Started" | "In Progress" | "Completed"

export type StageProgress = {
  stage: ProgressStage
  status: ProgressStatus
}

export type TankType = "SEWAGE WATER" | "RAIN WATER" | "CHILLER ROOM"

export type WaterTank = {
  id: string
  name: string
  location: string
  currentStage: ProgressStage
  progress: StageProgress[]
  coordinates: {
    top: number
    left: number
    width: number
    height: number
  }
  type: TankType
}

// Define type for the full data structure
export type TasksData = {
  n00Tanks: Record<string, WaterTank>;
  n10Tanks: Record<string, WaterTank>;
  n20Tanks: Record<string, WaterTank>;
  [key: string]: Record<string, WaterTank>; // Add index signature
};

// Define all possible progress stages in order
export const allProgressStages: ProgressStage[] = [
  "Formwork Removal",
  "Repair and Cleaning",
  "Pump Anchors",
  "Slope",
  "Inspection Stage 1",
  "Waterproofing",
  "Inspection Stage 2",
]

// Update the tank data for N00 level with correct tank IDs and positions based on the new image
export const n00Tanks: Record<string, WaterTank> = {
  "PBF-S3-03": {
    id: "PBF-S3-03",
    name: "SEWAGE WATER | PBF-S3-03",
    location: "West Section",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 495,
      left: 100,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S3-02": {
    id: "PBF-S3-02",
    name: "SEWAGE WATER | PBF-S3-02",
    location: "Center",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 525,
      left: 500,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S3-01": {
    id: "PBF-S3-01",
    name: "SEWAGE WATER | PBF-S3-01",
    location: "East Section",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 423,
      left: 660,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "CHILLER-ROOM-INSIDE": {
    id: "CHILLER-ROOM-INSIDE",
    name: "SEWAGE WATER | CHILLER ROOM INSIDE",
    location: "Far East",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 535,
      left: 1000,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "GARDENTONA-SMALL": {
    id: "GARDENTONA-SMALL",
    name: "RAIN WATER | GARDENTONA SMALL",
    location: "Top Center",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 390,
      left: 500,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "GARDENTONA-BIG": {
    id: "GARDENTONA-BIG",
    name: "RAIN WATER | GARDENTONA BIG",
    location: "Center Right",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 450,
      left: 576,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "CHILLER-ROOM-OUTSIDE": {
    id: "CHILLER-ROOM-OUTSIDE",
    name: "CHILLER ROOM OUTSIDE",
    location: "Bottom Right",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 620,
      left: 1000,
      width: 20,
      height: 20,
    },
    type: "CHILLER ROOM",
  },
}

// Update the tank data for N10 level with correct tank IDs and positions based on the new image
export const n10Tanks: Record<string, WaterTank> = {
  "PBF-S2-01": {
    id: "PBF-S2-01",
    name: "SEWAGE WATER | PBF-S2-01",
    location: "Bottom Right",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 590,
      left: 890,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-11": {
    id: "PBF-S2-11",
    name: "SEWAGE WATER | PBF-S2-11",
    location: "Middle Left",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 240,
      left: 310,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-12": {
    id: "PBF-S2-12",
    name: "SEWAGE WATER | PBF-S2-12",
    location: "Left",
    currentStage: "Pump Anchors",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning"].includes(stage)
        ? "Completed"
        : stage === "Pump Anchors"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 320,
      left: 270,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-13": {
    id: "PBF-S2-13",
    name: "SEWAGE WATER | PBF-S2-13",
    location: "Bottom Left",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 440,
      left: 285,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-04": {
    id: "S2-PB-04",
    name: "SEWAGE WATER | S2-PB-04",
    location: "Top Center",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 85,
      left: 535,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-05": {
    id: "S2-PB-05",
    name: "SEWAGE WATER | S2-PB-05",
    location: "Top Left",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 135,
      left: 435,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-03": {
    id: "S2-PB-03",
    name: "SEWAGE WATER | S2-PB-03",
    location: "Top Right",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 130,
      left: 745,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-06": {
    id: "S2-PB-06",
    name: "SEWAGE WATER | S2-PB-06",
    location: "Bottom Center",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 585,
      left: 485,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-07": {
    id: "S2-PB-07",
    name: "SEWAGE WATER | S2-PB-07",
    location: "Bottom Center-Right",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 645,
      left: 810,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBP-S2-01": {
    id: "PBP-S2-01",
    name: "SEWAGE WATER | PBP-S2-01",
    location: "Bottom Center",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 745,
      left: 670,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-15": {
    id: "S2-PB-15",
    name: "SEWAGE WATER | S2-PB-15",
    location: "Bottom Center",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 790,
      left: 670,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
}

// Update the tank data for N20 level with correct tank IDs and positions based on the new image
export const n20Tanks: Record<string, WaterTank> = {
  "PBF-S1-05": {
    id: "PBF-S1-05",
    name: "RAIN WATER | PBF-S1-05",
    location: "Top Left",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 140,
      left: 520,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-04": {
    id: "PBF-S1-04",
    name: "RAIN WATER | PBF-S1-04",
    location: "Top Right",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 140,
      left: 740,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-03": {
    id: "PBF-S1-03",
    name: "RAIN WATER | PBF-S1-03",
    location: "Middle Left",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 440,
      left: 180,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-02": {
    id: "PBF-S1-02",
    name: "RAIN WATER | PBF-S1-02",
    location: "Bottom Left",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 600,
      left: 180,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-08": {
    id: "PBF-S1-08",
    name: "RAIN WATER | PBF-S1-08",
    location: "Bottom Right",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 640,
      left: 1120,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
} 