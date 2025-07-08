/**
 * Learning API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLearning, createLearning } from '@/lib/database-simple';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    console.log('[API] GET /api/learning - Starting request');
    console.log('[API] Environment check:', {
      hasMongoURI: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    });
    
    const learning = await getLearning();
    console.log('[API] GET /api/learning - Success, returning', learning.length, 'items');
    return NextResponse.json(learning);
  } catch (error: unknown) {
    console.error('[API] GET /api/learning - Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] GET /api/learning - Error details:', errorMessage);
    
    // Return empty array as fallback instead of error
    console.log('[API] GET /api/learning - Returning empty array as fallback');
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.type || !body.date) {
      return NextResponse.json(
        { error: 'Title, description, type, and date are required' }, 
        { status: 400 }
      );
    }

    const newLearning = await createLearning({
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
      links: body.links || [],
    });

    return NextResponse.json(newLearning, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create learning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create learning', details: errorMessage }, 
      { status: 500 }
    );
  }
}
