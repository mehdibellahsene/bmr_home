// MongoDB-enabled database interface for portfolio data
import { connectToMongoDB } from './mongodb';
import { Profile, Link, Note, Learning } from './models';

export interface PortfolioData {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    skills: string;
    interests: string;
    homeImage?: string;
  };
  links: {
    work: Array<{
      id: string;
      name: string;
      url: string;
      icon: string;
    }>;
    presence: Array<{
      id: string;
      name: string;
      url: string;
      icon: string;
    }>;
  };
  notes: Array<{
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
  }>;
  learning: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    date: string;
    createdAt: string;
  }>;
}

// Static data fallback for serverless environments or when MongoDB is unavailable
const STATIC_PORTFOLIO_DATA = {
  "profile": {
    "name": "Bellahsene Mehdi",
    "title": "Full-stack developer specializing in the modern JavaScript stack, with startup and open-source experience. Very eager to learn, strongly communicative, self-driven to solve and create.",
    "location": "Biarritz - Bordeaux, France ",
    "email": "mehdiredha6@gmail.com",
    "skills": "TypeScript, Node.js, React.js, SQL, Electron",
    "interests": "Type systems, compilers, codegen, OpenAPI",
    "homeImage": ""
  },
  "links": {
    "work": [
      {
        "id": "1",
        "name": "Your Company",
        "url": "https://www.office64.fr/",
        "icon": "🔗"
      },
      {
        "id": "2",
        "name": "Your Project",
        "url": "https://your-project.com",
        "icon": "📊"
      }
    ],
    "presence": [
      {
        "id": "3",
        "name": "GitHub",
        "url": "https://github.com/yourusername",
        "icon": "🐙"
      },
      {
        "id": "4",
        "name": "LinkedIn",
        "url": "https://linkedin.com/in/yourprofile",
        "icon": "💼"
      }
    ]
  },
  "notes": [
    {
      "id": "1750770907839",
      "title": "Hi ",
      "content": "Hello world\n",
      "publishedAt": "2025-06-24",
      "createdAt": "2025-06-24T13:15:07.839Z",
      "updatedAt": "2025-06-24T13:15:07.839Z"
    }
  ],
  "learning": [
    {
      "id": "1750770941985",
      "title": "ALGO STATIQUE ",
      "description": "ALSD",
      "type": "course",
      "date": "2025-06-24",
      "createdAt": "2025-06-24T13:15:41.985Z"
    }
  ]
};

export class PortfolioDatabase {
  private static instance: PortfolioDatabase;
  private data: PortfolioData | null = null;
  private useFilesystem = false;

  private constructor() {
    // Check if we should use MongoDB or filesystem
    this.useFilesystem = this.isServerless() || !process.env.MONGODB_URI;
  }

  static getInstance(): PortfolioDatabase {
    if (!PortfolioDatabase.instance) {
      PortfolioDatabase.instance = new PortfolioDatabase();
    }
    return PortfolioDatabase.instance;
  }

  private async getDataFromMongoDB(): Promise<PortfolioData> {
    try {
      await connectToMongoDB();

      // Get profile data
      const profileDoc = await Profile.findOne().sort({ createdAt: -1 });
      const profile = profileDoc ? {
        name: profileDoc.name,
        title: profileDoc.title,
        location: profileDoc.location,
        email: profileDoc.email,
        skills: profileDoc.skills,
        interests: profileDoc.interests,
        homeImage: profileDoc.homeImage || ""
      } : STATIC_PORTFOLIO_DATA.profile;

      // Get links data
      const linkDocs = await Link.find();
      const workLinks = linkDocs
        .filter(link => link.category === 'work')
        .map(link => ({
          id: link.linkId,
          name: link.name,
          url: link.url,
          icon: link.icon
        }));
      
      const presenceLinks = linkDocs
        .filter(link => link.category === 'presence')
        .map(link => ({
          id: link.linkId,
          name: link.name,
          url: link.url,
          icon: link.icon
        }));

      const links = {
        work: workLinks.length > 0 ? workLinks : STATIC_PORTFOLIO_DATA.links.work,
        presence: presenceLinks.length > 0 ? presenceLinks : STATIC_PORTFOLIO_DATA.links.presence
      };

      // Get notes data
      const noteDocs = await Note.find().sort({ createdAt: -1 });
      const notes = noteDocs.length > 0 ? noteDocs.map(note => ({
        id: note.noteId,
        title: note.title,
        content: note.content,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
      })) : STATIC_PORTFOLIO_DATA.notes;

      // Get learning data
      const learningDocs = await Learning.find().sort({ createdAt: -1 });
      const learning = learningDocs.length > 0 ? learningDocs.map(learn => ({
        id: learn.learningId,
        title: learn.title,
        description: learn.description,
        type: learn.type,
        date: learn.date,
        createdAt: learn.createdAt.toISOString()
      })) : STATIC_PORTFOLIO_DATA.learning;

      return {
        profile,
        links,
        notes,
        learning
      };
    } catch (error) {
      console.error('Error fetching data from MongoDB:', error);
      // Fallback to static data
      return STATIC_PORTFOLIO_DATA as PortfolioData;
    }
  }

