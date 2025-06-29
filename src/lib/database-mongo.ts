/**
 * MongoDB-Only Database Layer with Resilient CRUD Operations
 * 
 * This database layer exclusively uses MongoDB with proper error handling,
 * connection management, and atomic operations.
 */

import { connectToMongoDB } from './mongodb';
import { Profile, Link, Note, Learning } from './models';
import mongoose from 'mongoose';

// Types for the API layer
export interface ProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  skills: string;
  interests: string;
  homeImage?: string;
}

export interface LinkData {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: 'work' | 'presence';
}

export interface NoteData {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningData {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt?: string;
}

export interface PortfolioData {
  profile: ProfileData;
  links: {
    work: LinkData[];
    presence: LinkData[];
  };
  notes: NoteData[];
  learning: LearningData[];
}

/**
 * Retry wrapper for database operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Operation failed after all retries');
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Database operation failed (attempt ${i + 1}/${retries}):`, error);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Resilient MongoDB Database Operations
 */
export class MongoDatabase {
  private static instance: MongoDatabase;

  private constructor() {}

  static getInstance(): MongoDatabase {
    if (!MongoDatabase.instance) {
      MongoDatabase.instance = new MongoDatabase();
    }
    return MongoDatabase.instance;
  }

  /**
   * Ensure MongoDB connection with retry logic
   */
  private async ensureConnection(): Promise<void> {
    return withRetry(async () => {
      await connectToMongoDB();
      
      // Additional check to ensure connection is ready
      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection not ready');
      }
    }, 3, 1000);
  }

  // ==================== PROFILE OPERATIONS ====================

  async getProfile(): Promise<ProfileData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const profile = await Profile.findOne().sort({ createdAt: -1 }).exec();
      if (!profile) return null;
      
