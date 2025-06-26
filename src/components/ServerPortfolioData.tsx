import { mongoDb } from '@/lib/database-mongo';

interface PortfolioData {
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
    work: Array<{ id: string; name: string; url: string; icon: string }>;
    presence: Array<{ id: string; name: string; url: string; icon: string }>;
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

async function getPortfolioData(): Promise<PortfolioData | null> {
  try {
    const data = await mongoDb.getPortfolioData();
    return data as PortfolioData;
  } catch (error) {
    console.error('Error fetching portfolio data from MongoDB:', error);
    return null;
  }
}

export async function ServerPortfolioData({ children }: { 
  children: (data: PortfolioData | null) => React.ReactNode 
}) {
  const data = await getPortfolioData();
  return <>{children(data)}</>;
}
