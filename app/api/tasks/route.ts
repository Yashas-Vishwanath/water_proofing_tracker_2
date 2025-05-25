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

// POST handler to update all tanks data
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the body structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Destructure and validate the expected tank levels
    const { n00Tanks = {}, n10Tanks = {}, n20Tanks = {}, n30Tanks = {}, ...otherLevels } = body;
    
    // Validate the data
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }
    
    // Ensure all required levels exist
    const validData: TasksData = {
      n00Tanks,
      n10Tanks,
      n20Tanks,
      n30Tanks,
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