      return {
        name: profile.name,
        title: profile.title,
        location: profile.location,
        email: profile.email,
        skills: profile.skills,
        interests: profile.interests,
        homeImage: profile.homeImage || '',
      };
    });
  }

  async upsertProfile(profileData: ProfileData): Promise<ProfileData> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const result = await Profile.findOneAndUpdate(
        {}, // Match any profile (assuming single profile)
        {
          ...profileData,
          updatedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      ).exec();
      
      return {
        name: result.name,
        title: result.title,
        location: result.location,
        email: result.email,
        skills: result.skills,
        interests: result.interests,
        homeImage: result.homeImage || '',
      };
    });
  }

  // ==================== LINK OPERATIONS ====================

  async getLinks(): Promise<{ work: LinkData[]; presence: LinkData[] }> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const links = await Link.find().sort({ createdAt: 1 }).exec();
      
      const work = links
        .filter(link => link.category === 'work')
        .map(link => ({
          id: link.linkId,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: link.category as 'work',
        }));
      
      const presence = links
        .filter(link => link.category === 'presence')
        .map(link => ({
          id: link.linkId,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: link.category as 'presence',
        }));
      
      return { work, presence };
    });
  }

  async createLink(linkData: LinkData): Promise<LinkData> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const newLink = new Link({
        linkId: linkData.id,
        name: linkData.name,
        url: linkData.url,
        icon: linkData.icon,
        category: linkData.category,
      });
      
      const saved = await newLink.save();
      
      return {
        id: saved.linkId,
        name: saved.name,
        url: saved.url,
        icon: saved.icon,
        category: saved.category as 'work' | 'presence',
      };
    });
  }

  async updateLink(id: string, linkData: Partial<LinkData>): Promise<LinkData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const updated = await Link.findOneAndUpdate(
        { linkId: id },
        {
          ...(linkData.name && { name: linkData.name }),
          ...(linkData.url && { url: linkData.url }),
          ...(linkData.icon && { icon: linkData.icon }),
          ...(linkData.category && { category: linkData.category }),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).exec();
      
      if (!updated) return null;
      
      return {
        id: updated.linkId,
        name: updated.name,
        url: updated.url,
        icon: updated.icon,
        category: updated.category as 'work' | 'presence',
      };
    });
  }

  async deleteLink(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const result = await Link.findOneAndDelete({ linkId: id });
      return !!result;
    });
  }

  // ==================== NOTE OPERATIONS ====================

  async getNotes(): Promise<NoteData[]> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const notes = await Note.find().sort({ createdAt: -1 }).exec();
      
      return notes.map(note => ({
        id: note.noteId,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      }));
    });
  }

  async getNote(id: string): Promise<NoteData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const note = await Note.findOne({ noteId: id }).exec();
      if (!note) return null;
      
      return {
        id: note.noteId,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      };
    });
  }

  async createNote(noteData: Omit<NoteData, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteData> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const noteId = Date.now().toString();
      const newNote = new Note({
        noteId,
        title: noteData.title,
        content: noteData.content,
        publishedAt: noteData.publishedAt,
      });
      
      const saved = await newNote.save();
      
      return {
        id: saved.noteId,
        title: saved.title,
        content: saved.content,
        publishedAt: saved.publishedAt,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      };
    });
  }

  async updateNote(id: string, noteData: Partial<NoteData>): Promise<NoteData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const updated = await Note.findOneAndUpdate(
        { noteId: id },
        {
          ...(noteData.title && { title: noteData.title }),
          ...(noteData.content && { content: noteData.content }),
          ...(noteData.publishedAt && { publishedAt: noteData.publishedAt }),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).exec();
      
      if (!updated) return null;
      
      return {
        id: updated.noteId,
        title: updated.title,
        content: updated.content,
        publishedAt: updated.publishedAt,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    });
  }

  async deleteNote(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const result = await Note.findOneAndDelete({ noteId: id });
      return !!result;
    });
  }

  // ==================== LEARNING OPERATIONS ====================

  async getLearning(): Promise<LearningData[]> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const learning = await Learning.find().sort({ createdAt: -1 }).exec();
      
      return learning.map(item => ({
        id: item.learningId,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date,
        createdAt: item.createdAt.toISOString(),
      }));
    });
  }

  async getLearningItem(id: string): Promise<LearningData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const item = await Learning.findOne({ learningId: id }).exec();
      if (!item) return null;
      
      return {
        id: item.learningId,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date,
        createdAt: item.createdAt.toISOString(),
      };
    });
  }

  async createLearning(learningData: Omit<LearningData, 'id' | 'createdAt'>): Promise<LearningData> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const learningId = Date.now().toString();
      const newLearning = new Learning({
        learningId,
        title: learningData.title,
        description: learningData.description,
        type: learningData.type,
        date: learningData.date,
      });
      
      const saved = await newLearning.save();
      
      return {
        id: saved.learningId,
        title: saved.title,
        description: saved.description,
        type: saved.type,
        date: saved.date,
        createdAt: saved.createdAt.toISOString(),
      };
    });
  }

  async updateLearning(id: string, learningData: Partial<LearningData>): Promise<LearningData | null> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const updated = await Learning.findOneAndUpdate(
        { learningId: id },
        {
          ...(learningData.title && { title: learningData.title }),
          ...(learningData.description && { description: learningData.description }),
          ...(learningData.type && { type: learningData.type }),
          ...(learningData.date && { date: learningData.date }),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).exec();
      
      if (!updated) return null;
      
      return {
        id: updated.learningId,
        title: updated.title,
        description: updated.description,
        type: updated.type,
        date: updated.date,
        createdAt: updated.createdAt.toISOString(),
      };
    });
  }

  async deleteLearning(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const result = await Learning.findOneAndDelete({ learningId: id });
      return !!result;
    });
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Get all portfolio data (for compatibility with existing code)
   */
  async getPortfolioData(): Promise<PortfolioData> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const [profile, links, notes, learning] = await Promise.all([
        this.getProfile(),
        this.getLinks(),
        this.getNotes(),
        this.getLearning(),
      ]);
      
      return {
        profile: profile || {
          name: '',
          title: '',
          location: '',
          email: '',
          skills: '',
          interests: '',
          homeImage: '',
        },
        links,
        notes,
        learning,
      };
    });
  }

  /**
   * Health check - verify MongoDB connection and basic operations
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: string }> {
    try {
      await this.ensureConnection();
      
      // Test basic operations
      await Profile.countDocuments();
      await Link.countDocuments();
      await Note.countDocuments();
      await Learning.countDocuments();
      
      return {
        status: 'healthy',
        details: 'MongoDB connection and operations working correctly',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `MongoDB error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    profiles: number;
    links: number;
    notes: number;
    learning: number;
  }> {
    await this.ensureConnection();
    
    return withRetry(async () => {
      const [profiles, links, notes, learning] = await Promise.all([
        Profile.countDocuments(),
        Link.countDocuments(),
        Note.countDocuments(),
        Learning.countDocuments(),
      ]);
      
      return { profiles, links, notes, learning };
    });
  }
}

// Export singleton instance
export const mongoDb = MongoDatabase.getInstance();
