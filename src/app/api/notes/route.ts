import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');

function readData() {
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(fileContents);
}

function writeData(data: Record<string, unknown>) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie && authCookie.value === 'authenticated';
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data.notes || []);
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
    const data = readData();
    
    const newNote = {
      id: Date.now().toString(),
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    data.notes = data.notes || [];
    data.notes.unshift(newNote); // Add to beginning
    
    writeData(data);
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
    const data = readData();
    
    const noteIndex = data.notes.findIndex((note: { id: string }) => note.id === body.id);
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    data.notes[noteIndex] = {
      ...data.notes[noteIndex],
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
      updatedAt: new Date().toISOString(),
    };
    
    writeData(data);
    return NextResponse.json(data.notes[noteIndex]);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }
    
    const data = readData();
    const noteIndex = data.notes.findIndex((note: { id: string }) => note.id === id);
    
    if (noteIndex === -1) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    data.notes.splice(noteIndex, 1);
    writeData(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
