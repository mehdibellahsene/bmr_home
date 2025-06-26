// Simple database interface for portfolio data
// This can be extended to work with various database providers

// Static data fallback for serverless environments
const STATIC_PORTFOLIO_DATA = {
  "profile": {
    "name": "Your Name",
    "title": "Full-stack developer specializing in the modern JavaScript stack, with startup and open-source experience. Very eager to learn, strongly communicative, self-driven to solve and create.",
    "location": "Biarritz - Bordeaux, France ",
    "email": "your mail",
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

interface PortfolioData {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    skills: string;
    interests: string;
    homeImage: string;
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
  notes: Array<unknown>;
  learning: Array<unknown>;
}

const defaultData: PortfolioData = {
  profile: {
    name: "",
    title: "",
    location: "",
    email: "",
    skills: "",
    interests: "",
    homeImage: ""
  },
  links: {
    work: [],
    presence: []
  },
  notes: [],
  learning: []
};

// Environment-aware data access
export class PortfolioDatabase {
  private static instance: PortfolioDatabase;
  private data: PortfolioData | null = null;

  private constructor() {}

  static getInstance(): PortfolioDatabase {
    if (!PortfolioDatabase.instance) {
      PortfolioDatabase.instance = new PortfolioDatabase();
    }
    return PortfolioDatabase.instance;
  }  async getData(): Promise<PortfolioData> {
    // ALWAYS read fresh data - no caching at all for immediate updates
    this.data = null;
    
    // In serverless environments (like Vercel), prioritize static data
    if (this.isServerless()) {
      const cleanData = {
        profile: STATIC_PORTFOLIO_DATA.profile || defaultData.profile,
        links: STATIC_PORTFOLIO_DATA.links || defaultData.links,
        notes: Array.isArray(STATIC_PORTFOLIO_DATA.notes) ? STATIC_PORTFOLIO_DATA.notes : [],
        learning: Array.isArray(STATIC_PORTFOLIO_DATA.learning) ? STATIC_PORTFOLIO_DATA.learning : [],
      };
      return cleanData;
    }

    // For development/local environments, always read fresh from file system
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
        
        // Check if file exists
        if (!fs.existsSync(dataPath)) {
          console.log('Portfolio file not found, using static data');
          // Use static data as fallback
          const cleanData = {
            profile: STATIC_PORTFOLIO_DATA.profile || defaultData.profile,
            links: STATIC_PORTFOLIO_DATA.links || defaultData.links,
            notes: Array.isArray(STATIC_PORTFOLIO_DATA.notes) ? STATIC_PORTFOLIO_DATA.notes : [],
            learning: Array.isArray(STATIC_PORTFOLIO_DATA.learning) ? STATIC_PORTFOLIO_DATA.learning : [],
          };
          return cleanData;
        }
        
        // Always read fresh from file - no caching
        const fileContents = fs.readFileSync(dataPath, 'utf8');
        const parsedData = JSON.parse(fileContents) as PortfolioData;
        
        // Ensure required arrays exist
        const cleanData = {
          profile: parsedData.profile || defaultData.profile,
          links: parsedData.links || defaultData.links,
          notes: Array.isArray(parsedData.notes) ? parsedData.notes : [],
          learning: Array.isArray(parsedData.learning) ? parsedData.learning : [],
        };
        
        console.log('Fresh data loaded from file:', {
          notesCount: cleanData.notes.length,
          learningCount: cleanData.learning.length,
          profileName: cleanData.profile.name,
          timestamp: new Date().toISOString()
        });
        
        return cleanData;
      } catch (error) {
        console.error('Error reading portfolio file:', error);
        // Use static data as fallback
        const cleanData = {
          profile: STATIC_PORTFOLIO_DATA.profile || defaultData.profile,
          links: STATIC_PORTFOLIO_DATA.links || defaultData.links,
          notes: Array.isArray(STATIC_PORTFOLIO_DATA.notes) ? STATIC_PORTFOLIO_DATA.notes : [],
          learning: Array.isArray(STATIC_PORTFOLIO_DATA.learning) ? STATIC_PORTFOLIO_DATA.learning : [],
        };
        return cleanData;
      }
    }

    // Client-side fallback - return empty structure
    return { ...defaultData };
  }  async updateData(newData: Partial<PortfolioData>): Promise<boolean> {
    const currentData = await this.getData();
    
    // Merge the data but don't cache it
    const mergedData = {
      ...currentData,
      ...newData
    };

    // Always clear cache to force fresh reads
    this.data = null;

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
        
        // Write data to file immediately
        fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2));
        
        console.log('Data successfully written to file:', {
          notesCount: mergedData.notes.length,
          learningCount: mergedData.learning.length,
          timestamp: new Date().toISOString()
        });
        
        return true;
      } catch (error) {
        console.error('Failed to write data to file:', error);
        // In serverless environments or when filesystem is unavailable
        return false;
      }
    }

    return false;
  }
  
  // Method to clear the cache to ensure fresh data is loaded
  clearCache(): void {
    this.data = null;
  }  // Method to check if we're in a serverless environment
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
}
