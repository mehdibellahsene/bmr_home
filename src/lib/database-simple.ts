/**
 * Simplified MongoDB-Only Database Layer with JSON Fallback
 * 
 * Clean, simple, and reliable CRUD operations using MongoDB with
 * automatic fallback to JSON file storage when MongoDB is unavailable
 */

import mongoose from 'mongoose';
import { Profile, Link, Note, Learning } from './models';
import fs from 'fs';
import path from 'path';

// Types
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
 * Check if MongoDB is available
 */
async function isMongoDBAvailable(): Promise<boolean> {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) return false;
    
    if (mongoose.connection.readyState === 1) return true;
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get portfolio data from JSON file
 */
function getPortfolioFromJSON(): PortfolioData {
  const defaultData: PortfolioData = {
    profile: {
      name: "Portfolio Owner",
      title: "Full-stack developer",
      location: "Location",
      email: "email@example.com",
      skills: "JavaScript, TypeScript, React",
      interests: "Web development, Open source",
      homeImage: ""
    },
    links: { work: [], presence: [] },
    notes: [],
    learning: []
  };

  try {
    if (typeof window !== 'undefined') return defaultData;
    
    const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
    
    if (fs.existsSync(dataPath)) {
      const fileContents = fs.readFileSync(dataPath, 'utf8');
      const fileData = JSON.parse(fileContents);
      
      return {
        profile: fileData.profile || defaultData.profile,
        links: fileData.links || defaultData.links,
        notes: Array.isArray(fileData.notes) ? fileData.notes : [],
        learning: Array.isArray(fileData.learning) ? fileData.learning : [],
      };
    }
    
    return defaultData;
  } catch (error) {
    console.warn('Failed to read portfolio.json, using default data:', error);
    return defaultData;
  }
}

/**
 * Save portfolio data to JSON file
 */
function savePortfolioToJSON(data: PortfolioData): boolean {
  try {
    if (typeof window !== 'undefined') return false;
    
    const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save portfolio.json:', error);
    return false;
  }
}

/**
 * Simple MongoDB connection helper
 */
async function ensureConnection(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
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
}

/**
 * Retry wrapper with fallback
 */
