"use client";

import { useEffect, useState } from "react";
import DataVisualization from "./DataVisualization";
import { Shield, Sparkles } from 'lucide-react';
import DataSummary from './DataSummary';
import RealTimeMonitor from './RealTimeMonitor';

export default function EndpointDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/all-data");
        const result = await response.json();
        if (result.status !== "success") throw new Error(result.error || "Failed to fetch data");
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  // Quick metrics for summary cards
  const assets = data.pc_asset || [];
  const processes = data.get_process_temp || [];
  const software = data.installed_software || [];
  const alerts = data.comparison_component || [];

  const summary = [
    { label: 'Endpoints', value: assets.length, icon: Shield, color: 'bg-blue-600' },
    { label: 'Alerts', value: alerts.length, icon: Sparkles, color: 'bg-red-500' },
    { label: 'Software', value: software.length, icon: Shield, color: 'bg-purple-600' },
    { label: 'Processes', value: processes.length, icon: Shield, color: 'bg-green-600' },
  ];

  return (
    <div className="space-y-8 p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((item, idx) => (
          <div key={item.label} className={`bg-white rounded-lg shadow p-6 flex items-center gap-4`}>
            <div className={`p-3 rounded-full ${item.color} bg-opacity-20`}>
              <item.icon className={`h-7 w-7 ${item.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className="text-sm text-gray-600">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Left: Data Visuals */}
        <div className="lg:col-span-3 space-y-8">
          <DataSummary data={data} />
        </div>
        {/* Right: Real-Time Monitor & Activity */}
        <div>
          <RealTimeMonitor data={data} />
        </div>
      </div>
    </div>
  );
} 