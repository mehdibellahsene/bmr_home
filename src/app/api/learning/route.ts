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
    return NextResponse.json(data.learning || []);
  } catch (error) {
    console.error('Failed to read learning:', error);
    return NextResponse.json({ error: 'Failed to read learning' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = readData();
    
    const newLearning = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
      createdAt: new Date().toISOString(),
    };
    
    data.learning = data.learning || [];
    data.learning.unshift(newLearning); // Add to beginning
    
    writeData(data);
    return NextResponse.json(newLearning);
  } catch (error) {
    console.error('Failed to create learning:', error);
    return NextResponse.json({ error: 'Failed to create learning' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = readData();
    
    const learningIndex = data.learning.findIndex((item: { id: string }) => item.id === body.id);
    if (learningIndex === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    data.learning[learningIndex] = {
      ...data.learning[learningIndex],
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    };
    
    writeData(data);
    return NextResponse.json(data.learning[learningIndex]);
  } catch (error) {
    console.error('Failed to update learning:', error);
    return NextResponse.json({ error: 'Failed to update learning' }, { status: 500 });
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
      return NextResponse.json({ error: 'Learning ID required' }, { status: 400 });
    }
    
    const data = readData();
    const learningIndex = data.learning.findIndex((item: { id: string }) => item.id === id);
    
    if (learningIndex === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    data.learning.splice(learningIndex, 1);
    writeData(data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete learning:', error);
    return NextResponse.json({ error: 'Failed to delete learning' }, { status: 500 });
  }
}