  private async getDataFromFileSystem(): Promise<PortfolioData> {
    const defaultData: PortfolioData = {
      profile: STATIC_PORTFOLIO_DATA.profile,
      links: STATIC_PORTFOLIO_DATA.links,
      notes: [],
      learning: []
    };

    if (typeof window !== 'undefined') {
      return defaultData;
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
      
      if (fs.existsSync(dataPath)) {
        const fileContents = fs.readFileSync(dataPath, 'utf8');
        const fileData = JSON.parse(fileContents);
        
        return {
          profile: fileData.profile || STATIC_PORTFOLIO_DATA.profile,
          links: fileData.links || STATIC_PORTFOLIO_DATA.links,
          notes: Array.isArray(fileData.notes) ? fileData.notes : [],
          learning: Array.isArray(fileData.learning) ? fileData.learning : [],
        };
      }
    } catch (error) {
      console.error('Error reading portfolio.json:', error);
    }

    return defaultData;
  }

  async getData(): Promise<PortfolioData> {
    if (this.data) {
      return this.data;
    }

    if (this.useFilesystem) {
      this.data = await this.getDataFromFileSystem();
    } else {
      this.data = await this.getDataFromMongoDB();
    }

    return this.data;
  }

  async updateData(newData: Partial<PortfolioData>): Promise<boolean> {
    if (this.useFilesystem) {
      return this.updateFileSystemData(newData);
    } else {
      return this.updateMongoDBData(newData);
    }
  }

  private async updateMongoDBData(newData: Partial<PortfolioData>): Promise<boolean> {
    try {
      await connectToMongoDB();

      // Update profile
      if (newData.profile) {
        await Profile.findOneAndUpdate(
          {},
          newData.profile,
          { upsert: true, new: true }
        );
      }

      // Update links
      if (newData.links) {
        // Clear existing links and add new ones
        await Link.deleteMany({});
        
        const allLinks = [
          ...newData.links.work.map(link => ({
            linkId: link.id,
            name: link.name,
            url: link.url,
            icon: link.icon,
            category: 'work' as const
          })),
          ...newData.links.presence.map(link => ({
            linkId: link.id,
            name: link.name,
            url: link.url,
            icon: link.icon,
            category: 'presence' as const
          }))
        ];

        if (allLinks.length > 0) {
          await Link.insertMany(allLinks);
        }
      }

      // Update notes
      if (newData.notes) {
        await Note.deleteMany({});
        if (newData.notes.length > 0) {
          const noteData = newData.notes.map(note => ({
            noteId: note.id,
            title: note.title,
            content: note.content,
            publishedAt: note.publishedAt
          }));
          await Note.insertMany(noteData);
        }
      }

      // Update learning
      if (newData.learning) {
        await Learning.deleteMany({});
        if (newData.learning.length > 0) {
          const learningData = newData.learning.map(learn => ({
            learningId: learn.id,
            title: learn.title,
            description: learn.description,
            type: learn.type,
            date: learn.date
          }));
          await Learning.insertMany(learningData);
        }
      }

      // Clear cache to ensure fresh data
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Error updating MongoDB data:', error);
      return false;
    }
  }

  private async updateFileSystemData(newData: Partial<PortfolioData>): Promise<boolean> {
    const currentData = await this.getData();
    
    // Merge the data
    this.data = {
      ...currentData,
      ...newData
    };

    // Try to persist to file system (works locally)
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
        
        // Ensure data directory exists
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2));
        return true;
      } catch {
        // In serverless environments or when filesystem is unavailable
        return false;
      }
    }

    return false;
  }

  // Method to migrate data from filesystem to MongoDB
  async migrateToMongoDB(): Promise<boolean> {
    try {
      // Get data from filesystem
      this.useFilesystem = true;
      const fileData = await this.getDataFromFileSystem();
      
      // Switch to MongoDB mode
      this.useFilesystem = false;
      
      // Save data to MongoDB
      const success = await this.updateMongoDBData(fileData);
      
      if (success) {
        console.log('Successfully migrated data to MongoDB');
        this.clearCache();
      }
      
      return success;
    } catch (error) {
      console.error('Error migrating data to MongoDB:', error);
      return false;
    }
  }
  
  // Method to clear the cache to ensure fresh data is loaded
  clearCache(): void {
    this.data = null;
  }

  // Method to check if we're in a serverless environment
  isServerless(): boolean {
    // Check for explicit serverless environment variables
    const hasServerlessEnv = !!(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
    
    // Check if we're in local development
    const isLocalDev = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV?.includes('dev') || 
                       (!process.env.NODE_ENV && typeof window === 'undefined');
    
    // Only consider serverless if we have explicit serverless env vars AND we're not in local dev
    return hasServerlessEnv && !isLocalDev;
  }

  // Force MongoDB usage (for testing or explicit preference)
  setMongoDBMode(useMongoDB: boolean): void {
    this.useFilesystem = !useMongoDB;
    this.clearCache();
  }
}

// Export the default instance
export const db = PortfolioDatabase.getInstance();
