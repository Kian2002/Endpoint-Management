'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Alerts() {
  const [comparisonComponent, setComparisonComponent] = useState<any[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/all-data');
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.error || 'Failed to fetch data');
        setComparisonComponent(result.data.comparison_component);
        setComparisonResult(result.data.comparison_result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
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
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Endpoints
                </Link>
                <Link
                  href="/alerts"
                  className="border-black text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Alerts
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-0 space-y-12">
        <section>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Comparison Components</h1>
          <div className="bg-white shadow overflow-x-auto sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {comparisonComponent[0] && Object.keys(comparisonComponent[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonComponent.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 text-sm">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {comparisonComponent.length === 0 && <div className="p-4 text-gray-500">No comparison components found.</div>}
          </div>
        </section>
        <section>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Comparison Results</h1>
          <div className="bg-white shadow overflow-x-auto sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {comparisonResult[0] && Object.keys(comparisonResult[0]).map((key) => (
                    <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonResult.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 text-sm">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {comparisonResult.length === 0 && <div className="p-4 text-gray-500">No comparison results found.</div>}
          </div>
        </section>
      </div>
    </div>
  );
} 