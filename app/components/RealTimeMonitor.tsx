"use client";

import { useState, useEffect } from "react";
import { 
  Activity, Cpu, HardDrive, Wifi, 
  TrendingUp, TrendingDown, Clock, 
  AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';

interface RealTimeMonitorProps {
  data: any;
}

export default function RealTimeMonitor({ data }: RealTimeMonitorProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const assets = data.pc_asset || [];
  const processes = data.get_process_temp || [];
  const processLogs = data.process_log || [];
  const comparisonResults = data.comparison_result || [];

  // Calculate system metrics
  const systemMetrics = {
    totalEndpoints: assets.length,
    activeProcesses: processes.length,
    recentActivity: comparisonResults.length,
    avgMemoryUsage: processLogs.length > 0 
      ? Math.round(processLogs.reduce((sum: number, log: any) => sum + (log.memory_kb || 0), 0) / processLogs.length)
      : 0,
    systemHealth: calculateSystemHealth(),
    uptime: calculateUptime()
  };

  function calculateSystemHealth() {
    const criticalAlerts = (data.comparison_component || []).filter((comp: any) => comp.component_type === 'critical').length;
    if (criticalAlerts > 0) return 'critical';
    if (assets.length === 0) return 'warning';
    return 'healthy';
  }

  function calculateUptime() {
    // Simulate uptime based on recent activity
    const recentActivity = comparisonResults.slice(-10);
    if (recentActivity.length === 0) return 'Unknown';
    
    const lastActivity = new Date(recentActivity[recentActivity.length - 1].snapshot_before_time || Date.now());
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return '< 1 hour';
    if (diffHours < 24) return `${diffHours} hours`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days`;
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Recent activity timeline
  const recentActivity = comparisonResults.slice(-5).reverse().map((result: any, index: number) => ({
    id: result.id || index,
    type: 'comparison',
    timestamp: new Date(result.snapshot_before_time || Date.now()),
    description: `System comparison performed on PC ${result.pc_id}`,
    status: 'completed'
  }));

  return (
    <div className="space-y-6">
      {/* Real-time Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Real-Time System Monitor</h3>
              <p className="text-sm text-gray-500">Live system metrics and activity</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">Auto-refresh</label>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-gray-900 capitalize">{systemMetrics.systemHealth}</p>
            </div>
            <div className={`p-3 rounded-full ${getHealthColor(systemMetrics.systemHealth).split(' ')[0]} bg-opacity-10`}>
              {getHealthIcon(systemMetrics.systemHealth)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Endpoints</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalEndpoints}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Cpu className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running Processes</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeProcesses}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.uptime}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Average Memory Usage</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.avgMemoryUsage} KB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recent Comparisons</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.recentActivity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Processes</span>
              <span className="text-sm font-medium text-gray-900">{systemMetrics.activeProcesses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(systemMetrics.systemHealth)}`}>
                {getHealthIcon(systemMetrics.systemHealth)}
                <span className="ml-1 capitalize">{systemMetrics.systemHealth}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : (
              recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Process Monitor */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Live Process Monitor</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PC ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processes.slice(0, 10).map((process: any, index: number) => (
                <tr key={process.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {process.process_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.pid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.pc_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Running
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {processes.length === 0 && (
          <div className="text-center py-4 text-gray-500">No processes found</div>
        )}
      </div>
    </div>
  );
} 