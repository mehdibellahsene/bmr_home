import { MongoClient, Db } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection singleton
class MongoConnection {
  private static instance: MongoConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('bmr-portfolio');
      console.log('Connected to MongoDB');
      return this.db;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
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

// Mongoose connection
let isConnected = false;

export async function connectToMongoDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Failed to connect to MongoDB with Mongoose:', error);
    throw error;
  }
}

export { MongoConnection };
