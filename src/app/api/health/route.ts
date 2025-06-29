/**
 * Health Check API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseHealth, getDatabaseStats } from '@/lib/database-simple';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const detailed = url.searchParams.has('detailed');
    
    if (detailed) {
      // Detailed health check with stats
      const [health, stats] = await Promise.all([
        checkDatabaseHealth(),
        getDatabaseStats(),
      ]);
      
      return NextResponse.json({
        status: health.connected ? 'healthy' : 'unhealthy',
        database: {
          connected: health.connected,
          collections: stats,
          totalDocuments: Object.values(stats).reduce((sum, count) => sum + count, 0),
          error: health.error
        },
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mongoConfigured: !!process.env.MONGODB_URI,
        }
      });
    } else {
      // Simple health check
      const health = await checkDatabaseHealth();
      
      return NextResponse.json({
        status: health.connected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
