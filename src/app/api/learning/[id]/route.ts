/**
 * Individual Learning API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLearningItem, updateLearning, deleteLearning } from '@/lib/database-simple';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const learning = await getLearningItem(id);
    
    if (!learning) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    return NextResponse.json(learning);
  } catch (error: unknown) {
    console.error('Failed to get learning item:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get learning item', details: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedLearning = await updateLearning(id, {
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
      links: body.links || [],
    });

    if (!updatedLearning) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLearning);
  } catch (error: unknown) {
    console.error('Failed to update learning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update learning', details: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteLearning(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to delete learning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete learning', details: errorMessage }, 
      { status: 500 }
    );
  }
}
