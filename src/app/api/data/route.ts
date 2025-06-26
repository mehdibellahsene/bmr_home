import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDatabase } from '@/lib/database';

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
    const forceRefresh = url.searchParams.has('refresh');
    
    const db = PortfolioDatabase.getInstance();
    
    if (isValidation) {
      console.log('[API] Validation request - clearing cache');
      // Clear cache to ensure fresh data for validation
      db.clearCache();
      
      const data = await db.getData();
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
    
    // Only clear cache if explicitly requested (for admin updates)
    if (forceRefresh) {
      console.log('[API] Force refresh requested - clearing cache');
      db.clearCache();
    }
    
    // Regular data request - use cached data for better performance
    const data = await db.getData();
    // Remove admin credentials from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...publicData } = data as unknown as Record<string, unknown>;
    
    // Use proper caching headers for better performance
    const response = NextResponse.json(publicData);
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    response.headers.set('X-Data-Source', forceRefresh ? 'fresh' : 'cached');
    
    const duration = Date.now() - startTime;
    console.log(`[API] /api/data - Request completed in ${duration}ms`);
    
    return response;} catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] /api/data - Failed after ${duration}ms:`, error);
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = PortfolioDatabase.getInstance();
    
    // Filter out admin credentials from updates
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...updateData } = body;

    const updateSuccess = await db.updateData(updateData);
    
    // Always clear cache after update to ensure fresh data for subsequent requests
    db.clearCache();
    
    if (!updateSuccess) {
      if (db.isServerless()) {
        // In serverless environments, we can't persist to file system
        return NextResponse.json({ 
          error: 'Cannot persist data in serverless environment. Data updated for current session only.',
          warning: 'Consider using a database service for persistent data storage.',
          temporaryUpdate: true
        }, { status: 200 });
      } else {
        return NextResponse.json({ error: 'Failed to persist data' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ success: true, persisted: updateSuccess });
  } catch (error) {
    console.error('Failed to update data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
