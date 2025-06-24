'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditNote() {
  const [note, setNote] = useState<Note>({
    id: '',
    title: '',
    content: '',
    publishedAt: '',
    createdAt: '',
    updatedAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (response.ok) {
          const noteData = await response.json();
          setNote(noteData);
        } else {
          setMessage('Note not found');
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
        setMessage('Error loading note');
      } finally {
        setLoading(false);
      }
    };

    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          publishedAt: note.publishedAt
        })
      });

      if (response.ok) {
        setMessage('Note updated successfully!');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      setMessage('Error updating note');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Note deleted successfully!');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      setMessage('Error deleting note');
      console.error('Error:', error);
    } finally {
      setDeleting(false);
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
              <h1 className="text-3xl font-bold text-white">Edit Note</h1>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Note'}
            </button>
          </div>
        </div>
      </header>      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('Error') ? 'bg-red-900 text-red-300 border border-red-800' : 'bg-green-900 text-green-300 border border-green-800'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={note.title}
                  onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="publishedAt" className="block text-sm font-medium text-white mb-2">
                  Published Date
                </label>
                <input
                  type="date"
                  id="publishedAt"
                  value={note.publishedAt}
                  onChange={(e) => setNote(prev => ({ ...prev, publishedAt: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                  Content (Markdown)
                </label>
                <textarea
                  id="content"
                  value={note.content}
                  onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 font-mono text-sm"
                  placeholder="Write your note content in Markdown..."
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/admin/dashboard"
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
