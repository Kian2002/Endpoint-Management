'use client';

import { useEffect, useState } from 'react';
import EnhancedAlerts from '../components/EnhancedAlerts';
import Navbar from '../components/Navbar';

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
      {/* Enhanced Header */}
      <Navbar currentPage="alerts" />

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">System Alerts & Monitoring</h1>
            <p className="text-gray-600">Monitor system changes, alerts, and comparison results</p>
          </div>
          <EnhancedAlerts 
            comparisonComponents={comparisonComponent}
            comparisonResults={comparisonResult}
          />
        </div>
      </div>
    </div>
  );
} 