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
    name: "Your Name",
    title: "Full-stack developer specializing in the modern JavaScript stack, with startup and open-source experience. Very eager to learn, strongly communicative, self-driven to solve and create.",
    location: "Your City, Your Country",
    email: "your-email@example.com",
    skills: "TypeScript, Node.js, React.js, SQL, Electron",
    interests: "Type systems, compilers, codegen, OpenAPI",
    homeImage: ""
  },
  links: {
    work: [
      {
        id: "1",
        name: "Your Company",
        url: "https://your-company.com",
        icon: "🔗"
      },
      {
        id: "2",
        name: "Your Project",
        url: "https://your-project.com",
        icon: "📊"
      }
    ],
    presence: [
      {
        id: "3",
        name: "GitHub",
        url: "https://github.com/yourusername",
        icon: "🐙"
      },
      {
        id: "4",
        name: "LinkedIn",
        url: "https://linkedin.com/in/yourprofile",
        icon: "💼"
      }
    ]
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
  }
  async getData(): Promise<PortfolioData> {
    // Always try to read fresh data from file system first
    if (typeof window === 'undefined') {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const dataPath = path.join(process.cwd(), 'data', 'portfolio.json');
        const fileContents = fs.readFileSync(dataPath, 'utf8');
        const parsedData = JSON.parse(fileContents) as PortfolioData;
        this.data = parsedData; // Update cache
        return parsedData;
      } catch (error) {
        console.warn('Could not read from file system:', error);
        // If file read fails but we have cached data, use it
        if (this.data) {
          console.log('Using cached data as fallback');
          return this.data;
        }
      }
    }

    // If no cached data and file read failed, use default data
    if (!this.data) {
      console.log('Using default data');
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
