'use client';

import Link from "next/link";
import { useData } from '@/components/DataProvider';

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt: string;
}

export default function Learning() {
  const { data, error, refetchData } = useData();
  
  const learning = data?.learning || [];
  const portfolioData = data;

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 mb-4">⚠️ Error loading learning data</div>
          <div className="text-gray-300 mb-4">{error}</div>
          <button 
            onClick={() => refetchData(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Retry
          </button>
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading learning data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-black border-r border-gray-800 p-6">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-white">{portfolioData.profile.name}</h1>
          <p className="text-gray-400 text-sm mt-1">Portfolio</p>
        </div>
          <nav className="space-y-2">
          <Link href="/" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-900 px-4 py-3 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </Link>
          <Link href="/notes" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-900 px-4 py-3 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Notes</span>
          </Link>
          <Link href="/learning" className="flex items-center space-x-3 text-white bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium">Learning</span>
          </Link>
        </nav>        {portfolioData.links.work.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Work
            </h3>
            <div className="space-y-2">
              {portfolioData.links.work.map((link: { id: string; name: string; url: string; icon: string }) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-900 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}        {portfolioData.links.presence.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03 3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Presence
            </h3>
            <div className="space-y-2">
              {portfolioData.links.presence.map((link: { id: string; name: string; url: string; icon: string }) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-900 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>      {/* Main Content */}
      <main className="flex-1 p-12 bg-black flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">📚 Learning Journey</h1>
            <p className="text-gray-400 text-lg">Books, courses and projects I have learned from</p>
          </div>
          
          {Object.keys(groupedLearning).length === 0 ? (
            <div className="bg-gray-900 rounded-2xl p-12 text-center border border-gray-800">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-gray-400 text-xl mb-2">No learning items added yet</p>
              <p className="text-gray-500">The learning journey starts here!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(groupedLearning).map(([monthYear, items], groupIndex) => (
                <div key={monthYear} className="animate-fadeIn" style={{animationDelay: `${groupIndex * 0.1}s`}}>
                  <div className="flex items-center mb-8">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
                      📅 {monthYear}
                    </h2>
                    <div className="flex-1 h-px bg-gray-800 ml-4"></div>
                  </div>
                  <div className="grid gap-6">
                    {items.map((item, itemIndex) => (
                      <div 
                        key={item.id} 
                        className="bg-gray-900 rounded-xl p-6 border border-gray-800 card-hover animate-fadeIn"
                        style={{animationDelay: `${(groupIndex * 0.1) + (itemIndex * 0.05)}s`}}
                      >
                        <div className="flex items-start space-x-4">
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${getTypeColor(item.type)}`}>
                            {item.type.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-300 leading-relaxed">{item.description}</p>
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
