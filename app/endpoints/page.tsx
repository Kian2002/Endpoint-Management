'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Endpoints() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/all-data');
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.error || 'Failed to fetch data');
        setAssets(result.data.pc_asset);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, []);

  // Summary: total endpoints, OS distribution
  const osSummary = assets.reduce((acc, asset) => {
    const os = asset.os || 'Unknown OS';
    acc[os] = (acc[os] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading endpoints...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="font-bold text-xl">
                  Endpoint Manager
                </Link>
              </div>
              <nav className="ml-6 flex space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/endpoints"
                  className="border-black text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Endpoints
                </Link>
                <Link
                  href="/alerts"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Alerts
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Endpoint Assets</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700">
            <span>Total Endpoints: <b>{assets.length}</b></span>
            {Object.entries(osSummary).map(([os, count]) => (
              <span key={os}>{os}: <b>{count}</b></span>
            ))}
          </div>
        </div>
        <div className="bg-white shadow overflow-x-auto sm:rounded-md">
          {assets.length === 0 ? (
            <div className="px-4 py-4 text-gray-500">No endpoint assets found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(assets[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    {Object.values(asset).map((val, i) => (
                      <td key={i} className="px-4 py-2 text-sm">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 