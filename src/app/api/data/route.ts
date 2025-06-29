/**
 * Portfolio Data API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, checkDatabaseHealth, getDatabaseStats, updateProfile, upsertLinks } from '@/lib/database-simple';

// Check if user is authenticated
function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET(request: Request) {
  console.log('[API] /api/data - GET Request started');
  
  try {
    const url = new URL(request.url);
    const healthCheck = url.searchParams.get('health');
    const stats = url.searchParams.get('stats');
    
    // Health check endpoint
    if (healthCheck === 'true') {
      const health = await checkDatabaseHealth();
      return NextResponse.json(health);
    }
    
    // Stats endpoint
    if (stats === 'true') {
      const statistics = await getDatabaseStats();
      return NextResponse.json(statistics);
    }
    
    // Get complete portfolio data
    const portfolioData = await getPortfolioData();
    
    console.log('[API] /api/data - GET Success');
    return NextResponse.json(portfolioData);
    
  } catch (error: unknown) {
    console.error('[API] /api/data - GET Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch portfolio data',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] /api/data - POST Request started');
  
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Handle profile update
    if (body.profile) {
      const updatedProfile = await updateProfile(body.profile);
      if (updatedProfile) {
        console.log('[API] /api/data - Profile updated successfully');
        return NextResponse.json({ success: true, message: 'Profile updated successfully' });
      } else {
        throw new Error('Failed to update profile');
      }
    }
    
    // Handle links update
    if (body.links) {
      const updatedLinks = await upsertLinks(body.links);
      if (updatedLinks) {
        console.log('[API] /api/data - Links updated successfully');
        return NextResponse.json({ success: true, message: 'Links updated successfully' });
      } else {
        throw new Error('Failed to update links');
      }
    }
    
    return NextResponse.json({ error: 'No valid data provided' }, { status: 400 });
    
  } catch (error: unknown) {
    console.error('[API] /api/data - POST Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to update data',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
