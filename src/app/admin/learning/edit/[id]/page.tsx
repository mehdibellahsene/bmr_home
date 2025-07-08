'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Learning {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  links?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  createdAt: string;
}

export default function EditLearning() {
  const [learning, setLearning] = useState<Learning>({
    id: '',
    title: '',
    description: '',
    type: 'project',
    date: '',
    links: [],
    createdAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const learningId = params.id as string;

  const addLink = () => {
    setLearning({
      ...learning,
      links: [...(learning.links || []), { title: '', url: '', description: '' }]
    });
  };

  const removeLink = (index: number) => {
    setLearning({
      ...learning,
      links: (learning.links || []).filter((_, i) => i !== index)
    });
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updatedLinks = (learning.links || []).map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setLearning({ ...learning, links: updatedLinks });
  };

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const response = await fetch(`/api/learning/${learningId}`);
        if (response.ok) {
          const learningData = await response.json();
          setLearning({
            ...learningData,
            links: learningData.links || []
          });
        } else {
          setMessage('Learning item not found');
        }
      } catch (error) {
        console.error('Failed to fetch learning item:', error);
        setMessage('Error loading learning item');
      } finally {
        setLoading(false);
      }
    };

    if (learningId) {
      fetchLearning();
    }
  }, [learningId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Filter out empty links
      const validLinks = (learning.links || []).filter(link => link.title && link.url);
      
      const response = await fetch(`/api/learning/${learningId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: learning.title,
          description: learning.description,
          type: learning.type,
          date: learning.date,
          links: validLinks
        })
      });

      if (response.ok) {
        setMessage('Learning item updated successfully!');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to update learning item');
      }
    } catch (error) {
      setMessage('Error updating learning item');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this learning item? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/learning/${learningId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Learning item deleted successfully!');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to delete learning item');
      }
    } catch (error) {
      setMessage('Error deleting learning item');
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
              <h1 className="text-3xl font-bold text-white">Edit Learning Item</h1>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Item'}
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
                  value={learning.title}
                  onChange={(e) => setLearning(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={learning.description}
                  onChange={(e) => setLearning(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                  placeholder="Describe what you learned or are learning..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                    Type
                  </label>
                  <select
                    id="type"
                    value={learning.type}
                    onChange={(e) => setLearning(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    required
                  >
                    <option value="project">Project</option>
                    <option value="course">Course</option>
                    <option value="book">Book</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="academy">Academic Path</option>
                    <option value="certification">Certification</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-white mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={learning.date}
                    onChange={(e) => setLearning(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    required
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-white">
                    Resource Links (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors"
                  >
                    + Add Link
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(learning.links || []).map((link, index) => (
                    <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Link {index + 1}</span>
                        {(learning.links || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Link Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Course Website, GitHub Repository"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            value={link.title}
                            onChange={(e) => updateLink(index, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Brief description of this resource"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            value={link.description || ''}
                            onChange={(e) => updateLink(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!learning.links || learning.links.length === 0) && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      No links added yet. Click &quot;Add Link&quot; to add resource links.
                    </div>
                  )}
                </div>
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
                  {saving ? 'Saving...' : 'Update Learning Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
