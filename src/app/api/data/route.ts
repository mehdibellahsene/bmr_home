import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('[API] /api/data - Request started');
  
  try {
    // Check if this is a validation request
    const url = new URL(request.url);
    const isValidation = url.searchParams.has('validate');
    const isHealthCheck = url.searchParams.has('health');
    const isStats = url.searchParams.has('stats');
    
    if (isHealthCheck) {
      console.log('[API] Health check request');
      const health = await mongoDb.healthCheck();
      return NextResponse.json(health);
    }
    
    if (isStats) {
      console.log('[API] Stats request');
      const stats = await mongoDb.getStats();
      return NextResponse.json(stats);
    }
    
    if (isValidation) {
      console.log('[API] Validation request');
      const data = await mongoDb.getPortfolioData();
      const validation = {
        status: 'success',
        timestamp: new Date().toISOString(),
        data: {
          hasNotes: Array.isArray(data.notes),
          notesCount: Array.isArray(data.notes) ? data.notes.length : 0,
          hasLearning: Array.isArray(data.learning),
          learningCount: Array.isArray(data.learning) ? data.learning.length : 0,
          hasProfile: !!data.profile,
          hasLinks: !!data.links,
        },
        rawData: {
          notes: data.notes || [],
          learning: data.learning || [],
        }
      };
      
      return NextResponse.json(validation);
    }
    
    // Regular data request - get fresh data from MongoDB
    const data = await mongoDb.getPortfolioData();
    
    // Remove admin credentials from response if they exist
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...publicData } = data as unknown as Record<string, unknown>;
    
    // Use proper caching headers for better performance
    const response = NextResponse.json(publicData);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    response.headers.set('X-Data-Source', 'mongodb');
    
    const duration = Date.now() - startTime;
    console.log(`[API] /api/data - Request completed in ${duration}ms`);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] /api/data - Failed after ${duration}ms:`, error);
    return NextResponse.json(
      { error: 'Failed to read data. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Filter out admin credentials from updates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...updateData } = body;

    // Update profile if provided
    if (updateData.profile) {
      await mongoDb.upsertProfile(updateData.profile);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Data updated successfully in MongoDB' 
    });
  } catch (error) {
    console.error('Failed to update data:', error);
    return NextResponse.json(
      { error: 'Failed to update data. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}
