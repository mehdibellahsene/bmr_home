'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLoading } from './LoadingProvider';

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

interface DataContextType {
  data: PortfolioData | null;
  error: string | null;
  refetchData: (force?: boolean) => Promise<void>;
  lastUpdated: Date | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { setLoading, setLoadingMessage } = useLoading();

  const fetchData = async (force = false) => {
    try {
      setError(null);
      
      if (!data || force) {
        setLoading(true);
        setLoadingMessage('Loading portfolio data...');
      }

      const url = force ? '/api/data?refresh=true' : '/api/data';
      const response = await fetch(url, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });
      
      if (response.ok) {
        const portfolioData = await response.json();
        setData(portfolioData);
        setLastUpdated(new Date());
      } else {
        const errorMsg = `API error: ${response.status} ${response.statusText}`;
        console.error(errorMsg);
        setError(errorMsg);
      }
    } catch (error) {
      let errorMsg = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMsg = `Network error: ${error.message}`;
      }
      console.error('Error fetching portfolio data:', error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    
    const fetchDataEffect = async (force = false) => {
      try {
        setError(null);
        
        if (!data || force) {
          setLoading(true);
          setLoadingMessage('Loading portfolio data...');
        }

        const url = force ? '/api/data?refresh=true' : '/api/data';
        const response = await fetch(url, {
          next: { revalidate: 60 }, // Cache for 60 seconds
        });
        
        if (response.ok && mounted) {
          const portfolioData = await response.json();
          setData(portfolioData);
          setLastUpdated(new Date());
        } else if (mounted) {
          const errorMsg = `API error: ${response.status} ${response.statusText}`;
          console.error(errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        if (!mounted) return;
        
        let errorMsg = 'Unknown error occurred';
        if (error instanceof Error) {
          errorMsg = `Network error: ${error.message}`;
        }
        console.error('Error fetching portfolio data:', error);
        setError(errorMsg);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDataEffect();
    
    // Reduced polling interval - only refresh every 5 minutes
    const interval = setInterval(() => fetchDataEffect(), 300000);
    
    // Listen for visibility change to refresh when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden && lastUpdated) {
        // Only refresh if data is older than 2 minutes
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        if (lastUpdated < twoMinutesAgo) {
          fetchDataEffect();
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      mounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [data, setLoading, setLoadingMessage, lastUpdated]);

  const refetchData = async (force = false) => {
    await fetchData(force);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      error, 
      refetchData, 
      lastUpdated 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
