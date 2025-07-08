/**
 * Learning Links Migration API - Simplified MongoDB Only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLearning, updateLearning } from '@/lib/database-simple';

// Check if user is authenticated
function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('admin-auth');
  return authCookie?.value === 'authenticated';
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, learningId, links } = body;

    if (action === 'add-links' && learningId && links) {
      // Get the learning item
      const learningItems = await getLearning();
      const learningItem = learningItems.find(item => item.id === learningId);
      
      if (!learningItem) {
        return NextResponse.json(
          { error: 'Learning item not found' },
          { status: 404 }
        );
      }

      // Add or update links
      const updatedItem = {
        ...learningItem,
        links: links
      };

      await updateLearning(learningId, updatedItem);

      return NextResponse.json({
        success: true,
        message: 'Learning links updated successfully',
        learningId,
        linksCount: links.length
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action or missing parameters',
      availableActions: ['add-links'],
      requiredParams: ['learningId', 'links']
    });

  } catch (error) {
    console.error('Learning links migration error:', error);
    return NextResponse.json(
      { 
        error: 'Learning links migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all learning items and their links status
    const learningItems = await getLearning();
    
    const linksStatus = learningItems.map(item => ({
      id: item.id,
      title: item.title,
      hasLinks: !!(item.links && item.links.length > 0),
      linksCount: item.links ? item.links.length : 0,
      links: item.links || []
    }));

    return NextResponse.json({
      totalLearningItems: learningItems.length,
      itemsWithLinks: linksStatus.filter(item => item.hasLinks).length,
      itemsWithoutLinks: linksStatus.filter(item => !item.hasLinks).length,
      linksStatus,
      migrationNote: 'Use POST with action: "add-links" to update learning links'
    });

  } catch (error) {
    console.error('Learning links status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get learning links status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}