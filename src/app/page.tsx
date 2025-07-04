'use client';

import Link from "next/link";
import Image from "next/image";
import { useData } from '@/components/DataProvider';
import { HomePageSkeleton } from '@/components/SkeletonLoader';

export default function Home() {
  const { data, error, refetchData, isInitialLoading, isLoading } = useData();

  // Show skeleton loader during initial load
  if (isInitialLoading && !data) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
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
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6 shadow-xl">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">{data.profile.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Portfolio</p>
        </div><nav className="space-y-2">
          <Link href="/" className="flex items-center space-x-3 text-white bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </Link>
          <Link href="/notes" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Notes</span>
          </Link>
          <Link href="/learning" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Learning</span>
          </Link>
        </nav>        {data.links.work.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Work
            </h3>
            <div className="space-y-2">
              {data.links.work.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}        {data.links.presence.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Presence
            </h3>
            <div className="space-y-2">
              {data.links.presence.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}</aside>      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center bg-black">
        <div className="max-w-4xl w-full mx-auto px-8">          {/* Profile Card */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-800">            <div className="text-left">              {/* Profile Avatar */}              <div className="w-32 h-32 rounded-full mb-6 flex items-center justify-center shadow-lg overflow-hidden">
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
                    <div className="w-28 h-28 bg-emerald-400 rounded-full opacity-80"></div>
                  </div>
                )}
              </div>

              {/* Profile Name */}
              <h1 className="text-3xl font-bold text-white mb-3">
                {data.profile.name}
              </h1>

              {/* Profile Description */}
              <p className="text-gray-300 leading-relaxed mb-8">
                {data.profile.title}
              </p>              {/* Skills Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="font-semibold text-white">Skills:</h3>
                </div>
                <p className="text-gray-300">
                  {data.profile.skills || 'No skills listed yet'}
                </p>
              </div>

              {/* Interests Section */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 mr-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="font-semibold text-white">Interests:</h3>
                </div>
                <p className="text-gray-300">
                  {data.profile.interests || 'No interests listed yet'}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-300">
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
                    className="text-gray-300 hover:text-white transition-colors duration-200"
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
