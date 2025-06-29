import { getPortfolioData } from '@/lib/database-simple';
import type { PortfolioData } from '@/lib/database-simple';

export default async function ServerPortfolioData({
  children,
}: {
  children: (data: PortfolioData) => React.ReactNode;
}) {
  try {
    const data = await getPortfolioData();
    return <>{children(data)}</>;
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    
    // Return default data structure on error
    const defaultData: PortfolioData = {
      profile: {
        name: 'BMR Portfolio',
        title: 'Full Stack Developer',
        location: 'Remote',
        email: 'contact@example.com',
        skills: 'JavaScript, TypeScript, React, Node.js',
        interests: 'Web Development, AI, Open Source',
      },
      links: {
        work: [],
        presence: [],
      },
      notes: [],
      learning: [],
    };
    
    return <>{children(defaultData)}</>;
  }
}
