import { NextResponse } from 'next/server';
import { TasksData } from '@/app/data/tanks';
import { getTanksData, saveTanksData } from '@/app/lib/vercel-kv';

// GET handler for tasks
export async function GET(request: Request) {
  try {
    const tasksData = await getTanksData();
    
    // Check if we have data or need to initialize with defaults
    const isEmpty = Object.keys(tasksData.n00Tanks).length === 0 && 
                   Object.keys(tasksData.n10Tanks).length === 0 && 
                   Object.keys(tasksData.n20Tanks).length === 0;
    
    // If we have no data, let's check for the initialization query parameter
    if (isEmpty) {
      const url = new URL(request.url);
      const initialize = url.searchParams.get('initialize');
      
      if (initialize === 'true') {
        // In a production app, we'd have default data to initialize with
        // But we'll skip this for now and let the frontend handle initialization
        return NextResponse.json(
          { message: 'Empty data structure, please initialize from frontend' },
          { status: 200 }
        );
      }
    }
    
    return NextResponse.json(tasksData);
  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tasks data' },
      { status: 500 }
    );
  }
}

// POST handler for updating all tasks
export async function POST(request: Request) {
  try {
    const tasksData = await request.json() as TasksData;
    
    if (!tasksData || typeof tasksData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    const success = await saveTanksData(tasksData);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Tasks data updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to write tasks data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to update tasks data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 