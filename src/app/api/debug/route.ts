import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
        hasMongoURI: !!process.env.MONGODB_URI,
        mongoURIFormat: process.env.MONGODB_URI ? 'Valid connection string format' : 'Not set',
        hasAdminCreds: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
        vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
        isVercel: !!process.env.VERCEL,
      },
      mongodb: {
        configured: !!process.env.MONGODB_URI,
        uri: process.env.MONGODB_URI ? 
          process.env.MONGODB_URI.replace(/:[^:@]*@/, ':***@') : 
          'Not configured'
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
