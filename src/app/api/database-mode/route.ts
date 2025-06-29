/**
 * Database Mode API - Simplified (MongoDB Only)
 * 
 * Since we now use MongoDB exclusively, this endpoint returns 
 * the current MongoDB status
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database-simple';

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

    // Since we're MongoDB-only now, just return the current status
    const health = await checkDatabaseHealth();
    
    return NextResponse.json({
      success: true,
      message: 'Application uses MongoDB exclusively',
      currentMode: 'mongodb',
      connected: health.connected,
      error: health.error
    });
  } catch (error) {
    console.error('Database mode check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
