#!/usr/bin/env node

/**
 * Simple MongoDB Connection Test
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    return;
  }

  console.log('🔗 Testing MongoDB Atlas connection...');
  console.log('URI (masked):', uri.replace(/:[^:@]*@/, ':***@'));

  try {
    // Test connection with the same settings as the app
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      bufferCommands: true,
    });

    console.log('✅ Connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Test a simple operation
    const db = mongoose.connection.db;
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP Whitelist Issue Detected:');
      console.log('1. Go to MongoDB Atlas dashboard');
      console.log('2. Navigate to Network Access');
      console.log('3. Add your current IP address');
      console.log('4. Or add 0.0.0.0/0 for development (less secure)');
    }
  }
}

testConnection();
