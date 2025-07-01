'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  isLoading: boolean;
  isInitialLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasInitialized = useRef(false);
  const { setLoading, setLoadingMessage } = useLoading();

  const fetchData = useCallback(async (force = false) => {
    try {
      console.log('[DataProvider] Starting fetchData, force:', force);
      setError(null);
      setIsLoading(true);
      
      if (!hasInitialized.current) {
        setLoading(true);
        setLoadingMessage('Loading portfolio data...');
      }

      const url = force ? '/api/data?refresh=true' : '/api/data';
      console.log('[DataProvider] Fetching from:', url);
      
      const response = await fetch(url, {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Cache-Control': force ? 'no-cache' : 'max-age=60'
        }
      });
      
      console.log('[DataProvider] Response status:', response.status);
      
      if (response.ok) {
        const portfolioData = await response.json();
        console.log('[DataProvider] Raw data received:', portfolioData);
        
        // Validate and sanitize the data
        const validatedData = {
          profile: {
            name: portfolioData.profile?.name || 'Portfolio Owner',
            title: portfolioData.profile?.title || 'Developer',
            location: portfolioData.profile?.location || 'Unknown',
            email: portfolioData.profile?.email || 'contact@example.com',
            skills: portfolioData.profile?.skills || 'Skills not listed',
            interests: portfolioData.profile?.interests || 'Interests not listed',
            homeImage: portfolioData.profile?.homeImage || ''
          },
          links: {
            work: Array.isArray(portfolioData.links?.work) ? portfolioData.links.work : [],
            presence: Array.isArray(portfolioData.links?.presence) ? portfolioData.links.presence : []
          },
          notes: Array.isArray(portfolioData.notes) ? portfolioData.notes : [],
          learning: Array.isArray(portfolioData.learning) ? portfolioData.learning : []
        };
        
        console.log('[DataProvider] Validated data:', validatedData);
        setData(validatedData);
        setLastUpdated(new Date());
        setError(null);
        setIsInitialLoading(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `API error: ${response.status} ${response.statusText}`;
        console.error('[DataProvider] API Error:', errorMsg);
        setError(errorMsg);
        setIsInitialLoading(false);
      }
    } catch (error) {
      let errorMsg = 'Failed to connect to the server';
      if (error instanceof Error) {
        errorMsg = error.message.includes('fetch') 
          ? 'Network connection failed. Please check your internet connection.'
          : `Network error: ${error.message}`;
      }
      console.error('[DataProvider] Error:', error);
      setError(errorMsg);
      setIsInitialLoading(false);
    } finally {
      setIsLoading(false);
      if (!hasInitialized.current) {
        setLoading(false);
      }
    }
  }, [setLoading, setLoadingMessage]); // Removed isInitialLoading dependency

  // Single useEffect for initial data fetch
  useEffect(() => {
    console.log('[DataProvider] useEffect triggered, hasInitialized:', hasInitialized.current);
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('[DataProvider] Triggering initial fetch');
      fetchData();
    }
  }, [fetchData]); // Only depend on fetchData

  const refetchData = async (force = false) => {
    await fetchData(force);
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      error, 
      refetchData, 
      lastUpdated,
      isLoading,
      isInitialLoading
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
