'use client';

import { useEffect, useState } from 'react';
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

interface FormData {
  title: string;
  description: string;
  type: string;
  date: string;
  links: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

export default function AdminLearning() {
  const [learning, setLearning] = useState<Learning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLearning, setSelectedLearning] = useState<Learning | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'project',
    date: new Date().toISOString().split('T')[0],
    links: []
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleEdit = (item: Learning) => {
    setSelectedLearning(item);
    setIsEditing(true);
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      date: item.date,
      links: item.links || []
    });
    setMessage('');
  };

  const handleNew = () => {
    setSelectedLearning(null);
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      type: 'project',
      date: new Date().toISOString().split('T')[0],
      links: []
    });
    setMessage('');
  };

  const handleCancel = () => {
    setSelectedLearning(null);
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      type: 'project',
      date: new Date().toISOString().split('T')[0],
      links: []
    });
    setMessage('');
  };

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { title: '', url: '', description: '' }]
    });
  };

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    });
  };

  const updateLink = (index: number, field: string, value: string) => {
    const updatedLinks = formData.links.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    setFormData({ ...formData, links: updatedLinks });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const url = isEditing && selectedLearning ? `/api/learning/${selectedLearning.id}` : '/api/learning';
      const method = isEditing ? 'PUT' : 'POST';

      // Filter out empty links
      const validLinks = formData.links.filter(link => link.title && link.url);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          links: validLinks
        })
      });

      if (response.ok) {
        setMessage(`Learning item ${isEditing ? 'updated' : 'created'} successfully!`);
        await fetchLearning(); // Refresh the list
        handleCancel(); // Reset form
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} learning item`);
      }
    } catch (error) {
      setMessage(`Error ${isEditing ? 'updating' : 'creating'} learning item`);
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLearning || !confirm('Are you sure you want to delete this learning item? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/learning/${selectedLearning.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage('Learning item deleted successfully!');
        await fetchLearning(); // Refresh the list
        handleCancel(); // Reset form
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
              <h1 className="text-3xl font-bold text-white">Learning Management</h1>
            </div>
            <button
              onClick={handleNew}
              className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Add New Learning
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 sm:px-0">
          {/* Left Panel - Learning List */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">All Learning Items</h2>
              <p className="text-gray-400 mt-1">Click on an item to edit it</p>
            </div>
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {learning.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-300 text-lg mb-4">No learning items yet</p>
                  <button
                    onClick={handleNew}
                    className="bg-gray-700 text-white px-6 py-3 rounded-md hover:bg-gray-600"
                  >
                    Add Your First Learning Item
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {learning.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleEdit(item)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                        selectedLearning?.id === item.id
                          ? 'border-gray-600 bg-gray-800'
                          : 'border-gray-700 bg-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">{item.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{item.date}</span>
                        <span>Added: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? 'Edit Learning Item' : 'Add New Learning Item'}
                </h2>
                {isEditing && selectedLearning && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.includes('Error') ? 'bg-red-900 text-red-300 border border-red-800' : 'bg-green-900 text-green-300 border border-green-800'
                }`}>
                  {message}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                    placeholder="Describe what you learned or are learning..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                      Type
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                      required
                    />
                  </div>
                </div>

                {/* Links Section */}
                <div>
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
                    {formData.links.map((link, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-300">Link {index + 1}</span>
                          {formData.links.length > 0 && (
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
                    
                    {formData.links.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No links added yet. Click &quot;Add Link&quot; to add resource links.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (isEditing ? 'Update Learning Item' : 'Create Learning Item')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
