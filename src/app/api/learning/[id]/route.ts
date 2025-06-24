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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = readData();
    const learning = data.learning?.find((l: Record<string, unknown>) => l.id === id);
    
    if (!learning) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    return NextResponse.json(learning);
  } catch (error) {
    console.error('Failed to read learning item:', error);
    return NextResponse.json({ error: 'Failed to read learning item' }, { status: 500 });
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
    const data = readData();
    
    const learningIndex = data.learning?.findIndex((l: Record<string, unknown>) => l.id === id);
    
    if (learningIndex === -1 || learningIndex === undefined) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    const updatedLearning = {
      ...data.learning[learningIndex],
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    };
    
    data.learning[learningIndex] = updatedLearning;
    writeData(data);
    
    return NextResponse.json(updatedLearning);
  } catch (error) {
    console.error('Failed to update learning item:', error);
    return NextResponse.json({ error: 'Failed to update learning item' }, { status: 500 });
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
    const data = readData();
    const learningIndex = data.learning?.findIndex((l: Record<string, unknown>) => l.id === id);
    
    if (learningIndex === -1 || learningIndex === undefined) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    data.learning.splice(learningIndex, 1);
    writeData(data);
    
    return NextResponse.json({ message: 'Learning item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete learning item:', error);
    return NextResponse.json({ error: 'Failed to delete learning item' }, { status: 500 });
  }
}
