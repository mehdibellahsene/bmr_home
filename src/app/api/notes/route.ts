import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDatabase } from '@/lib/database';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    console.log('Fetching notes...');
    const db = PortfolioDatabase.getInstance();
    // Clear cache to ensure fresh data
    db.clearCache();
    const data = await db.getData();
    const notes = Array.isArray(data.notes) ? data.notes : [];
    console.log(`Found ${notes.length} notes`);
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to read notes:', error);
    return NextResponse.json({ error: 'Failed to read notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const newNote = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedNotes = Array.isArray(data.notes) ? [...data.notes] : [];
    updatedNotes.unshift(newNote); // Add to beginning
    
    const updateSuccess = await db.updateData({ notes: updatedNotes });
    
    if (!updateSuccess && db.isServerless()) {
      return NextResponse.json({ 
        ...newNote,
        warning: 'Note created but not persisted in serverless environment'
      });
    }
    
    return NextResponse.json(newNote);
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
      const notes = Array.isArray(data.notes) ? [...data.notes] as Note[] : [];
    const noteIndex = notes.findIndex((note) => note.id === body.id);
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
      updatedAt: new Date().toISOString(),
    };
    
    const updateSuccess = await db.updateData({ notes });
    
    if (!updateSuccess && db.isServerless()) {
      return NextResponse.json({ 
        ...notes[noteIndex],
        warning: 'Note updated but not persisted in serverless environment'
      });
    }
      return NextResponse.json(notes[noteIndex]);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
