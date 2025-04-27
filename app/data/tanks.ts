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

export type TankType = "SEWAGE WATER" | "RAIN WATER" | "CHILLER ROOM" | "WATER TANKS"

// Sub-tank type for nested tanks
export type SubTank = {
  id: string
  name: string
  currentStage: ProgressStage
  progress: StageProgress[]
}

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
  isGrouped?: boolean
  subTanks?: SubTank[]
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
      top: 655,
      left: 615,
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
      top: 530,
      left: 780,
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
      top: 670,
      left: 1160,
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
      top: 500,
      left: 670,
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
      top: 550,
      left: 735,
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
      top: 780,
      left: 1150,
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
      top: 570,
      left: 860,
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
      top: 220,
      left: 300,
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
      top: 300,
      left: 260,
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
      top: 420,
      left: 275,
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
      top: 90,
      left: 515,
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
      top: 120,
      left: 420,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-03": {
    id: "PBF-S2-03",
    name: "SEWAGE WATER | PBF-S2-03",
    location: "Top Right",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 90,
      left: 780,
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
      left: 470,
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
      top: 560,
      left: 780,
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
      top: 720,
      left: 650,
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
      top: 765,
      left: 665,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "FEC-PB-08": {
    id: "FEC-PB-08",
    name: "WATER TANKS | FEC-PB-08",
    location: "Bottom Left",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 685,
      left: 425,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
  },
  "EB16-STE-089": {
    id: "EB16-STE-089",
    name: "WATER TANKS | EB16-STE-089",
    location: "Left Center",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: "Not Started",
    })),
    coordinates: {
      top: 455,
      left: 280,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
    isGrouped: true,
    subTanks: [
      {
        id: "EB16-STE-089-TANK-01",
        name: "LARGE TANK-01",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "EB16-STE-089-TANK-02",
        name: "SMALL TANK-02",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "EB16-STE-089-TANK-03",
        name: "SMALL TANK-03",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      }
    ]
  },
  "EB1-INTERIOR-1": {
    id: "EB1-INTERIOR-1",
    name: "WATER TANKS | EB1-INTERIOR",
    location: "Right Center Upper",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: "Not Started",
    })),
    coordinates: {
      top: 370,
      left: 950,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
    isGrouped: true,
    subTanks: [
      {
        id: "STE-157-D",
        name: "STE-157 | D",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "STE-154-E",
        name: "STE-154 | E",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "STE-153-F",
        name: "STE-153 | F",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      }
    ]
  },
  "EB1-INTERIOR-2": {
    id: "EB1-INTERIOR-2",
    name: "WATER TANKS | EB1-INTERIOR",
    location: "Right Center Lower",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: "Not Started",
    })),
    coordinates: {
      top: 405,
      left: 950,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
    isGrouped: true,
    subTanks: [
      {
        id: "STE-156-A",
        name: "STE-156 | A",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "STE-155-B",
        name: "STE-155 | B",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "STE-158-C",
        name: "STE-158 | C",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      }
    ]
  },
  "EB1-EXTERIOR": {
    id: "EB1-EXTERIOR",
    name: "WATER TANKS | EB1-EXTERIOR",
    location: "Right Upper",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: "Not Started",
    })),
    coordinates: {
      top: 350,
      left: 1015,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
    isGrouped: true,
    subTanks: [
      {
        id: "STE-104-INTERIOR",
        name: "STE-104 | INTERIOR",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "STE-105-EXTERIOR",
        name: "STE-105 | EXTERIOR",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      }
    ]
  },
  "EB9": {
    id: "EB9",
    name: "WATER TANKS | EB9",
    location: "Bottom Right",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: "Not Started",
    })),
    coordinates: {
      top: 715,
      left: 980,
      width: 20,
      height: 20,
    },
    type: "WATER TANKS",
    isGrouped: true,
    subTanks: [
      {
        id: "EB9-TANK-A",
        name: "TANK A",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "EB9-TANK-B",
        name: "TANK B",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      },
      {
        id: "EB9-TANK-C",
        name: "TANK C",
        currentStage: "Formwork Removal",
        progress: allProgressStages.map((stage) => ({
          stage,
          status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
        })),
      }
    ]
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
      top: 130,
      left: 540,
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
      top: 130,
      left: 710,
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
      top: 420,
      left: 165,
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
      top: 575,
      left: 170,
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
      top: 605,
      left: 1080,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
}

// Combine all tanks by level for easier access
export const tanksByLevel = {
  n00Tanks,
  n10Tanks,
  n20Tanks
}; 