/**
 * Migration API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseStats } from '@/lib/database-simple';
import fs from 'fs';
import path from 'path';

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

    return NextResponse.json({
      success: true,
      message: 'Migration functionality moved to scripts/mongodb-setup-simple.js',
      note: 'Use: node scripts/mongodb-setup-simple.js migrate'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
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

    // Check if portfolio.json exists
    const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
    const hasPortfolioFile = fs.existsSync(dataPath);
    
    // Get MongoDB health status
    const health = await checkDatabaseHealth();
    
    // Get current data stats
    const stats = await getDatabaseStats();
    
    return NextResponse.json({
      mongoDBConfigured: !!process.env.MONGODB_URI,
      mongoDBHealthy: health.connected,
      hasPortfolioFile,
      currentDataStats: stats,
      canMigrate: !!process.env.MONGODB_URI && hasPortfolioFile,
      migrationScript: 'Use: node scripts/mongodb-setup-simple.js migrate'
    });
  } catch (error) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get migration status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
