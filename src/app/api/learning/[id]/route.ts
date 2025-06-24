import { NextRequest, NextResponse } from 'next/server';
import { PortfolioDatabase } from '@/lib/database';

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt: string;
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
    const learning = Array.isArray(data.learning) ? data.learning as Learning[] : [];
    const learningItem = learning.find((l: Learning) => l.id === id);
    
    if (!learningItem) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    return NextResponse.json(learningItem);
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const learning = Array.isArray(data.learning) ? [...data.learning] as Learning[] : [];
    const learningIndex = learning.findIndex((l: Learning) => l.id === id);
    
    if (learningIndex === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    const updatedLearning: Learning = {
      ...learning[learningIndex],
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    };
    
    learning[learningIndex] = updatedLearning;
    const updateSuccess = await db.updateData({ learning });
    
    if (!updateSuccess && db.isServerless()) {
      return NextResponse.json({ 
        ...updatedLearning,
        warning: 'Learning updated but not persisted in serverless environment'
      });
    }
    
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const learning = Array.isArray(data.learning) ? [...data.learning] as Learning[] : [];
    const learningIndex = learning.findIndex((l: Learning) => l.id === id);
    
    if (learningIndex === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    learning.splice(learningIndex, 1);
    const updateSuccess = await db.updateData({ learning });
    
    if (!updateSuccess && db.isServerless()) {
      return NextResponse.json({ 
        success: true,
        warning: 'Learning deleted but not persisted in serverless environment'
      });
    }
    
    return NextResponse.json({ message: 'Learning item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete learning item:', error);
    return NextResponse.json({ error: 'Failed to delete learning item' }, { status: 500 });
  }
}
