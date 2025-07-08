'use client';

import Link from "next/link";
import { useData } from '@/components/DataProvider';
import { LearningPageSkeleton } from '@/components/SkeletonLoader';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  links?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  createdAt: string;
}

export default function Learning() {
  const { data, error, refetchData, isInitialLoading, isLoading } = useData();
  
  // Show skeleton loader during initial load
  if (isInitialLoading && !data) {
    return <LearningPageSkeleton />;
  }
  
  const learning = data?.learning || [];
  const portfolioData = data;

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-400 mb-4 text-6xl">⚠️</div>
            <div className="text-red-400 mb-4 text-xl font-semibold">Error loading learning data</div>
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
              <Link 
                href="/"
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-center"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function groupLearningByMonth(learning: Learning[]) {
    const groups: { [key: string]: Learning[] } = {};
    
    learning.forEach(item => {
      const date = new Date(item.date);
      const monthYear = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }).toUpperCase();
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });

    // Sort groups by date (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateB.getTime() - dateA.getTime();
    });

    const sortedGroups: { [key: string]: Learning[] } = {};
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return sortedGroups;
  }

  function getTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      project: 'bg-green-600 text-green-100',
      course: 'bg-blue-600 text-blue-100',
      book: 'bg-purple-600 text-purple-100',
      tutorial: 'bg-yellow-600 text-yellow-100',
      academy: 'bg-red-600 text-red-100',
      conference: 'bg-indigo-600 text-indigo-100',
    };
    return colors[type] || 'bg-gray-600 text-gray-100';
  }

  const groupedLearning = groupLearningByMonth(learning);

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading learning data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row">
      <ResponsiveNavigation profile={portfolioData.profile} links={portfolioData.links} />
      
      {/* Mobile spacer */}
      <div className="lg:hidden h-16"></div>
      
      {/* Main Content */}
      <main className="flex-1 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">📚 Learning Journey</h1>
            <p className="text-gray-400 text-base lg:text-lg">Books, courses and projects I have learned from</p>
          </div>
          
          {Object.keys(groupedLearning).length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-8 lg:p-12 text-center border border-gray-800">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-gray-400 text-lg lg:text-xl mb-2">No learning items added yet</p>
              <p className="text-gray-500">The learning journey starts here!</p>
            </div>
          ) : (
            <div className="space-y-8 lg:space-y-12">
              {Object.entries(groupedLearning).map(([monthYear, items], groupIndex) => (
                <div key={monthYear} className="animate-fadeIn" style={{animationDelay: `${groupIndex * 0.1}s`}}>
                  <div className="flex items-center mb-6 lg:mb-8">
                    <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider bg-gray-800 px-3 sm:px-4 py-2 rounded-full border border-gray-700">
                      📅 {monthYear}
                    </h2>
                    <div className="flex-1 h-px bg-gray-800 ml-4"></div>
                  </div>
                  <div className="grid gap-4 lg:gap-6">
                    {items.map((item, itemIndex) => (
                      <div 
                        key={item.id} 
                        className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 card-hover animate-fadeIn"
                        style={{animationDelay: `${(groupIndex * 0.1) + (itemIndex * 0.05)}s`}}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold self-start ${getTypeColor(item.type)}`}>
                            {item.type.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-base lg:text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">{item.description}</p>
                            
                            {/* Learning Links */}
                            {item.links && item.links.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  Resources
                                </h4>
                                <div className="space-y-2">
                                  {item.links.map((link, linkIndex) => (
                                    <a
                                      key={linkIndex}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg p-3 transition-all duration-200 group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center">
                                            <span className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">
                                              {link.title}
                                            </span>
                                            <svg className="w-3 h-3 ml-1 text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                          </div>
                                          {link.description && (
                                            <p className="text-gray-400 text-xs mt-1">{link.description}</p>
                                          )}
                                        </div>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center mt-3 text-sm text-gray-400">
                              <span>🗓️ {new Date(item.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