async function withRetryAndFallback<T>(
  mongoOperation: () => Promise<T>, 
  jsonFallback: () => T,
  retries = 2
): Promise<T> {
  console.log('[DB] Attempting MongoDB operation...');
  
  const mongoAvailable = await isMongoDBAvailable();
  
  if (!mongoAvailable) {
    console.log('[DB] MongoDB not available, using JSON fallback');
    return jsonFallback();
  }
  
  let lastError: Error | unknown;
  
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`[DB] MongoDB attempt ${i + 1}/${retries + 1}`);
      await ensureConnection();
      const result = await mongoOperation();
      console.log('[DB] MongoDB operation successful');
      return result;
    } catch (error: unknown) {
      lastError = error;
      console.error(`[DB] MongoDB attempt ${i + 1} failed:`, error instanceof Error ? error.message : error);
      if (i < retries) {
        const delay = 1000 * (i + 1);
        console.log(`[DB] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.warn('[DB] MongoDB operation failed after retries, using JSON fallback:', lastError instanceof Error ? lastError.message : lastError);
  try {
    return jsonFallback();
  } catch (fallbackError) {
    console.error('[DB] JSON fallback also failed:', fallbackError);
    // Return sensible defaults instead of throwing
    throw new Error('Both MongoDB and JSON fallback failed');
  }
}

/**
 * Simple retry wrapper for MongoDB operations
 */
async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: Error | unknown;
  
  for (let i = 0; i <= retries; i++) {
    try {
      await ensureConnection();
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError;
}

// ==================== PROFILE OPERATIONS ====================

export async function getProfile(): Promise<ProfileData | null> {
  return withRetryAndFallback(
    async () => {
      const profile = await Profile.findOne().sort({ createdAt: -1 });
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
    },
    () => {
      const data = getPortfolioFromJSON();
      return {
        ...data.profile,
        homeImage: data.profile.homeImage || ''
      };
    }
  );
}

export async function createProfile(data: ProfileData): Promise<ProfileData> {
  return withRetry(async () => {
    const profile = new Profile({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await profile.save();
    
    return {
      name: profile.name,
      title: profile.title,
      location: profile.location,
      email: profile.email,
      skills: profile.skills,
      interests: profile.interests,
      homeImage: profile.homeImage,
    };
  });
}

export async function updateProfile(data: Partial<ProfileData>): Promise<ProfileData | null> {
  return withRetryAndFallback(
    async () => {
      const profile = await Profile.findOneAndUpdate(
        {},
        { ...data, updatedAt: new Date() },
        { new: true, sort: { createdAt: -1 } }
      );
      
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
    },
    () => {
      const portfolioData = getPortfolioFromJSON();
      const updatedProfile = { 
        ...portfolioData.profile, 
        ...data,
        homeImage: data.homeImage || portfolioData.profile.homeImage || ''
      };
      const updatedData = { ...portfolioData, profile: updatedProfile };
      savePortfolioToJSON(updatedData);
      return updatedProfile;
    }
  );
}

// ==================== LINK OPERATIONS ====================

export async function getLinks(): Promise<{ work: LinkData[]; presence: LinkData[] }> {
  return withRetry(async () => {
    const links = await Link.find().sort({ createdAt: 1 });
    
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

export async function createLink(data: LinkData): Promise<LinkData> {
  return withRetry(async () => {
    const link = new Link({
      linkId: data.id,
      name: data.name,
      url: data.url,
      icon: data.icon,
      category: data.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await link.save();
    
    return {
      id: link.linkId,
      name: link.name,
      url: link.url,
      icon: link.icon,
      category: link.category as 'work' | 'presence',
    };
  });
}

export async function deleteLink(id: string): Promise<boolean> {
  return withRetry(async () => {
    const result = await Link.deleteOne({ linkId: id });
    return result.deletedCount > 0;
  });
}

export async function upsertLinks(linksData: { work: LinkData[]; presence: LinkData[] }): Promise<{ work: LinkData[]; presence: LinkData[] }> {
  return withRetryAndFallback(
    async () => {
      // Clear existing links
      await Link.deleteMany({});
      
      // Create all links
      const allLinks = [
        ...linksData.work.map(link => ({
          linkId: link.id,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: 'work' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
        ...linksData.presence.map(link => ({
          linkId: link.id,
          name: link.name,
          url: link.url,
          icon: link.icon,
          category: 'presence' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      ];
      
      if (allLinks.length > 0) {
        await Link.insertMany(allLinks);
      }
      
      // Return the formatted data
      return {
        work: linksData.work,
        presence: linksData.presence,
      };
    },
    () => {
      const portfolioData = getPortfolioFromJSON();
      const updatedData = { ...portfolioData, links: linksData };
      savePortfolioToJSON(updatedData);
      return linksData;
    }
  );
}

// ==================== NOTE OPERATIONS ====================

export async function getNotes(): Promise<NoteData[]> {
  return withRetryAndFallback(
    async () => {
      const notes = await Note.find().sort({ createdAt: -1 });
      
      return notes.map(note => ({
        id: note.noteId,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt?.toISOString(),
        updatedAt: note.updatedAt?.toISOString(),
      }));
    },
    () => {
      const data = getPortfolioFromJSON();
      return data.notes || [];
    }
  );
}

export async function getNote(id: string): Promise<NoteData | null> {
  return withRetry(async () => {
    const note = await Note.findOne({ noteId: id });
    if (!note) return null;
    
    return {
      id: note.noteId,
      title: note.title,
      content: note.content,
      publishedAt: note.publishedAt,
      createdAt: note.createdAt?.toISOString(),
      updatedAt: note.updatedAt?.toISOString(),
    };
  });
}

export async function createNote(data: Omit<NoteData, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteData> {
  return withRetry(async () => {
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const note = new Note({
      noteId,
      title: data.title,
      content: data.content,
      publishedAt: data.publishedAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await note.save();
    
    return {
      id: note.noteId,
      title: note.title,
      content: note.content,
      publishedAt: note.publishedAt,
      createdAt: note.createdAt?.toISOString(),
      updatedAt: note.updatedAt?.toISOString(),
    };
  });
}

export async function updateNote(id: string, data: Partial<Omit<NoteData, 'id'>>): Promise<NoteData | null> {
  return withRetry(async () => {
    const note = await Note.findOneAndUpdate(
      { noteId: id },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    
    if (!note) return null;
    
    return {
      id: note.noteId,
      title: note.title,
      content: note.content,
      publishedAt: note.publishedAt,
      createdAt: note.createdAt?.toISOString(),
      updatedAt: note.updatedAt?.toISOString(),
    };
  });
}

export async function deleteNote(id: string): Promise<boolean> {
  return withRetry(async () => {
    const result = await Note.deleteOne({ noteId: id });
    return result.deletedCount > 0;
  });
}

// ==================== LEARNING OPERATIONS ====================

export async function getLearning(): Promise<LearningData[]> {
  return withRetryAndFallback(
    async () => {
      const learning = await Learning.find().sort({ createdAt: -1 });
      
      return learning.map(item => ({
        id: item.learningId,
        title: item.title,
        description: item.description,
        type: item.type,
        date: item.date,
        createdAt: item.createdAt?.toISOString(),
      }));
    },
    () => {
      const data = getPortfolioFromJSON();
      return data.learning || [];
    }
  );
}

export async function getLearningItem(id: string): Promise<LearningData | null> {
  return withRetry(async () => {
    const item = await Learning.findOne({ learningId: id });
    if (!item) return null;
    
    return {
      id: item.learningId,
      title: item.title,
      description: item.description,
      type: item.type,
      date: item.date,
      createdAt: item.createdAt?.toISOString(),
    };
  });
}

export async function createLearning(data: Omit<LearningData, 'id' | 'createdAt'>): Promise<LearningData> {
  return withRetry(async () => {
    const learningId = `learning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const item = new Learning({
      learningId,
      title: data.title,
      description: data.description,
      type: data.type,
      date: data.date,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await item.save();
    
    return {
      id: item.learningId,
      title: item.title,
      description: item.description,
      type: item.type,
      date: item.date,
      createdAt: item.createdAt?.toISOString(),
    };
  });
}

export async function updateLearning(id: string, data: Partial<Omit<LearningData, 'id'>>): Promise<LearningData | null> {
  return withRetry(async () => {
    const item = await Learning.findOneAndUpdate(
      { learningId: id },
      { ...data, updatedAt: new Date() },
      { new: true }
    );
    
    if (!item) return null;
    
    return {
      id: item.learningId,
      title: item.title,
      description: item.description,
      type: item.type,
      date: item.date,
      createdAt: item.createdAt?.toISOString(),
    };
  });
}

export async function deleteLearning(id: string): Promise<boolean> {
  return withRetry(async () => {
    const result = await Learning.deleteOne({ learningId: id });
    return result.deletedCount > 0;
  });
}

// ==================== PORTFOLIO DATA ====================

export async function getPortfolioData(): Promise<PortfolioData> {
  return withRetryAndFallback(
    async () => {
      const [profile, links, notes, learning] = await Promise.all([
        getProfile(),
        getLinks(),
        getNotes(),
        getLearning(),
      ]);
      
      // Provide default profile if none exists
      const defaultProfile: ProfileData = {
        name: 'BMR Portfolio',
        title: 'Full Stack Developer',
        location: 'Remote',
        email: 'contact@example.com',
        skills: 'JavaScript, TypeScript, React, Node.js',
        interests: 'Web Development, AI, Open Source',
      };
      
      return {
        profile: profile || defaultProfile,
        links,
        notes,
        learning,
      };
    },
    () => getPortfolioFromJSON()
  );
}

// ==================== CONNECTION HEALTH ====================

export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string; fallbackMode?: boolean }> {
  try {
    const mongoAvailable = await isMongoDBAvailable();
    if (mongoAvailable) {
      await mongoose.connection.db?.admin().ping();
      return { connected: true };
    } else {
      return { 
        connected: false, 
        fallbackMode: true,
        error: 'MongoDB not available, using JSON file fallback' 
      };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      connected: false, 
      fallbackMode: true,
      error: errorMessage 
    };
  }
}

export async function getDatabaseStats(): Promise<{
  profiles: number;
  links: number;
  notes: number;
  learning: number;
}> {
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
