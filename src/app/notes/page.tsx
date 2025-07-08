'use client';

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useData } from '@/components/DataProvider';
import { NotesPageSkeleton } from '@/components/SkeletonLoader';
import ResponsiveNavigation from '@/components/ResponsiveNavigation';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function Notes() {
  const { data, error, refetchData, isInitialLoading, isLoading } = useData();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Show skeleton loader during initial load
  if (isInitialLoading && !data) {
    return <NotesPageSkeleton />;
  }

  const notes = data?.notes || [];
  const portfolioData = data;

  // Auto-select first note if available and none selected
  if (notes.length > 0 && !selectedNote) {
    setSelectedNote(notes[0]);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-400 mb-4 text-6xl">⚠️</div>
            <div className="text-red-400 mb-4 text-xl font-semibold">Error loading notes</div>
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-black">
        <div className="lg:hidden pt-16"></div>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Loading notes...</div>
        </div>
      </div>
    );
  }

  // Fullscreen view for mobile
  if (isFullscreen && selectedNote) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold truncate">{selectedNote.title}</h2>
            <button
              onClick={() => setIsFullscreen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
            </div>
          </div>
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
      <main className="flex-1 flex flex-col lg:flex-row bg-black">
        {/* Notes List */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-gray-800 bg-black">
          <div className="p-4 lg:p-6 border-b border-gray-800">
            <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">📝 Notes</h1>
            <p className="text-gray-400 text-sm lg:text-base">Personal thoughts and insights</p>
          </div>
          
          <div className="overflow-y-auto h-64 lg:h-[calc(100vh-200px)]">
            {notes.length === 0 ? (
              <div className="p-4 lg:p-6 text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📝</span>
                </div>
                <p className="text-gray-400 text-sm lg:text-base mb-2">No notes available</p>
                <p className="text-gray-500 text-xs lg:text-sm">Start writing your first note!</p>
              </div>
            ) : (
              <div className="space-y-1 p-2 lg:p-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`p-3 lg:p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedNote?.id === note.id
                        ? 'bg-gray-800 border border-gray-700'
                        : 'hover:bg-gray-900 border border-transparent'
                    }`}
                  >
                    <h3 className="font-medium text-white text-sm lg:text-base mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-gray-400 text-xs lg:text-sm mb-2 line-clamp-3">
                      {note.content.replace(/[#*`\n]/g, ' ').substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-500">
                      {new Date(note.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Note Content */}
        <div className="flex-1 flex flex-col bg-black">
          {selectedNote ? (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg lg:text-2xl font-bold text-white mb-2 line-clamp-2">{selectedNote.title}</h1>
                  <div className="text-sm text-gray-400">
                    Published on {new Date(selectedNote.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="lg:hidden ml-4 text-gray-400 hover:text-white"
                  title="Fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📖</span>
                </div>
                <p className="text-gray-400 text-lg lg:text-xl mb-2">Select a note to read</p>
                <p className="text-gray-500 text-sm lg:text-base">Choose from the list on the {window.innerWidth >= 1024 ? 'left' : 'top'}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
