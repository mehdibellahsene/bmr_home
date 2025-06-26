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

export async function GET() {
  try {
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    const learning = Array.isArray(data.learning) ? data.learning : [];
    
    const response = NextResponse.json(learning);
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return response;
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const newLearning = {
      id: Date.now().toString(),
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
      createdAt: new Date().toISOString(),
    };    const updatedLearning = Array.isArray(data.learning) ? [...data.learning] : [];
    updatedLearning.unshift(newLearning); // Add to beginning
    
    const updateSuccess = await db.updateData({ learning: updatedLearning });
    
    // Always clear cache after update
    db.clearCache();
    
    if (!updateSuccess) {
      if (db.isServerless()) {
        return NextResponse.json({ 
          ...newLearning,
          warning: 'Learning created but not persisted in serverless environment'
        });
      } else {
        return NextResponse.json({ error: 'Failed to persist learning' }, { status: 500 });
      }
    }
    
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
    const db = PortfolioDatabase.getInstance();
    const data = await db.getData();
    
    const learning = Array.isArray(data.learning) ? [...data.learning] as Learning[] : [];
    const learningIndex = learning.findIndex((item) => item.id === body.id);
    
    if (learningIndex === -1) {
      return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
    }
    
    learning[learningIndex] = {
      ...learning[learningIndex],
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date,
    };    const updateSuccess = await db.updateData({ learning });
    
    // Always clear cache after update
    db.clearCache();
    
    if (!updateSuccess) {
      if (db.isServerless()) {
        return NextResponse.json({ 
          ...learning[learningIndex],
          warning: 'Learning updated but not persisted in serverless environment'
        });
      } else {
        return NextResponse.json({ error: 'Failed to persist learning update' }, { status: 500 });
      }
    }
    
    return NextResponse.json(learning[learningIndex]);
  } catch (error) {
    console.error('Failed to update learning:', error);
    return NextResponse.json({ error: 'Failed to update learning' }, { status: 500 });
  }
}
