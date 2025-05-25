import { NextResponse } from 'next/server';
import { WaterTank } from '@/app/data/tanks';
import { getTank, updateTank } from '@/lib/storage';

interface RouteParams {
  params: {
    level: string;
    tankId: string;
  };
}

// GET handler for retrieving a specific tank
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { level, tankId } = params;
    
    // Validate level
    if (!['n00Tanks', 'n10Tanks', 'n20Tanks', 'n30Tanks'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level' },
        { status: 400 }
      );
    }
    
    const tank = await getTank(level, tankId);
    
    if (!tank) {
      return NextResponse.json(
        { error: 'Tank not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(tank);
  } catch (error) {
    console.error('Error in GET /api/tasks/[level]/[tankId]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tank data' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a specific tank
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { level, tankId } = params;
    
    // Validate level
    if (!['n00Tanks', 'n10Tanks', 'n20Tanks', 'n30Tanks'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { updatedTank } = body;
    
    if (!updatedTank) {
      return NextResponse.json(
        { error: 'Missing updatedTank data' },
        { status: 400 }
      );
    }
    
    const success = await updateTank(level, tankId, updatedTank);
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Tank updated successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update tank' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/tasks/[level]/[tankId]:', error);
    return NextResponse.json(
      { error: 'Failed to update tank' },
      { status: 500 }
    );
  }
} 