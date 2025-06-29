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
    const learning = await getLearning();
    return NextResponse.json(learning);
  } catch (error: unknown) {
    console.error('Failed to get learning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get learning', details: errorMessage }, 
      { status: 500 }
    );
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
