/**
 * Notes API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/database-simple';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    const notes = await getNotes();
    return NextResponse.json(notes);
  } catch (error: unknown) {
    console.error('Failed to get notes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get notes', details: errorMessage }, 
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

    const newNote = await createNote({
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to create note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create note', details: errorMessage }, 
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

    const updatedNote = await updateNote(body.id, {
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
    });

    if (!updatedNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(updatedNote);
  } catch (error: unknown) {
    console.error('Failed to update note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update note', details: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Note ID is required' }, 
        { status: 400 }
      );
    }

    const deleted = await deleteNote(body.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Failed to delete note:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete note', details: errorMessage }, 
      { status: 500 }
    );
  }
}
