// Simple database interface for portfolio data
// This can be extended to work with various database providers

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
    // Always try to read fresh data from file system first
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
        
        // Check if file exists
        if (!fs.existsSync(dataPath)) {
          console.warn('Portfolio data file does not exist');
          return defaultData; // Return empty structure instead of creating file
        }
        
        const fileContents = fs.readFileSync(dataPath, 'utf8');
        const parsedData = JSON.parse(fileContents) as PortfolioData;
        
        // Only ensure required arrays exist, don't merge with default profile/links data
        const cleanData = {
          profile: parsedData.profile || defaultData.profile,
          links: parsedData.links || defaultData.links,
          notes: Array.isArray(parsedData.notes) ? parsedData.notes : [],
          learning: Array.isArray(parsedData.learning) ? parsedData.learning : [],
        };
        
        this.data = cleanData; // Update cache
        console.log('Data loaded from file system:', {
          notesCount: cleanData.notes.length,
          learningCount: cleanData.learning.length
        });
        return cleanData;
      } catch (error) {
        console.warn('Could not read from file system:', error);
        // If file read fails but we have cached data, use it
        if (this.data) {
          console.log('Using cached data as fallback');
          return this.data;
        }
      }
    }    // If no cached data and file read failed, return empty structure
    if (!this.data) {
      console.log('No data available, returning empty structure');
      this.data = { ...defaultData };
    }
    
    return this.data;
  }  async updateData(newData: Partial<PortfolioData>): Promise<boolean> {
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
        fs.writeFileSync(dataPath, JSON.stringify(this.data, null, 2));
        return true;
      } catch (error) {
        console.warn('Could not write to file system (serverless environment):', error);
        // In serverless, data is only kept in memory for the request lifecycle
        // You would integrate with a real database here
        return false;
      }
    }

    return false;
  }
  
  // Method to clear the cache to ensure fresh data is loaded
  clearCache(): void {
    this.data = null;
  }
  // Method to check if we're in a serverless environment
  isServerless(): boolean {
    return !!(process.env.VERCEL || process.env.NETLIFY) || !process.env.NODE_ENV?.includes('development');
  }
}
