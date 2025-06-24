'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt: string;
}

export default function AdminLearning() {
  const [learning, setLearning] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearning();
  }, []);

  const fetchLearning = async () => {
    try {
      const response = await fetch('/api/learning');
      if (response.ok) {
        const learningData = await response.json();
        setLearning(learningData);
      }
    } catch (error) {
      console.error('Failed to fetch learning items:', error);
    } finally {
      setLoading(false);
    }
  };
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      project: 'bg-gray-700 text-gray-300 border border-gray-600',
      course: 'bg-gray-700 text-gray-300 border border-gray-600',
      book: 'bg-gray-700 text-gray-300 border border-gray-600',
      tutorial: 'bg-gray-700 text-gray-300 border border-gray-600',
      academy: 'bg-gray-700 text-gray-300 border border-gray-600',
      certification: 'bg-gray-700 text-gray-300 border border-gray-600',
      other: 'bg-gray-700 text-gray-300 border border-gray-600'
    };
    return colors[type] || colors.other;
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
              <h1 className="text-3xl font-bold text-white">All Learning</h1>
            </div>
            <Link
              href="/admin/learning/new"
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Add Learning Item
            </Link>
          </div>
        </div>
      </header>      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {learning.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg mb-4">No learning items yet</p>
              <Link
                href="/admin/learning/new"
                className="bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-600"
              >
                Add Your First Learning Item
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {learning.map((item) => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{item.date}</span>
                        <Link
                          href={`/admin/learning/edit/${item.id}`}
                          className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{item.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
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
