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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    const notes = Array.isArray(data.notes) ? data.notes as Note[] : [];
    const note = notes.find((n: Note) => n.id === id);
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to read note:', error);
    return NextResponse.json({ error: 'Failed to read note' }, { status: 500 });
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const notes = Array.isArray(data.notes) ? [...data.notes] as Note[] : [];
    const noteIndex = notes.findIndex((n: Note) => n.id === id);
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
      updatedAt: new Date().toISOString(),
    };
      notes[noteIndex] = updatedNote;
    const updateSuccess = await db.updateData({ notes });
    
    // Always clear cache after update
    db.clearCache();
    
    if (!updateSuccess && db.isServerless()) {
      return NextResponse.json({ 
        ...updatedNote,
        warning: 'Note updated but not persisted in serverless environment'
      });
    }
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const notes = Array.isArray(data.notes) ? [...data.notes] as Note[] : [];
    const noteIndex = notes.findIndex((n: Note) => n.id === id);
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }    notes.splice(noteIndex, 1);
    const updateSuccess = await db.updateData({ notes });
    
    // Always clear cache after update
    db.clearCache();
    
    if (!updateSuccess) {
      if (db.isServerless()) {
        return NextResponse.json({ 
          success: true,
          warning: 'Note deleted but not persisted in serverless environment'
        });
      } else {
        return NextResponse.json({ error: 'Failed to persist note deletion' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
