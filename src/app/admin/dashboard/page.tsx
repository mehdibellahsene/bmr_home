'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [learning, setLearning] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, learningRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/learning')
      ]);

      if (notesRes.ok && learningRes.ok) {
        const notesData = await notesRes.json();
        const learningData = await learningRes.json();
        setNotes(notesData);
        setLearning(learningData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-600 rounded-full animate-pulse"></div>
          </div>
          <div className="text-gray-300 text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage your content and profile</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 border border-gray-700"
              >
                🌐 View Site
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 btn-hover"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Notes Section */}
            <div className="bg-gray-900 overflow-hidden shadow-2xl rounded-xl border border-gray-800 card-hover animate-fadeIn">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Notes</h2>
                      <p className="text-gray-400 text-sm">{notes.length} total</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/notes/new"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 btn-hover"
                  >
                    ✨ Add Note
                  </Link>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notes.slice(0, 5).map((note) => (
                    <div key={note.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{note.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">📅 {note.publishedAt}</p>
                      </div>
                      <Link
                        href={`/admin/notes/edit/${note.id}`}
                        className="text-gray-300 hover:text-white text-sm font-medium ml-4 transition-colors duration-200"
                      >
                        ✏️ Edit
                      </Link>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">📝 No notes yet</div>
                      <p className="text-gray-600 text-xs mt-1">Start writing your first note!</p>
                    </div>
                  )}
                </div>
                {notes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <Link
                      href="/admin/notes"
                      className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                    >
                      📚 View all notes →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Section */}
            <div className="bg-gray-900 overflow-hidden shadow-2xl rounded-xl border border-gray-800 card-hover animate-fadeIn" style={{animationDelay: '0.1s'}}>
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Learning</h2>
                      <p className="text-gray-400 text-sm">{learning.length} items</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/learning/new"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 btn-hover"
                  >
                    🎓 Add Learning
                  </Link>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {learning.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          🏷️ {item.type} • 📅 {item.date}
                        </p>
                      </div>
                      <Link
                        href={`/admin/learning/edit/${item.id}`}
                        className="text-gray-300 hover:text-white text-sm font-medium ml-4 transition-colors duration-200"
                      >
                        ✏️ Edit
                      </Link>
                    </div>
                  ))}
                  {learning.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">🎯 No learning items yet</div>
                      <p className="text-gray-600 text-xs mt-1">Document your learning journey!</p>
                    </div>
                  )}
                </div>
                {learning.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <Link
                      href="/admin/learning"
                      className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
                    >
                      📖 View all learning →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Profile & Links Section */}
            <div className="bg-gray-900 overflow-hidden shadow-2xl rounded-xl border border-gray-800 card-hover animate-fadeIn lg:col-span-2 xl:col-span-1" style={{animationDelay: '0.2s'}}>
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Profile</h2>
                      <p className="text-gray-400 text-sm">Manage your info</p>
                    </div>
                  </div>
                  <Link
                    href="/admin/profile"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 btn-hover"
                  >
                    ⚙️ Edit Profile
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-300 text-sm">
                      ✨ Manage your personal information, skills, interests, and social links to showcase your professional profile.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-gray-300 font-semibold">Skills</div>
                      <div className="text-gray-400">Tech stack</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-gray-300 font-semibold">Links</div>
                      <div className="text-gray-400">Social media</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-900 overflow-hidden shadow-2xl rounded-xl border border-gray-800 card-hover animate-fadeIn lg:col-span-2 xl:col-span-3" style={{animationDelay: '0.3s'}}>
              <div className="px-6 py-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  📊 Content Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl text-white border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm font-medium">Total Notes</p>
                        <p className="text-3xl font-bold">{notes.length}</p>
                      </div>
                      <div className="text-gray-400">📝</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl text-white border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm font-medium">Learning Items</p>
                        <p className="text-3xl font-bold">{learning.length}</p>
                      </div>
                      <div className="text-gray-400">🎓</div>
                    </div>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl text-white border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm font-medium">Total Content</p>
                        <p className="text-3xl font-bold">{notes.length + learning.length}</p>
                      </div>
                      <div className="text-gray-400">🚀</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
