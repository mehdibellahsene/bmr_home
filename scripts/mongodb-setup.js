#!/usr/bin/env node

/**
 * MongoDB Migration and Test Script
 * 
 * This script helps you:
 * 1. Test your MongoDB connection
 * 2. Migrate data from filesystem to MongoDB
 * 3. Verify the migration
 */

require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please update your .env.local file with your MongoDB connection string');
    return false;
  }

  console.log('🔗 Testing MongoDB connection...');
  
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    // Test database access
    const db = client.db('bmr-portfolio');
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    return false;
  }
}

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  // Check if portfolio.json exists
  const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ portfolio.json not found at:', dataPath);
    return false;
  }

  // Read portfolio data
  const portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log('📖 Loaded portfolio data from filesystem');

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bmr-portfolio');
    
    // Clear existing data
    await db.collection('profiles').deleteMany({});
    await db.collection('links').deleteMany({});
    await db.collection('notes').deleteMany({});
    await db.collection('learnings').deleteMany({});
    
    // Migrate profile
    if (portfolioData.profile) {
      await db.collection('profiles').insertOne(portfolioData.profile);
      console.log('✅ Migrated profile data');
    }
    
    // Migrate links
    if (portfolioData.links) {
      const allLinks = [
        ...portfolioData.links.work.map(link => ({
          ...link,
          linkId: link.id,
          category: 'work'
        })),
        ...portfolioData.links.presence.map(link => ({
          ...link,
          linkId: link.id,
          category: 'presence'
        }))
      ];
      
      if (allLinks.length > 0) {
        await db.collection('links').insertMany(allLinks);
        console.log(`✅ Migrated ${allLinks.length} links`);
      }
    }
    
    // Migrate notes
    if (portfolioData.notes && portfolioData.notes.length > 0) {
      const notes = portfolioData.notes.map(note => ({
        ...note,
        noteId: note.id
      }));
      await db.collection('notes').insertMany(notes);
      console.log(`✅ Migrated ${notes.length} notes`);
    }
    
    // Migrate learning
    if (portfolioData.learning && portfolioData.learning.length > 0) {
      const learning = portfolioData.learning.map(item => ({
        ...item,
        learningId: item.id
      }));
      await db.collection('learnings').insertMany(learning);
      console.log(`✅ Migrated ${learning.length} learning items`);
    }
    
    await client.close();
    console.log('🎉 Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await client.close();
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('bmr-portfolio');
    
    const profileCount = await db.collection('profiles').countDocuments();
    const linkCount = await db.collection('links').countDocuments();
    const noteCount = await db.collection('notes').countDocuments();
    const learningCount = await db.collection('learnings').countDocuments();
    
    console.log('📊 Migration verification:');
    console.log(`   - Profiles: ${profileCount}`);
    console.log(`   - Links: ${linkCount}`);
    console.log(`   - Notes: ${noteCount}`);
    console.log(`   - Learning items: ${learningCount}`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    await client.close();
    return false;
  }
}

async function main() {
  console.log('🚀 BMR Portfolio MongoDB Setup\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      await testConnection();
      break;
      
    case 'migrate':
      const connected = await testConnection();
      if (connected) {
        const migrated = await migrateData();
        if (migrated) {
          await verifyMigration();
        }
      }
      break;
      
    case 'verify':
      await verifyMigration();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/mongodb-setup.js test     - Test MongoDB connection');
      console.log('  node scripts/mongodb-setup.js migrate  - Migrate data from filesystem to MongoDB');
      console.log('  node scripts/mongodb-setup.js verify   - Verify migration results');
      break;
  }
}

main().catch(console.error);
