'use client';

import { useEffect, useState, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  // Database management state
  const [dbStatus, setDbStatus] = useState<{
    currentMode: string;
    mongoDBConfigured: boolean;
    canMigrate: boolean;
  } | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    if (!mounted) return;
      setLoading(true);
    setError(null);
    
    try {
      // Add timestamp to prevent caching issues
      const timestamp = Date.now();
      
      // Fetch database status
      const dbStatusRes = await fetch(`/api/migrate?t=${timestamp}`);
      if (dbStatusRes.ok) {
        const dbData = await dbStatusRes.json();
        setDbStatus(dbData);
      }
        // Fetch both with individual error handling
      const notesPromise = fetch(`/api/notes?t=${timestamp}`).then(async (res) => {
        console.log('Notes response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Notes data received:', data);
          return Array.isArray(data) ? data : [];
        } else {
          console.error('Failed to fetch notes:', res.status, res.statusText);
          throw new Error(`Failed to fetch notes: ${res.status}`);
        }
      }).catch((error) => {
        console.error('Error fetching notes:', error);
        throw error;
      });

      const learningPromise = fetch(`/api/learning?t=${timestamp}`).then(async (res) => {
        console.log('Learning response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('Learning data received:', data);
          return Array.isArray(data) ? data : [];
        } else {
          console.error('Failed to fetch learning:', res.status, res.statusText);
          throw new Error(`Failed to fetch learning: ${res.status}`);
        }
      }).catch((error) => {
        console.error('Error fetching learning:', error);
        throw error;
      });

      const results = await Promise.allSettled([notesPromise, learningPromise]);
      
      console.log('Fetch results:', results);
      
      // Handle notes result
      if (results[0].status === 'fulfilled') {
        console.log('Setting notes:', results[0].value);
        setNotes(results[0].value);
      } else {
        console.error('Notes fetch failed:', results[0].reason);
        setNotes([]);
      }
      
      // Handle learning result
      if (results[1].status === 'fulfilled') {
        console.log('Setting learning:', results[1].value);
        setLearning(results[1].value);
      } else {
        console.error('Learning fetch failed:', results[1].reason);
        setLearning([]);
      }
      
      // Set error if both failed
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Failed to load data. Please try again.');
      } else {
        // Clear error if at least one succeeded
        setError(null);
        setRetryCount(0);
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
      // Set empty arrays as fallback
      setNotes([]);
      setLearning([]);
    } finally {
      setLoading(false);
    }
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  useEffect(() => {
    // Auto-retry if initial load fails and we haven't tried too many times
    if (error && retryCount < 2 && mounted) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying data fetch (attempt ${retryCount + 1})`);
        setRetryCount(prev => prev + 1);
        fetchData();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [error, retryCount, mounted, fetchData]);

  // Set up periodic refresh to catch updates from admin actions
  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        console.log('Auto-refreshing dashboard data...');
        fetchData();
      }, 60000); // Refresh every 60 seconds (reduced frequency)
      
      return () => clearInterval(interval);
    }
  }, [mounted, fetchData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMigrateToMongoDB = async () => {
    setMigrating(true);
    setMigrationMessage(null);
    
    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMigrationMessage('✅ Successfully migrated to MongoDB!');
        // Refresh data
        fetchData();
      } else {
        setMigrationMessage(`❌ Migration failed: ${result.message}`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setMigrating(false);
    }
  };

  const handleSwitchDatabase = async (mode: 'mongodb' | 'filesystem') => {
    try {
      const response = await fetch('/api/database-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMigrationMessage(`✅ Switched to ${mode} mode`);
        // Refresh data
        fetchData();
      } else {
        setMigrationMessage(`❌ Failed to switch database mode`);
      }
    } catch (error) {
      setMigrationMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (loading) {
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
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-red-400 text-lg">⚠️ {error}</div>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
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
              <button
                onClick={fetchData}
                disabled={loading}
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-800 border border-gray-700 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
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
                    href="/admin/learning"
                    className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-all duration-200 btn-hover"
                  >
                    🎓 Manage Learning
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
                        href="/admin/learning"
                        className="text-gray-300 hover:text-white text-sm font-medium ml-4 transition-colors duration-200"
                      >
                        ✏️ Manage
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
                      📖 Manage all learning →
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

            {/* Database Management Section */}
            <div className="bg-gray-900 overflow-hidden shadow-2xl rounded-xl border border-gray-800 card-hover animate-fadeIn lg:col-span-2 xl:col-span-3" style={{animationDelay: '0.4s'}}>
              <div className="px-6 py-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <div className="p-2 bg-gray-700 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  🗄️ Database Management
                </h2>
                
                {dbStatus && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm font-medium">Current Mode</p>
                          <p className="text-lg font-bold text-white capitalize">{dbStatus.currentMode}</p>
                        </div>
                        <div className="text-2xl">
                          {dbStatus.currentMode === 'mongodb' ? '🍃' : '📁'}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm font-medium">MongoDB Status</p>
                          <p className="text-lg font-bold text-white">
                            {dbStatus.mongoDBConfigured ? 'Configured' : 'Not Set'}
                          </p>
                        </div>
                        <div className="text-2xl">
                          {dbStatus.mongoDBConfigured ? '✅' : '❌'}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm font-medium">Migration</p>
                          <p className="text-lg font-bold text-white">
                            {dbStatus.canMigrate ? 'Available' : 'N/A'}
                          </p>
                        </div>
                        <div className="text-2xl">
                          {dbStatus.canMigrate ? '🔄' : '🚫'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {migrationMessage && (
                  <div className="mb-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-sm text-white">{migrationMessage}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {dbStatus?.canMigrate && dbStatus.currentMode === 'filesystem' && (
                    <button
                      onClick={handleMigrateToMongoDB}
                      disabled={migrating}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {migrating ? '🔄 Migrating...' : '🍃 Migrate to MongoDB'}
                    </button>
                  )}
                  
                  {dbStatus?.mongoDBConfigured && (
                    <>
                      <button
                        onClick={() => handleSwitchDatabase('mongodb')}
                        disabled={dbStatus.currentMode === 'mongodb'}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        🍃 Switch to MongoDB
                      </button>
                      <button
                        onClick={() => handleSwitchDatabase('filesystem')}
                        disabled={dbStatus.currentMode === 'filesystem'}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        📁 Switch to Filesystem
                      </button>
                    </>
                  )}
                </div>

                {!dbStatus?.mongoDBConfigured && (
                  <div className="mt-4 p-4 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ MongoDB is not configured. Please set the MONGODB_URI environment variable to enable MongoDB features.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
