import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDatabase } from '@/lib/database';

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie?.value === 'authenticated';
}

export async function GET(request: NextRequest) {
  try {
    // Check if this is a validation request
    const url = new URL(request.url);
    const isValidation = url.searchParams.has('validate');
    
    // Always get fresh database instance to avoid any caching issues
    const db = PortfolioDatabase.getInstance();
    
    if (isValidation) {
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
    
    // Regular data request - always fresh data
    const data = await db.getData();
    // Remove admin credentials from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { admin: _admin, ...publicData } = data as unknown as Record<string, unknown>;
    
    // Add cache-busting headers and timestamp
    const response = NextResponse.json({
      ...publicData,
      _timestamp: Date.now(), // Add timestamp to force fresh data
    });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('ETag', `"${Date.now()}"`); // Unique ETag for each response
    
    return response;
  } catch (error) {
    console.error('Failed to read data:', error);
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

    console.log('Updating data:', updateData);
    const updateSuccess = await db.updateData(updateData);
    
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
    
    console.log('Data update successful');
    return NextResponse.json({ 
      success: true, 
      persisted: updateSuccess,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to update data:', error);
    return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
  }
}
