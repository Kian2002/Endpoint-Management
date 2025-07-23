"use client";

import { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Monitor, Cpu, HardDrive, AlertTriangle, CheckCircle, Clock, 
  Activity, Shield, Database, TrendingUp, Users, Settings
} from 'lucide-react';
import RealTimeMonitor from './RealTimeMonitor';
import DataSummary from './DataSummary';

interface DataVisualizationProps {
  data: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DataVisualization({ data }: DataVisualizationProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Process data for visualizations
  const assets = data.pc_asset || [];
  const comparisonResults = data.comparison_result || [];
  const comparisonComponents = data.comparison_component || [];
  const processes = data.get_process_temp || [];
  const software = data.installed_software || [];
  const processLogs = data.process_log || [];

  // OS Distribution for pie chart
  const osDistribution = assets.reduce((acc: any[], asset: any) => {
    const os = asset.os || 'Unknown OS';
    const existing = acc.find(item => item.name === os);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: os, value: 1 });
    }
    return acc;
  }, []);

  // Process count by name (top 10)
  const processCount = processes.reduce((acc: any[], proc: any) => {
    const name = proc.process_name || 'Unknown';
    const existing = acc.find(item => item.name === name);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name, value: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 10);

  // Software publishers distribution
  const publisherDistribution = software.reduce((acc: any[], sw: any) => {
    const publisher = sw.publisher || 'Unknown';
    const existing = acc.find(item => item.name === publisher);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: publisher, value: 1 });
    }
    return acc;
  }, []).sort((a: any, b: any) => b.value - a.value).slice(0, 8);

  // Recent activity timeline
  const recentActivity = comparisonResults.slice(-10).reverse().map((result: any, index: number) => ({
    name: `Comparison ${index + 1}`,
    timestamp: new Date(result.snapshot_before_time || Date.now()).toLocaleDateString(),
    value: index + 1
  }));

  // Statistics cards data
  const stats = [
    {
      title: "Total Endpoints",
      value: assets.length,
      icon: Monitor,
      color: "bg-blue-500",
      change: "+2.5%"
    },
    {
      title: "Active Processes",
      value: processes.length,
      icon: Activity,
      color: "bg-green-500",
      change: "+1.2%"
    },
    {
      title: "Installed Software",
      value: software.length,
      icon: Database,
      color: "bg-purple-500",
      change: "+0.8%"
    },
    {
      title: "Recent Comparisons",
      value: comparisonResults.length,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "+5.1%"
    }
  ];

  // Normalize SideIndicator for logic
  const normalizeSideIndicator = (val: string | undefined) => {
    if (!val) return val;
    if (val === '= ' || val === '=>') return '=>';
    if (val === '<=') return '<=';
    return val;
  };

  // Severity classification logic (same as EnhancedAlerts)
  const classifySeverity = (componentType: string, detailsRaw: any): 'critical' | 'warning' | 'info' => {
    const details: any[] = Array.isArray(detailsRaw) ? detailsRaw : [];
    const nonEqualCount = details.filter((item: any) => {
      const indicator = normalizeSideIndicator(item.SideIndicator);
      return indicator && indicator !== '==';
    }).length;
    if (nonEqualCount > 5) return 'critical';
    if (nonEqualCount > 0) return 'warning';
    return 'info';
  };

  // Alert summary using new logic
  const alertSummary = (() => {
    let critical = 0, warning = 0, info = 0;
    comparisonComponents.forEach((comp: any) => {
      let details: any[] = [];
      try {
        const parsed = comp.diff_json ? JSON.parse(comp.diff_json) : [];
        details = Array.isArray(parsed) ? parsed : [];
      } catch {
        details = [];
      }
      const severity = classifySeverity(comp.component_type, details);
      if (severity === 'critical') critical++;
      else if (severity === 'warning') warning++;
      else info++;
    });
    return { critical, warning, info };
  })();

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <DataSummary data={data} />
      
      {/* Real-Time Monitor */}
      <RealTimeMonitor data={data} />
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600">{stat.change} from last month</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-red-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alertSummary.critical}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{alertSummary.warning}</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Info</p>
              <p className="text-2xl font-bold text-blue-600">{alertSummary.info}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Monitor },
              { id: 'endpoints', name: 'Endpoints', icon: Cpu },
              { id: 'processes', name: 'Processes', icon: Activity },
              { id: 'software', name: 'Software', icon: Database },
              { id: 'activity', name: 'Activity', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Operating System Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                                         <Pie
                       data={osDistribution}
                       cx="50%"
                       cy="50%"
                       labelLine={false}
                       label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                       outerRadius={80}
                       fill="#8884d8"
                       dataKey="value"
                     >
                       {osDistribution.map((entry: any, index: number) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assets.map((asset: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{asset.asset_tag || `Endpoint ${index + 1}`}</h5>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>OS:</strong> {asset.os || 'Unknown'}</p>
                      <p><strong>Model:</strong> {asset.model || 'Unknown'}</p>
                      <p><strong>Serial:</strong> {asset.serial_number || 'Unknown'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processes Tab */}
          {activeTab === 'processes' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Top Running Processes</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={processCount} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Software Publishers</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={publisherDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">System Activity Timeline</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 