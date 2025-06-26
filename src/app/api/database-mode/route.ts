import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDatabase } from '@/lib/database';

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode } = body;
    
    if (mode !== 'mongodb' && mode !== 'filesystem') {
      return NextResponse.json({
        error: 'Invalid mode. Must be "mongodb" or "filesystem"'
      }, { status: 400 });
    }

    const db = PortfolioDatabase.getInstance();
    db.setMongoDBMode(mode === 'mongodb');
    
    return NextResponse.json({
      success: true,
      message: `Database mode set to ${mode}`,
      currentMode: mode
    });
  } catch (error) {
    console.error('Database mode switch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
