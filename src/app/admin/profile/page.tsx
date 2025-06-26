'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  skills: string;
  interests: string;
  homeImage: string;
}

interface LinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface Links {
  work: LinkItem[];
  presence: LinkItem[];
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    title: '',
    location: '',
    email: '',
    skills: '',
    interests: '',
    homeImage: ''
  });
  const [links, setLinks] = useState<Links>({ work: [], presence: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile(data.profile);
          setDataLoaded(true);
        }
        if (data.links) {
          setLinks(data.links);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      });

      if (response.ok) {
        setMessage('Profile updated successfully! Changes will appear on your public site.');
        
        // Trigger a cache refresh by fetching fresh data
        setTimeout(async () => {
          try {
            const timestamp = Date.now();
            await fetch(`/api/data?t=${timestamp}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
          } catch (error) {
            console.log('Cache refresh request failed, but update was successful:', error);
          }
        }, 1000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };
  const handleLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      });

      if (response.ok) {
        setMessage('Links updated successfully! Changes will appear on your public site.');
        
        // Trigger a cache refresh by fetching fresh data
        setTimeout(async () => {
          try {
            const timestamp = Date.now();
            await fetch(`/api/data?t=${timestamp}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache' }
            });
          } catch (error) {
            console.log('Cache refresh request failed, but update was successful:', error);
          }
        }, 1000);
      } else {
        throw new Error('Failed to update links');
      }
    } catch (error) {
      setMessage('Error updating links');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const addLink = (section: 'work' | 'presence') => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      name: '',
      url: '',
      icon: section === 'work' ? '🔗' : '🐙'
    };
    setLinks(prev => ({
      ...prev,
      [section]: [...prev[section], newLink]
    }));
  };

  const updateLink = (section: 'work' | 'presence', id: string, field: keyof LinkItem, value: string) => {
    setLinks(prev => ({
      ...prev,
      [section]: prev[section].map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLink = (section: 'work' | 'presence', id: string) => {
    setLinks(prev => ({
      ...prev,
      [section]: prev[section].filter(link => link.id !== id)
    }));
  };  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-300">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-300 hover:text-white"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white">Edit Profile & Links</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.includes('Error') ? 'bg-red-900 text-red-300 border border-red-700' : 'bg-green-900 text-green-300 border border-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Section */}
          <div className="bg-gray-900 shadow rounded-lg mb-8 border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Profile Information</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Home Image URL
                  </label>
                  <input
                    type="url"
                    value={profile.homeImage}
                    onChange={(e) => setProfile(prev => ({ ...prev, homeImage: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Optional: URL to your profile image. Leave empty to use the default gradient avatar.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    required
                  />
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills
                  </label>
                  <input
                    type="text"
                    value={profile.skills}
                    onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="TypeScript, React, Node.js..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interests
                  </label>
                  <input
                    type="text"
                    value={profile.interests}
                    onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="System design, AI, Web development..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio/Title
                  </label>
                  <textarea
                    value={profile.title}
                    onChange={(e) => setProfile(prev => ({ ...prev, title: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Your professional bio or description..."
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>          {/* Links Section */}
          <div className="bg-gray-900 shadow rounded-lg border border-gray-800">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Links</h2>
            </div>
            <form onSubmit={handleLinksSubmit} className="p-6">
              {/* Work Links */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-white">Work Links</h3>
                  <button
                    type="button"
                    onClick={() => addLink('work')}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Add Work Link
                  </button>
                </div>
                <div className="space-y-4">
                  {links.work.map((link) => (
                    <div key={link.id} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-2">                        <input
                          type="text"
                          value={link.icon}
                          onChange={(e) => updateLink('work', link.id, 'icon', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-center text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="🔗"
                        />
                      </div>
                      <div className="col-span-4">                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateLink('work', link.id, 'name', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="Link Name"
                          required
                        />
                      </div>
                      <div className="col-span-5">                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink('work', link.id, 'url', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="https://example.com"
                          required
                        />
                      </div>
                      <div className="col-span-1">                        <button
                          type="button"
                          onClick={() => removeLink('work', link.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presence Links */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-white">Social/Presence Links</h3>                  <button
                    type="button"
                    onClick={() => addLink('presence')}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                  >
                    Add Social Link
                  </button>
                </div>
                <div className="space-y-4">
                  {links.presence.map((link) => (
                    <div key={link.id} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-2">                        <input
                          type="text"
                          value={link.icon}
                          onChange={(e) => updateLink('presence', link.id, 'icon', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-center text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="🐙"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateLink('presence', link.id, 'name', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="Platform Name"
                          required
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink('presence', link.id, 'url', e.target.value)}
                          className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                          placeholder="https://github.com/username"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeLink('presence', link.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Links'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
