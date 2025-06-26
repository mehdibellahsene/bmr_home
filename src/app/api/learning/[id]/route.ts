import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';

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
    const learning = await mongoDb.getLearningItem(id);
    
    if (!learning) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    return NextResponse.json(learning);
  } catch (error) {
    console.error('Failed to read learning item:', error);
    return NextResponse.json(
      { error: 'Failed to read learning item. Please check your database connection.' }, 
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
    
    // Validate required fields
    if (!body.title || !body.description || !body.type || !body.date) {
      return NextResponse.json(
        { error: 'Title, description, type, and date are required' }, 
        { status: 400 }
      );
    }

    const updatedLearning = await mongoDb.updateLearning(id, {
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    });

    if (!updatedLearning) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLearning);
  } catch (error) {
    console.error('Failed to update learning item:', error);
    return NextResponse.json(
      { error: 'Failed to update learning item. Please check your database connection.' }, 
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
    const deleted = await mongoDb.deleteLearning(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Learning item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete learning item:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning item. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}
