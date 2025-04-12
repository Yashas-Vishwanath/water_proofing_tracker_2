import { NextResponse } from 'next/server';
import { TasksData } from '@/app/data/tanks';
import { getTanksData, setTanksData } from '@/lib/storage';

// GET handler for tasks
export async function GET() {
  try {
    const data = await getTanksData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tanks data' },
      { status: 500 }
    );
  }
}

// POST handler for updating all tasks
export async function POST(request: Request) {
  try {
    const body = await request.json() as TasksData;
    
    // Validate the data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }
    
    // Ensure all required levels exist
    const { n00Tanks = {}, n10Tanks = {}, n20Tanks = {}, ...otherLevels } = body;
    const validData: TasksData = {
      n00Tanks,
      n10Tanks,
      n20Tanks,
      ...otherLevels
    };
    
    const success = await setTanksData(validData);
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Tank data updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update tanks data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update tanks data' },
      { status: 500 }
    );
  }
} 