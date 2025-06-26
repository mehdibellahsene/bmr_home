'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [apiResponse, setApiResponse] = useState<{
    status: string;
    duration: string;
    data: unknown;
    headers: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const start = Date.now();
      const response = await fetch('/api/data', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const end = Date.now();
      const duration = end - start;
      
      if (response.ok) {
        const data = await response.json();
        setApiResponse({
          status: 'success',
          duration: `${duration}ms`,
          data,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className="space-y-6">
          <div>
            <button
              onClick={testAPI}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
            >
              {loading ? 'Testing API...' : 'Test API Endpoint'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-600 p-4 rounded">
              <h3 className="text-red-400 font-semibold mb-2">Error</h3>
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {apiResponse && (
            <div className="bg-gray-900 border border-gray-600 p-4 rounded">
              <h3 className="text-green-400 font-semibold mb-4">API Response</h3>
              <div className="space-y-2">
                <p><span className="text-gray-400">Status:</span> {apiResponse.status}</p>
                <p><span className="text-gray-400">Duration:</span> {apiResponse.duration}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-gray-400 font-semibold mb-2">Response Headers:</h4>
                <pre className="bg-black p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(apiResponse.headers, null, 2)}
                </pre>
              </div>
              
              <div className="mt-4">
                <h4 className="text-gray-400 font-semibold mb-2">Response Data:</h4>
                <pre className="bg-black p-2 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(apiResponse.data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-600 p-4 rounded">
            <h3 className="text-blue-400 font-semibold mb-4">Environment Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">User Agent:</span> {navigator.userAgent}</p>
              <p><span className="text-gray-400">Timestamp:</span> {new Date().toISOString()}</p>
              <p><span className="text-gray-400">Time Zone:</span> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
