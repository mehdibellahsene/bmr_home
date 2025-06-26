import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const detailed = url.searchParams.has('detailed');
    
    if (detailed) {
      // Detailed health check with stats
      const [health, stats] = await Promise.all([
        mongoDb.healthCheck(),
        mongoDb.getStats(),
      ]);
      
      return NextResponse.json({
        status: health.status,
        details: health.details,
        database: {
          connected: health.status === 'healthy',
          collections: stats,
          totalDocuments: Object.values(stats).reduce((sum, count) => sum + count, 0),
        },
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mongoConfigured: !!process.env.MONGODB_URI,
        }
      });
    } else {
      // Simple health check
      const health = await mongoDb.healthCheck();
      
      return NextResponse.json({
        status: health.status,
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
