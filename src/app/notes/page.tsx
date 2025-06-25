'use client';

import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  profile: {
    name: string;
  };
  links: {
    work: Array<{ id: string; name: string; url: string; icon: string }>;
    presence: Array<{ id: string; name: string; url: string; icon: string }>;
  };
}

export default function Notes() {  const [notes, setNotes] = useState<Note[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
        setPortfolioData(data);
        // Auto-select first note if available
        if (data.notes && data.notes.length > 0) {
          setSelectedNote(data.notes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">No portfolio data available</div>
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
          <Link href="/notes" className="flex items-center space-x-3 text-white bg-gray-800 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="font-medium">Notes</span>
          </Link>
          <Link href="/learning" className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-900 px-4 py-3 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Learning</span>
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
              {portfolioData.links.work.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Presence
            </h3>
            <div className="space-y-2">
              {portfolioData.links.presence.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-3 rounded-lg transition-all duration-200"
                >
                  <span>{link.icon}</span>
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex bg-black">
        {/* Notes List Panel */}
        <div className="w-1/3 border-r border-gray-800 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">📝 Notes</h1>
            <p className="text-gray-400">Select a note to preview</p>
          </div>
          
          {notes.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-6 text-center border border-gray-800">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📝</span>
              </div>
              <p className="text-gray-400 mb-1">No notes yet</p>
              <p className="text-gray-500 text-sm">Check back later!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-800 ${
                    selectedNote?.id === note.id
                      ? 'bg-gray-800 border-gray-600'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <h3 className="text-white font-semibold mb-2 truncate">{note.title}</h3>
                  <time className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                    {new Date(note.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                    {note.content.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Note Preview Panel */}
        <div className={`flex-1 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
          {selectedNote ? (
            <>
              {/* Preview Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Merriweather, serif' }}>
                    {selectedNote.title}
                  </h2>
                  <time className="text-sm text-gray-400">
                    📅 Published on {new Date(selectedNote.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>
                  {isFullscreen && (
                    <button
                      onClick={toggleFullscreen}
                      className="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded transition-colors duration-200"
                    >
                      ESC
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose prose-invert prose-lg max-w-none" style={{ fontFamily: 'Merriweather, serif' }}>
                  <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <p className="text-gray-400 text-xl mb-2">Select a note to preview</p>
                <p className="text-gray-500">Choose from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
