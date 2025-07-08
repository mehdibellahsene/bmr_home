import { NextResponse } from 'next/server';
import { getLearning } from '@/lib/database-simple';

export async function GET() {
  try {
    console.log('[DEBUG] GET /api/debug/learning - Starting debug request');
    
    const debugInfo: {
      timestamp: string;
      environment: {
        hasMongoURI: boolean;
        mongoURIFormat: string;
        nodeEnv: string | undefined;
      };
      database: {
        status: string;
        learningCount?: number;
        sampleItems?: Array<{
          id: string;
          title: string;
          type: string;
          date: string;
        }>;
        error?: string;
      };
    } = {
      timestamp: new Date().toISOString(),
      environment: {
        hasMongoURI: !!process.env.MONGODB_URI,
        mongoURIFormat: process.env.MONGODB_URI ? 'Valid connection string format' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        status: 'checking...'
      }
    };

    // Try to fetch learning data for debugging
    try {
      const learning = await getLearning();
      debugInfo.database = {
        status: 'connected',
        learningCount: learning.length,
        sampleItems: learning.slice(0, 3).map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          date: item.date
        }))
      };
    } catch (dbError) {
      debugInfo.database = {
        status: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error'
      };
    }

    console.log('[DEBUG] GET /api/debug/learning - Success', debugInfo);
    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('[DEBUG] GET /api/debug/learning - Error:', error);
    return NextResponse.json(
      { 
        error: 'Debug learning endpoint failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}