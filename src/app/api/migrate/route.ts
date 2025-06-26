import { NextRequest, NextResponse } from 'next/server';
import { mongoDb } from '@/lib/database-mongo';
import fs from 'fs';
import path from 'path';

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

    // Check if portfolio.json exists
    const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({
        success: false,
        message: 'No portfolio.json file found to migrate'
      }, { status: 404 });
    }

    // Read portfolio data from filesystem
    const portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('📖 Loaded portfolio data from filesystem');

    let migratedCount = 0;

    // Migrate profile
    if (portfolioData.profile) {
      await mongoDb.upsertProfile(portfolioData.profile);
      console.log('✅ Migrated profile data');
      migratedCount++;
    }

    // Migrate notes
    if (portfolioData.notes && Array.isArray(portfolioData.notes)) {
      for (const note of portfolioData.notes) {
        await mongoDb.createNote({
          title: note.title,
          content: note.content,
          publishedAt: note.publishedAt,
        });
      }
      console.log(`✅ Migrated ${portfolioData.notes.length} notes`);
      migratedCount += portfolioData.notes.length;
    }

    // Migrate learning
    if (portfolioData.learning && Array.isArray(portfolioData.learning)) {
      for (const item of portfolioData.learning) {
        await mongoDb.createLearning({
          title: item.title,
          description: item.description,
          type: item.type,
          date: item.date,
        });
      }
      console.log(`✅ Migrated ${portfolioData.learning.length} learning items`);
      migratedCount += portfolioData.learning.length;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} items to MongoDB`,
      details: {
        profile: portfolioData.profile ? 1 : 0,
        notes: portfolioData.notes ? portfolioData.notes.length : 0,
        learning: portfolioData.learning ? portfolioData.learning.length : 0,
      }
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
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

    // Check if portfolio.json exists
    const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
    const hasPortfolioFile = fs.existsSync(dataPath);
    
    // Get MongoDB health status
    const health = await mongoDb.healthCheck();
    
    // Get current data stats
    const stats = await mongoDb.getStats();
    
    return NextResponse.json({
      mongoDBConfigured: !!process.env.MONGODB_URI,
      mongoDBHealthy: health.status === 'healthy',
      hasPortfolioFile,
      currentDataStats: stats,
      canMigrate: !!process.env.MONGODB_URI && hasPortfolioFile,
      healthDetails: health.details
    });
  } catch (error) {
    console.error('Migration status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get migration status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
