// Temporary implementation that doesn't use Vercel KV
// We'll replace this with the actual KV integration after deployment is fixed

// Types from the API route for consistency
export enum ProgressStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export enum ProgressStage {
  STAGE_1 = 'Stage 1',
  STAGE_2 = 'Stage 2',
  STAGE_3 = 'Stage 3',
  STAGE_4 = 'Stage 4'
}

export enum TankType {
  OVERHEAD = 'Overhead Tank',
  UNDERGROUND = 'Underground Tank'
}

export type StageProgress = {
  stage: ProgressStage;
  status: ProgressStatus;
};

export type WaterTank = {
  id: string;
  name: string;
  type: TankType;
  location: string;
  progress: StageProgress[];
};

export type TasksData = {
  tanks: WaterTank[];
  lastUpdated: string;
};

// Static sample data
const sampleData: TasksData = {
  tanks: [
    {
      id: '1',
      name: 'Main Building Tank',
      type: TankType.OVERHEAD,
      location: 'Main Building',
      progress: [
        { stage: ProgressStage.STAGE_1, status: ProgressStatus.COMPLETED },
        { stage: ProgressStage.STAGE_2, status: ProgressStatus.IN_PROGRESS },
        { stage: ProgressStage.STAGE_3, status: ProgressStatus.NOT_STARTED },
        { stage: ProgressStage.STAGE_4, status: ProgressStatus.NOT_STARTED }
      ]
    },
    {
      id: '2',
      name: 'Garden Area Tank',
      type: TankType.UNDERGROUND,
      location: 'Garden Area',
      progress: [
        { stage: ProgressStage.STAGE_1, status: ProgressStatus.COMPLETED },
        { stage: ProgressStage.STAGE_2, status: ProgressStatus.COMPLETED },
        { stage: ProgressStage.STAGE_3, status: ProgressStatus.IN_PROGRESS },
        { stage: ProgressStage.STAGE_4, status: ProgressStatus.NOT_STARTED }
      ]
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Get all tanks data
export async function getTanksData(): Promise<TasksData> {
  // Just return the sample data for now
  return Promise.resolve(sampleData);
}

// Save all tanks data
export async function saveTanksData(data: TasksData): Promise<boolean> {
  // Just pretend to save and return success
  console.log('Pretending to save data:', data);
  return Promise.resolve(true);
}

// Get a specific tank
export async function getTank(tankId: string) {
  const tank = sampleData.tanks.find(t => t.id === tankId);
  return tank || null;
}

// Update a specific tank
export async function updateTank(tankId: string, tankData: WaterTank): Promise<boolean> {
  console.log('Pretending to update tank:', tankId, tankData);
  return Promise.resolve(true);
} 