"use client";

import { useState, useEffect } from "react";
import { 
  Monitor, Cpu, HardDrive, Search, Filter, 
  Activity, Shield, Database, Eye, EyeOff, 
  CheckCircle, AlertTriangle, Clock, Settings
} from 'lucide-react';
import Link from 'next/link';

interface EnhancedEndpointsProps {
  assets: any[];
  processes: any[];
  software: any[];
  processLogs: any[];
  comparisonComponents: any[];
  comparisonResults: any[];
}

export default function EnhancedEndpoints({ assets, processes, software, processLogs, comparisonComponents, comparisonResults }: EnhancedEndpointsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [osFilter, setOsFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);

  useEffect(() => {
    if (comparisonComponents && comparisonComponents.length > 0) {
      console.log('Sample comparisonComponents:', comparisonComponents.slice(0, 3));
    }
  }, [comparisonComponents]);

  // Process data for visualization
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

  // Filter endpoints
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = (asset.asset_tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.os || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (asset.model || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOs = osFilter === 'all' || asset.os === osFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesOs && matchesStatus;
  });

  // Get unique OS types for filter
  const osTypes = ['all', ...Array.from(new Set(assets.map(asset => asset.os).filter(Boolean)))];

  // Get endpoint statistics
  const endpointStats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'active' || !a.status).length,
    offline: assets.filter(a => a.status === 'offline').length,
    maintenance: assets.filter(a => a.status === 'maintenance').length
  };

  // Get process count for each endpoint (join comparison_result and comparison_component)
  const getProcessCount = (assetId: number) => {
    // Find all comparisonResults for this endpoint
    const endpointResults = comparisonResults.filter((cr: any) => String(cr.pc_id) === String(assetId));
    if (endpointResults.length === 0) return 0;
    // Find the latest comparisonComponent of type 'processes' for these comparison_ids
    const latest = endpointResults
      .map((cr: any) => {
        const comps = comparisonComponents
          .filter((cc: any) => cc.component_type === 'processes' && cc.comparison_id === cr.comparison_id)
          .sort((a: any, b: any) => b.comparison_id - a.comparison_id);
        return comps[0];
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.comparison_id - a.comparison_id)[0];
    if (!latest) return 0;
    try {
      const parsed = latest.diff_json ? JSON.parse(latest.diff_json) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  // Get software count for each endpoint (join comparison_result and comparison_component)
  const getSoftwareCount = (assetId: number) => {
    // Find all comparisonResults for this endpoint
    const endpointResults = comparisonResults.filter((cr: any) => String(cr.pc_id) === String(assetId));
    if (endpointResults.length === 0) return 0;
    // Find the latest comparisonComponent of type 'software' for these comparison_ids
    const latest = endpointResults
      .map((cr: any) => {
        const comps = comparisonComponents
          .filter((cc: any) => cc.component_type === 'software' && cc.comparison_id === cr.comparison_id)
          .sort((a: any, b: any) => b.comparison_id - a.comparison_id);
        return comps[0];
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.comparison_id - a.comparison_id)[0];
    if (!latest) return 0;
    try {
      const parsed = latest.diff_json ? JSON.parse(latest.diff_json) : [];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Endpoint Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Monitor className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Endpoints</p>
              <p className="text-2xl font-bold text-blue-600">{endpointStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{endpointStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-red-600">{endpointStats.offline}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{endpointStats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* OS Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operating System Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {osDistribution.map((os, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{os.name}</p>
                  <p className="text-2xl font-bold text-blue-600">{os.value}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {((os.value / endpointStats.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={osFilter}
                onChange={(e) => setOsFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {osTypes.map(os => (
                  <option key={os} value={os}>
                    {os === 'all' ? 'All OS' : os}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="offline">Offline</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={showDetails ? "Hide details" : "Show details"}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset, index) => {
          // Ensure we have a valid id for navigation
          let endpointId = asset.pc_id;
          if (endpointId === undefined || endpointId === null) {
            console.warn('Asset missing pc_id:', asset);
            endpointId = asset.asset_tag || asset.serial_number || index;
          }
          return (
            <Link
              key={endpointId}
              href={`/endpoints/${endpointId}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer block focus:outline-none focus:ring-2 focus:ring-blue-500"
              tabIndex={0}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {asset.asset_tag || `Endpoint ${endpointId}`}
                    </h3>
                    <p className="text-sm text-gray-500">{asset.model || 'Unknown Model'}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {getStatusIcon(asset.status)}
                    <span className="ml-1">{asset.status || 'Active'}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Operating System:</span>
                    <span className="font-medium text-gray-900">{asset.os || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Serial Number:</span>
                    <span className="font-medium text-gray-900">{asset.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Processes:</span>
                    <span className="font-medium text-gray-900">{getProcessCount(asset.pc_id)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Software:</span>
                    <span className="font-medium text-gray-900">{getSoftwareCount(asset.pc_id)}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* No Results */}
      {filteredAssets.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
          <p className="text-gray-500">No endpoints match your current filters.</p>
        </div>
      )}

      {/* Process and Software Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Running Processes</h3>
          <div className="space-y-3">
            {processes.slice(0, 5).map((process, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{process.process_name}</p>
                    <p className="text-xs text-gray-500">PID: {process.pid}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">PC {process.pc_id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Software Installations</h3>
          <div className="space-y-3">
            {software.slice(0, 5).map((sw, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Database className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sw.display_name}</p>
                    <p className="text-xs text-gray-500">{sw.publisher}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">v{sw.display_version}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 