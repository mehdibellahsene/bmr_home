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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = readData();
    const note = data.notes?.find((n: Record<string, unknown>) => n.id === params.id);
    
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
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = readData();
    
    const noteIndex = data.notes?.findIndex((n: Record<string, unknown>) => n.id === params.id);
    
    if (noteIndex === -1 || noteIndex === undefined) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    const updatedNote = {
      ...data.notes[noteIndex],
      title: body.title,
      content: body.content,
      publishedAt: body.publishedAt,
      updatedAt: new Date().toISOString(),
    };
    
    data.notes[noteIndex] = updatedNote;
    writeData(data);
    
    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Failed to update note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = readData();
    const noteIndex = data.notes?.findIndex((n: Record<string, unknown>) => n.id === params.id);
    
    if (noteIndex === -1 || noteIndex === undefined) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    data.notes.splice(noteIndex, 1);
    writeData(data);
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
