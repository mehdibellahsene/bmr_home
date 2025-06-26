import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    const notes = await mongoDb.getNotes();
    
    const response = NextResponse.json(notes);
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return response;
  } catch (error) {
    console.error('Failed to read notes:', error);
    return NextResponse.json(
      { error: 'Failed to read notes. Please check your database connection.' }, 
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
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' }, 
        { status: 400 }
      );
    }

    const newNote = await mongoDb.createNote({
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: 'Failed to create note. Please check your database connection.' }, 
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
    if (!body.id || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'ID, title, and content are required' }, 
        { status: 400 }
      );
    }

    const updatedNote = await mongoDb.updateNote(body.id, {
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
    });

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json(
      { error: 'Failed to update note. Please check your database connection.' }, 
      { status: 500 }
    );
  }
}
