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

    const db = PortfolioDatabase.getInstance();
    
    // Migrate data from filesystem to MongoDB
    const success = await db.migrateToMongoDB();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Data successfully migrated to MongoDB'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to migrate data to MongoDB'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = PortfolioDatabase.getInstance();
    
    // Check current database mode
    const isMongoDB = !db['useFilesystem']; // Access private property for status
    
    return NextResponse.json({
      currentMode: isMongoDB ? 'mongodb' : 'filesystem',
      mongoDBConfigured: !!process.env.MONGODB_URI,
      canMigrate: !!process.env.MONGODB_URI
    });
  } catch (error) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
