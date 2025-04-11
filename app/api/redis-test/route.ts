import { NextResponse } from 'next/server';
import storage from '@/lib/storage';

export async function GET() {
  try {
    // Test storage connection
    await storage.set('test-key', 'Hello from Storage!');
    const value = await storage.get('test-key');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage connection successful', 
      value,
      mode: process.env.NODE_ENV === 'production' ? 'Vercel KV' : 'Local Storage'
    }, { status: 200 });
  } catch (error: any) {
    console.error('Storage error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to storage',
      message: error.message,
      mode: process.env.NODE_ENV === 'production' ? 'Vercel KV' : 'Local Storage'
    }, { status: 500 });
  }
} 