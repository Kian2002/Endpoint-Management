"use client";

import { 
  BarChart3, PieChart, Activity, AlertTriangle, 
  TrendingUp, Users, Database, Shield
} from 'lucide-react';

interface DataSummaryProps {
  data: any;
}

export default function DataSummary({ data }: DataSummaryProps) {
  const assets = data.pc_asset || [];
  const processes = data.get_process_temp || [];
  const software = data.installed_software || [];
  const comparisonResults = data.comparison_result || [];
  const comparisonComponents = data.comparison_component || [];
  const processLogs = data.process_log || [];

  // Calculate key metrics
  const metrics = {
    totalEndpoints: assets.length,
    totalProcesses: processes.length,
    totalSoftware: software.length,
    totalComparisons: comparisonResults.length,
    totalAlerts: comparisonComponents.length,
    totalLogs: processLogs.length,
    osDistribution: assets.reduce((acc: any, asset: any) => {
      const os = asset.os || 'Unknown OS';
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {}),
    alertDistribution: comparisonComponents.reduce((acc: any, comp: any) => {
      const type = comp.component_type || 'info';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  };

  const features = [
    {
      title: "Interactive Charts",
      description: "Pie charts, bar charts, and area charts for data visualization",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Real-Time Monitoring",
      description: "Live system metrics with auto-refresh capabilities",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Enhanced Alerts",
      description: "Filterable alerts with severity levels and search functionality",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Endpoint Management",
      description: "Detailed endpoint cards with filtering and search",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Process Monitoring",
      description: "Live process tracking and performance metrics",
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      title: "Software Inventory",
      description: "Comprehensive software tracking and publisher analysis",
      icon: Database,
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{metrics.totalEndpoints}</div>
          <div className="text-sm text-gray-600">Endpoints</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.totalProcesses}</div>
          <div className="text-sm text-gray-600">Processes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{metrics.totalSoftware}</div>
          <div className="text-sm text-gray-600">Software</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{metrics.totalComparisons}</div>
          <div className="text-sm text-gray-600">Comparisons</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{metrics.totalAlerts}</div>
          <div className="text-sm text-gray-600">Alerts</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{metrics.totalLogs}</div>
          <div className="text-sm text-gray-600">Logs</div>
        </div>
      </div>

      {/* OS Distribution Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operating System Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.osDistribution).map(([os, count]) => (
            <div key={os} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{os}</p>
                  <p className="text-2xl font-bold text-blue-600">{count as number}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {((count as number / metrics.totalEndpoints) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Distribution Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(metrics.alertDistribution).map(([type, count]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 capitalize">{type}</p>
                  <p className="text-2xl font-bold text-red-600">{count as number}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {((count as number / metrics.totalAlerts) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 