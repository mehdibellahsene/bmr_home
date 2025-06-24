'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLearning() {
  const [learning, setLearning] = useState({
    title: '',
    description: '',
    type: 'project',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(learning),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create learning item');
      }
    } catch (err) {
      console.error('Create learning error:', err);
      setError('An error occurred while creating the learning item');
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
              <h1 className="text-3xl font-bold text-white">New Learning Item</h1>
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
                    value={learning.title}
                    onChange={(e) => setLearning({ ...learning, title: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-white">
                    Type
                  </label>
                  <select
                    id="type"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    value={learning.type}
                    onChange={(e) => setLearning({ ...learning, type: e.target.value })}
                  >
                    <option value="project">Project</option>                    <option value="course">Course</option>
                    <option value="book">Book</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="workshop">Workshop</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-white">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    value={learning.date}
                    onChange={(e) => setLearning({ ...learning, date: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    value={learning.description}
                    onChange={(e) => setLearning({ ...learning, description: e.target.value })}
                    placeholder="Describe what you learned or achieved..."
                  />
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
                  {loading ? 'Creating...' : 'Create Learning Item'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
