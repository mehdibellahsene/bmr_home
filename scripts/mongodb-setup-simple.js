#!/usr/bin/env node

/**
 * Simplified MongoDB Migration Script
 * 
 * This script helps you:
 * 1. Test your MongoDB connection
 * 2. Migrate data from filesystem to MongoDB
 * 3. Verify the migration
 * 4. Clear existing data if needed
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const { Profile, Link, Note, Learning } = require('./models.js');

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
}

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  
  try {
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database access
    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Get current stats
    const [profiles, links, notes, learning] = await Promise.all([
      Profile.countDocuments(),
      Link.countDocuments(),
      Note.countDocuments(),
      Learning.countDocuments(),
    ]);
    
    console.log('📊 Current database statistics:');
    console.log(`   - Profiles: ${profiles}`);
    console.log(`   - Links: ${links}`);
    console.log(`   - Notes: ${notes}`);
    console.log(`   - Learning items: ${learning}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP Whitelist Issue:');
      console.log('1. Go to MongoDB Atlas dashboard');
      console.log('2. Navigate to Network Access');
      console.log('3. Add your current IP address');
      console.log('4. Or add 0.0.0.0/0 for development');
    }
    
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

  let portfolioData;
  try {
    portfolioData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('📖 Loaded portfolio data from filesystem');
  } catch (error) {
    console.error('❌ Failed to read portfolio.json:', error.message);
    return false;
  }

  try {
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB for migration');
    
    let totalMigrated = 0;
    
    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      Profile.deleteMany({}),
      Link.deleteMany({}),
      Note.deleteMany({}),
      Learning.deleteMany({}),
    ]);
    console.log('✅ Cleared existing collections');
    
    // Migrate profile
    if (portfolioData.profile) {
      const profile = new Profile({
        ...portfolioData.profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await profile.save();
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
        await Link.insertMany(allLinks);
        console.log(`✅ Migrated ${allLinks.length} links`);
        totalMigrated += allLinks.length;
      }
    }
    
    // Migrate notes
    if (portfolioData.notes && portfolioData.notes.length > 0) {
      const notes = portfolioData.notes.map(note => ({
        noteId: note.id,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
      }));
      
      await Note.insertMany(notes);
      console.log(`✅ Migrated ${notes.length} notes`);
      totalMigrated += notes.length;
    }
    
    // Migrate learning items
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
      
      await Learning.insertMany(learning);
      console.log(`✅ Migrated ${learning.length} learning items`);
      totalMigrated += learning.length;
    }
    
    await mongoose.disconnect();
    console.log(`🎉 Migration completed! Total items migrated: ${totalMigrated}`);
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await mongoose.disconnect();
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    await connectToMongoDB();
    
    const [profileCount, linkCount, noteCount, learningCount] = await Promise.all([
      Profile.countDocuments(),
      Link.countDocuments(),
      Note.countDocuments(),
      Learning.countDocuments(),
    ]);
    
    console.log('📊 Migration verification results:');
    console.log(`   - Profiles: ${profileCount}`);
    console.log(`   - Links: ${linkCount}`);
    console.log(`   - Notes: ${noteCount}`);
    console.log(`   - Learning items: ${learningCount}`);
    
    const total = profileCount + linkCount + noteCount + learningCount;
    console.log(`   - Total items: ${total}`);
    
    if (total > 0) {
      console.log('✅ Migration verification successful!');
    } else {
      console.log('⚠️ No data found - migration may not have completed');
    }
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    await mongoose.disconnect();
    return false;
  }
}

async function clearDatabase() {
  console.log('🗑️ Clearing MongoDB database...');
  
  try {
    await connectToMongoDB();
    
    await Promise.all([
      Profile.deleteMany({}),
      Link.deleteMany({}),
      Note.deleteMany({}),
      Learning.deleteMany({}),
    ]);
    
    console.log('✅ Database cleared successfully');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    await mongoose.disconnect();
    return false;
  }
}

async function main() {
  console.log('🚀 BMR Portfolio MongoDB Setup - Simplified Version\n');
  
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
      console.log('⚠️ This will delete all data in MongoDB!');
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
      console.log('  node scripts/mongodb-setup.js test     - Test MongoDB connection');
      console.log('  node scripts/mongodb-setup.js migrate  - Migrate data from filesystem to MongoDB');
      console.log('  node scripts/mongodb-setup.js verify   - Verify migration results');
      console.log('  node scripts/mongodb-setup.js clear    - Clear all data from MongoDB');
      break;
  }
}

main().catch(console.error);
