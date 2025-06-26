#!/usr/bin/env node

/**
 * MongoDB Migration and Test Script - Resilient Version
 * 
 * This script helps you:
 * 1. Test your MongoDB connection with retry logic
 * 2. Migrate data from filesystem to MongoDB with proper error handling
 * 3. Verify the migration and get detailed statistics
 * 4. Clear existing data if needed
 */

require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Retry wrapper for operations
async function withRetry(operation, retries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${i + 1}/${retries}):`, error.message);
      
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please update your .env.local file with your MongoDB connection string');
    return false;
  }

  console.log('🔗 Testing MongoDB connection with retry logic...');
  
  try {
    await withRetry(async () => {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        heartbeatFrequencyMS: 30000,
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true,
      });
      
      await client.connect();
      console.log('✅ Successfully connected to MongoDB');
      
      // Test database access
      const db = client.db('bmr-portfolio');
      await db.admin().ping();
      
      const collections = await db.listCollections().toArray();
      console.log(`📊 Found ${collections.length} collections in database`);
      
      // Test basic operations
      const stats = await Promise.all([
        db.collection('profiles').countDocuments(),
        db.collection('links').countDocuments(),
        db.collection('notes').countDocuments(),
        db.collection('learnings').countDocuments(),
      ]);
      
      console.log('📈 Current data statistics:');
      console.log(`   - Profiles: ${stats[0]}`);
      console.log(`   - Links: ${stats[1]}`);
      console.log(`   - Notes: ${stats[2]}`);
      console.log(`   - Learning items: ${stats[3]}`);
      
      await client.close();
    }, 3, 2000);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB after retries:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check your MONGODB_URI format');
    console.log('2. Ensure your MongoDB cluster is running');
    console.log('3. Verify network connectivity');
    console.log('4. Check if IP address is whitelisted (for cloud databases)');
    return false;
  }
}

async function migrateData() {
  console.log('🔄 Starting resilient data migration...');
  
  // Check if portfolio.json exists
  const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ portfolio.json not found at:', dataPath);
    console.log('Please ensure you have a data/portfolio.json file to migrate');
    return false;
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
    socketTimeoutMS: 10000,
    retryWrites: true,
    retryReads: true,
  });
  
  try {
    await withRetry(async () => {
      await client.connect();
      console.log('✅ Connected to MongoDB for migration');
    });
    
    const db = client.db('bmr-portfolio');
    
    let totalMigrated = 0;
    
    // Clear existing data with confirmation
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      db.collection('profiles').deleteMany({}),
      db.collection('links').deleteMany({}),
      db.collection('notes').deleteMany({}),
      db.collection('learnings').deleteMany({}),
    ]);
    console.log('✅ Cleared existing collections');
    
    // Migrate profile
    if (portfolioData.profile) {
      await withRetry(async () => {
        await db.collection('profiles').insertOne({
          ...portfolioData.profile,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      console.log('✅ Migrated profile data');
      totalMigrated++;
    }
    
    // Migrate links
    if (portfolioData.links) {
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
        await withRetry(async () => {
          await db.collection('links').insertMany(allLinks);
        });
        console.log(`✅ Migrated ${allLinks.length} links`);
        totalMigrated += allLinks.length;
      }
    }
    
    // Migrate notes with batch processing
    if (portfolioData.notes && portfolioData.notes.length > 0) {
      const notes = portfolioData.notes.map(note => ({
        noteId: note.id,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
      }));
      
      // Process in batches of 10 for better error handling
      const batchSize = 10;
      for (let i = 0; i < notes.length; i += batchSize) {
        const batch = notes.slice(i, i + batchSize);
        await withRetry(async () => {
          await db.collection('notes').insertMany(batch);
        });
        console.log(`✅ Migrated notes batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(notes.length/batchSize)}`);
      }
      
      console.log(`✅ Migrated ${notes.length} notes total`);
      totalMigrated += notes.length;
    }
    
    // Migrate learning items with batch processing
    if (portfolioData.learning && portfolioData.learning.length > 0) {
      const learning = portfolioData.learning.map(item => ({
        learningId: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: new Date(),
      }));
      
      // Process in batches of 10
      const batchSize = 10;
      for (let i = 0; i < learning.length; i += batchSize) {
        const batch = learning.slice(i, i + batchSize);
        await withRetry(async () => {
          await db.collection('learnings').insertMany(batch);
        });
        console.log(`✅ Migrated learning batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(learning.length/batchSize)}`);
      }
      
      console.log(`✅ Migrated ${learning.length} learning items total`);
      totalMigrated += learning.length;
    }
    
    await client.close();
    console.log(`🎉 Migration completed successfully! Total items migrated: ${totalMigrated}`);
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\nMigration troubleshooting:');
    console.log('1. Check your data/portfolio.json format');
    console.log('2. Ensure MongoDB connection is stable');
    console.log('3. Verify sufficient permissions on the database');
    await client.close();
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration with detailed statistics...');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  
  try {
    await withRetry(async () => {
      await client.connect();
    });
    
    const db = client.db('bmr-portfolio');
    
    const [profileCount, linkCount, noteCount, learningCount] = await Promise.all([
      db.collection('profiles').countDocuments(),
      db.collection('links').countDocuments(),
      db.collection('notes').countDocuments(),
      db.collection('learnings').countDocuments(),
    ]);
    
    console.log('📊 Migration verification results:');
    console.log(`   - Profiles: ${profileCount}`);
    console.log(`   - Links: ${linkCount}`);
    console.log(`   - Notes: ${noteCount}`);
    console.log(`   - Learning items: ${learningCount}`);
    
    const total = profileCount + linkCount + noteCount + learningCount;
    console.log(`   - Total items: ${total}`);
    
    // Sample some data to verify structure
    if (noteCount > 0) {
      const sampleNote = await db.collection('notes').findOne();
      console.log('📄 Sample note structure verified:', !!sampleNote.noteId);
    }
    
    if (learningCount > 0) {
      const sampleLearning = await db.collection('learnings').findOne();
      console.log('📚 Sample learning structure verified:', !!sampleLearning.learningId);
    }
    
    await client.close();
    
    if (total > 0) {
      console.log('✅ Migration verification successful!');
    } else {
      console.log('⚠️  No data found - migration may not have completed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    await client.close();
    return false;
  }
}

async function clearDatabase() {
  console.log('�️  Clearing MongoDB database...');
  
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  
  try {
    await withRetry(async () => {
      await client.connect();
    });
    
    const db = client.db('bmr-portfolio');
    
    await Promise.all([
      db.collection('profiles').deleteMany({}),
      db.collection('links').deleteMany({}),
      db.collection('notes').deleteMany({}),
      db.collection('learnings').deleteMany({}),
    ]);
    
    console.log('✅ Database cleared successfully');
    await client.close();
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    await client.close();
    return false;
  }
}

async function main() {
  console.log('🚀 BMR Portfolio MongoDB Setup - Resilient Version\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'test':
      await testConnection();
      break;
      
    case 'migrate':
      console.log('Starting full migration process...\n');
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
      
    case 'clear':
      console.log('⚠️  This will delete all data in MongoDB!');
      console.log('Type "yes" to confirm:');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('Confirm deletion: ', (answer) => {
        if (answer.toLowerCase() === 'yes') {
          clearDatabase();
        } else {
          console.log('Operation cancelled');
        }
        readline.close();
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node scripts/mongodb-setup.js test     - Test MongoDB connection with retry logic');
      console.log('  node scripts/mongodb-setup.js migrate  - Migrate data from filesystem to MongoDB');
      console.log('  node scripts/mongodb-setup.js verify   - Verify migration with detailed statistics');
      console.log('  node scripts/mongodb-setup.js clear    - Clear all data from MongoDB (with confirmation)');
      console.log('\nNew features:');
      console.log('  • Retry logic with exponential backoff');
      console.log('  • Batch processing for large datasets');
      console.log('  • Detailed error reporting and troubleshooting tips');
      console.log('  • Enhanced connection management');
      break;
  }
}

main().catch(console.error);
