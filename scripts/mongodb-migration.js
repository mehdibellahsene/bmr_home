#!/usr/bin/env node

/**
 * Simple MongoDB Migration Helper
 * 
 * This script helps migrate your portfolio data from JSON to MongoDB
 */

require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please update your .env.local file with your MongoDB connection string');
    return false;
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    await client.connect();
    console.log('✅ Successfully connected to MongoDB');
    
    const db = client.db('bmr-portfolio');
    await db.admin().ping();
    
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your MONGODB_URI format');
    console.log('2. Ensure your MongoDB cluster is running');
    console.log('3. Verify network connectivity');
    console.log('4. Check if IP address is whitelisted (for cloud databases)');
    return false;
  }
}

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  // Check if portfolio.json exists
  const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
  if (!fs.existsSync(dataPath)) {
    console.log('ℹ️  No portfolio.json found - nothing to migrate');
    return true;
  }

  let portfolioData;
  try {
    portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('📖 Loaded portfolio data from filesystem');
  } catch (error) {
    console.error('❌ Failed to read portfolio.json:', error.message);
    return false;
  }

  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB for migration');
    
    const db = client.db('bmr-portfolio');
    
    let totalMigrated = 0;
    
    // Migrate profile
    if (portfolioData.profile) {
      await db.collection('profiles').deleteMany({});
      await db.collection('profiles').insertOne({
        ...portfolioData.profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Migrated profile data');
      totalMigrated++;
    }
    
    // Migrate links
    if (portfolioData.links) {
      await db.collection('links').deleteMany({});
      
      const allLinks = [
        ...portfolioData.links.work.map(link => ({
          linkId: link.id,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: 'work',
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        ...portfolioData.links.presence.map(link => ({
          linkId: link.id,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: 'presence',
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      ];
      
      if (allLinks.length > 0) {
        await db.collection('links').insertMany(allLinks);
        console.log(`✅ Migrated ${allLinks.length} links`);
        totalMigrated += allLinks.length;
      }
    }
    
    // Migrate notes
    if (portfolioData.notes && portfolioData.notes.length > 0) {
      await db.collection('notes').deleteMany({});
      
      const notes = portfolioData.notes.map(note => ({
        noteId: note.id,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
      }));
      
      await db.collection('notes').insertMany(notes);
      console.log(`✅ Migrated ${notes.length} notes`);
      totalMigrated += notes.length;
    }
    
    // Migrate learning items
    if (portfolioData.learning && portfolioData.learning.length > 0) {
      await db.collection('learnings').deleteMany({});
      
      const learning = portfolioData.learning.map(item => ({
        learningId: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: new Date(),
      }));
      
      await db.collection('learnings').insertMany(learning);
      console.log(`✅ Migrated ${learning.length} learning items`);
      totalMigrated += learning.length;
    }
    
    await client.close();
    
    console.log(`🎉 Migration completed successfully! Total items migrated: ${totalMigrated}`);
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await client.close();
    return false;
  }
}

async function main() {
  console.log('🚀 BMR Portfolio MongoDB Migration Tool\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      await testConnection();
      break;
      
    case 'migrate':
      console.log('Starting migration process...\n');
      const connected = await testConnection();
      if (connected) {
        await migrateData();
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/mongodb-migration.js test     - Test MongoDB connection');
      console.log('  node scripts/mongodb-migration.js migrate  - Migrate data from filesystem to MongoDB');
      console.log('\nNote: This script will overwrite existing MongoDB data.');
      break;
  }
}

main().catch(console.error);
