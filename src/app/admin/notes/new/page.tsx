'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewNote() {
  const [note, setNote] = useState({
    title: '',
    content: '',
    publishedAt: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create note');
      }
    } catch (err) {
      console.error('Create note error:', err);
      setError('An error occurred while creating the note');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-black">
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
              <h1 className="text-3xl font-bold text-white">New Note</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-800 text-red-300 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-white">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    value={note.title}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="publishedAt" className="block text-sm font-medium text-white">
                    Published Date
                  </label>
                  <input
                    type="date"
                    id="publishedAt"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    value={note.publishedAt}
                    onChange={(e) => setNote({ ...note, publishedAt: e.target.value })}
                  />
                </div>                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-white">
                    Content (Markdown)
                  </label>
                  <textarea
                    id="content"
                    rows={20}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 font-mono text-sm"
                    value={note.content}
                    onChange={(e) => setNote({ ...note, content: e.target.value })}
                    placeholder="Write your note content in Markdown format..."
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    You can use Markdown syntax like **bold**, *italic*, ## headings, - lists, etc.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 border border-gray-700 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
