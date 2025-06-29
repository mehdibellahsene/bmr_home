import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection singleton with improved resilience
class MongoConnection {
  private static instance: MongoConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(): Promise<Db> {
    if (this.db && this.client) {
      try {
        // Test if connection is still alive
        await this.db.admin().ping();
        return this.db;
      } catch (error) {
        console.warn('MongoDB connection lost, reconnecting...', error);
        this.db = null;
        this.client = null;
      }
    }

    // Prevent multiple concurrent connection attempts
    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.db) return this.db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    this.isConnecting = true;
    
    try {
      this.client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000, // 10 second timeout
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true,
      });
      
      await this.client.connect();
      this.db = this.client.db('bmr-portfolio');
      
      // Set up event listeners for connection management
      this.client.on('close', () => {
        console.log('MongoDB connection closed');
        this.db = null;
        this.client = null;
      });

      this.client.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        this.db = null;
        this.client = null;
      });

      console.log('Connected to MongoDB');
      return this.db;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      this.db = null;
      this.client = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }
}

// Mongoose connection with improved resilience
let isConnected = false;
let isConnecting = false;

export async function connectToMongoDB(): Promise<void> {
  if (isConnected) {
    try {
      // Test if connection is still alive
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      return;
    } catch (error) {
      console.warn('Mongoose connection lost, reconnecting...', error);
      isConnected = false;
    }
  }

  // Prevent multiple concurrent connection attempts
  if (isConnecting) {
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (isConnected) return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  isConnecting = true;
  
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      heartbeatFrequencyMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
      bufferCommands: true, // Enable mongoose buffering for better reliability
    });

    // Set up event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      console.error('Mongoose connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('Mongoose reconnected');
      isConnected = true;
    });

    isConnected = true;
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB with Mongoose:', error);
    isConnected = false;
    throw error;
  } finally {
    isConnecting = false;
  }
}

export { MongoConnection };
