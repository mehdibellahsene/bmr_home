import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    const learning = await mongoDb.getLearning();
    
    const response = NextResponse.json(learning);
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Failed to read learning:', error);
    return NextResponse.json(
      { error: 'Failed to read learning. Please check your database connection.' }, 
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

    const newLearning = await mongoDb.createLearning({
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    });

    return NextResponse.json(newLearning, { status: 201 });
  } catch (error) {
    console.error('Failed to create learning:', error);
    return NextResponse.json(
      { error: 'Failed to create learning. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id || !body.title || !body.description || !body.type || !body.date) {
      return NextResponse.json(
        { error: 'ID, title, description, type, and date are required' }, 
        { status: 400 }
      );
    }

    const updatedLearning = await mongoDb.updateLearning(body.id, {
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
    console.error('Failed to update learning:', error);
    return NextResponse.json(
      { error: 'Failed to update learning. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}

