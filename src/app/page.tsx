'use client';

import Image from "next/image";
import { useData } from '@/components/DataProvider';
import { HomePageSkeleton } from '@/components/SkeletonLoader';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';

export default function Home() {
  const { data, error, refetchData, isInitialLoading, isLoading } = useData();

  // Show skeleton loader during initial load
  if (isInitialLoading && !data) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-400 mb-4 text-6xl">⚠️</div>
            <div className="text-red-400 mb-4 text-xl font-semibold">Error loading portfolio</div>
            <div className="text-gray-300 mb-6 text-sm bg-gray-900 p-4 rounded-lg border border-gray-800">
              {error}
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => refetchData(true)}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? 'Retrying...' : 'Retry Loading'}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-white text-xl mb-4">No portfolio data available</div>
            <button 
              onClick={() => refetchData(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Load Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      <ResponsiveNavigation profile={data.profile} links={data.links} />
      
      {/* Refresh Indicator */}
      {isLoading && data && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Refreshing...</span>
        </div>
      )}
      
      {/* Mobile spacer */}
      <div className="lg:hidden h-16"></div>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full mx-auto">
          {/* Profile Card */}
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-800">
            <div className="text-left">
              {/* Profile Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-6 flex items-center justify-center shadow-lg overflow-hidden">
                {data.profile.homeImage ? (
                  <Image 
                    src={data.profile.homeImage} 
                    alt={data.profile.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover rounded-full"
                    priority
                    unoptimized={data.profile.homeImage.startsWith('http')}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 bg-emerald-400 rounded-full opacity-80"></div>
                  </div>
                )}
              </div>

              {/* Profile Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {data.profile.name}
              </h1>

              {/* Profile Description */}
              <p className="text-gray-300 leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base">
                {data.profile.title}
              </p>

              {/* Skills Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Skills:</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {data.profile.skills || 'No skills listed yet'}
                </p>
              </div>

              {/* Interests Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-semibold text-white text-sm sm:text-base">Interests:</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base">
                  {data.profile.interests || 'No interests listed yet'}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300 text-sm sm:text-base">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{data.profile.location}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href={`mailto:${data.profile.email}`} 
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm sm:text-base"
                  >
                    {data.profile.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
