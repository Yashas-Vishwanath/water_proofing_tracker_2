import { NextResponse } from 'next/server';

// Types
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

// GET handler
export async function GET() {
  try {
    return NextResponse.json({ success: true, data: sampleData });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    // For now, just return success with the sample data
    // Later we'll implement actual data saving with KV
    return NextResponse.json({ 
      success: true, 
      message: 'Data received (but not saved yet)',
      data: sampleData
    });
  } catch (error) {
    console.error('Error updating tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update tasks data' },
      { status: 500 }
    );
  }
} 