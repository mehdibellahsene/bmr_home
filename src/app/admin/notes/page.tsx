'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-300 hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">All Notes</h1>
            </div>
            <Link
              href="/admin/notes/new"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Add New Note
            </Link>
          </div>
        </div>
      </header>      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg mb-4">No notes yet</p>
              <Link
                href="/admin/notes/new"
                className="bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-600"
              >
                Create Your First Note
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white">{note.title}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{note.publishedAt}</span>
                        <Link
                          href={`/admin/notes/edit/${note.id}`}
                          className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm mb-4">
                      <p>
                        {note.content.length > 200 
                          ? `${note.content.substring(0, 200)}...` 
                          : note.content}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
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
