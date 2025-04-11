import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const DATA_DIR = path.join(process.cwd(), '.local-data');
const TANKS_FILE = path.join(DATA_DIR, 'tanksData.json');

// Read tanks data from local storage
async function getTanksData() {
  try {
    if (fs.existsSync(TANKS_FILE)) {
      const data = await readFile(TANKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { tanks: [], lastUpdated: new Date().toISOString() };
  } catch (error) {
    console.error('Error reading tanks data:', error);
    return { tanks: [], lastUpdated: new Date().toISOString() };
  }
}

// Write tanks data to local storage
async function setTanksData(data: any) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await writeFile(TANKS_FILE, jsonData, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing tanks data:', error);
    return false;
  }
}

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
    const body = await request.json();
    
    // Update lastUpdated timestamp
    body.lastUpdated = new Date().toISOString();
    
    const success = await setTanksData(body);
    
    if (success) {
      return NextResponse.json({ success: true });
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