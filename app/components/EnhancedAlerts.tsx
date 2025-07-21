"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, CheckCircle, Info, XCircle, Filter, 
  Clock, Activity, Shield, Eye, EyeOff
} from 'lucide-react';

interface EnhancedAlertsProps {
  comparisonComponents: any[];
  comparisonResults: any[];
}

export default function EnhancedAlerts({ comparisonComponents, comparisonResults }: EnhancedAlertsProps) {
  const [filter, setFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Process alerts data
  const alerts = comparisonComponents.map((comp: any) => ({
    id: comp.id,
    type: comp.component_type || 'info',
    timestamp: comp.created_at || new Date().toISOString(),
    details: comp.diff_json ? JSON.parse(comp.diff_json) : {},
    severity: comp.component_type === 'critical' ? 'high' : 
              comp.component_type === 'warning' ? 'medium' : 'low',
    title: `System ${comp.component_type || 'change'} detected`,
    description: `Component change detected in comparison ${comp.comparison_id}`
  }));

  // Filter alerts based on current filter
  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.type === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Normalize SideIndicator for logic and display
  const normalizeSideIndicator = (val: string | undefined) => {
    if (!val) return val;
    if (val === '=\u003e' || val === '=>') return '=>';
    if (val === '\u003c=' || val === '<=') return '<=';
    return val;
  };

  // Classification system for severity
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

  // Alert statistics using new severity logic
  const alertStats = (() => {
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
    return {
      total: comparisonComponents.length,
      critical,
      warning,
      info
    };
  })();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Filter and search logic for alert groups
  const filteredComponents = comparisonComponents.filter((comp: any) => {
    // Severity filter
    let details: any[] = [];
    try {
      const parsed = comp.diff_json ? JSON.parse(comp.diff_json) : [];
      details = Array.isArray(parsed) ? parsed : [];
    } catch {
      details = [];
    }
    const severity = classifySeverity(comp.component_type, details);
    const matchesFilter = filter === 'all' ||
      (filter === 'critical' && severity === 'critical') ||
      (filter === 'warning' && severity === 'warning') ||
      (filter === 'info' && severity === 'info');
    // Search filter
    const title = `System ${comp.component_type || 'change'} detected`;
    const description = `Component change detected in comparison ${comp.comparison_id}`;
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Group filtered components by comparison_id
  const groupedAlerts = filteredComponents.reduce((acc: any, comp: any) => {
    const comparisonId = comp.comparison_id;
    if (!acc[comparisonId]) acc[comparisonId] = [];
    acc[comparisonId].push(comp);
    return acc;
  }, {});

  // Helper to get details from a group of components
  const getDetailsRows = (comps: any[], showAll: boolean) => {
    return comps.flatMap((comp: any) => {
      const details = comp.diff_json ? JSON.parse(comp.diff_json) : [];
      if (!Array.isArray(details)) return [];
      return details.filter((item: any) => showAll || item.SideIndicator !== '==');
    });
  };

  // State for expanded subcomponents
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // State for paginating recent comparison results
  const [recentLimit, setRecentLimit] = useState(5);
  const handleLoadMore = () => setRecentLimit((prev) => prev + 5);

  // State for paginating alert groups
  const [alertGroupLimit, setAlertGroupLimit] = useState(5);
  const handleLoadMoreAlerts = () => setAlertGroupLimit((prev) => prev + 5);

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{alertStats.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{alertStats.warning}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Info</p>
              <p className="text-2xl font-bold text-blue-600">{alertStats.info}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-green-600">{alertStats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {[ 
                { key: 'all', label: 'All', count: alertStats.total },
                { key: 'critical', label: 'Critical', count: alertStats.critical },
                { key: 'warning', label: 'Warning', count: alertStats.warning },
                { key: 'info', label: 'Info', count: alertStats.info }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-8">
        {Object.keys(groupedAlerts).length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">No alerts match your current filters.</p>
          </div>
        ) : (
          (Object.entries(groupedAlerts) as [string, any[]][])
            .slice(0, alertGroupLimit)
            .map(([comparisonId, comps]) => (
              <div key={comparisonId} className="bg-white rounded-lg shadow border border-blue-100">
                <div className="px-4 py-2 border-b border-blue-200 bg-blue-50 rounded-t-lg">
                  <span className="font-semibold text-blue-800">Comparison ID: {comparisonId}</span>
                </div>
                <div className="p-4 space-y-4">
                  {comps.map((comp: any) => {
                    let details: any[] = [];
                    try {
                      const parsed = comp.diff_json ? JSON.parse(comp.diff_json) : [];
                      details = Array.isArray(parsed) ? parsed : [];
                    } catch {
                      details = [];
                    }
                    const severity = classifySeverity(comp.component_type, details);
                    const severityLabel = severity.toUpperCase();
                    const severityColor = severity === 'critical' ? 'bg-red-100 text-red-800' : severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
                    const key = `${comparisonId}-${comp.id}`;
                    return (
                      <div key={key} className="bg-white rounded-lg shadow border-l-4 border-blue-200">
                        <div className="flex items-start justify-between p-4">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900">System {comp.component_type} detected</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>{severityLabel}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Component change detected in comparison {comp.comparison_id}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{comp.created_at ? new Date(comp.created_at).toLocaleString() : '-'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Activity className="h-3 w-3" />
                                <span>ID: {comp.id}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleExpand(key)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title={expanded[key] ? 'Hide details' : 'Show details'}
                          >
                            {expanded[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {expanded[key] && Array.isArray(details) && details.length > 0 && (
                          <div className="mt-2 pb-4 px-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">Name</th>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">Manufacturer</th>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">DeviceID</th>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">DriverVersion</th>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">DriverDate</th>
                                    <th className="px-2 py-1 text-left font-semibold text-gray-600">SideIndicator</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                  {details.map((item: any, idx: number) => {
                                    const indicator = normalizeSideIndicator(item.SideIndicator);
                                    return (
                                      <tr key={idx}>
                                        <td className="px-2 py-1 whitespace-nowrap">{item.Name || '-'}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">{item.Manufacturer || '-'}</td>
                                        <td className="px-2 py-1 whitespace-nowrap max-w-xs truncate" title={item.DeviceID}>{item.DeviceID || '-'}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">{item.DriverVersion || '-'}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">{item.DriverDate ? new Date(item.DriverDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                          {indicator === '==' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">==</span>
                                          )}
                                          {indicator === '=>' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">=&gt;</span>
                                          )}
                                          {indicator === '<=' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold">&lt;=</span>
                                          )}
                                          {indicator !== '==' && indicator !== '=>' && indicator !== '<=' && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">{indicator || '-'}</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
        {Object.keys(groupedAlerts).length > alertGroupLimit && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMoreAlerts}
              className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* Recent Comparison Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Comparison Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comparison ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PC ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Before
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compared By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparisonResults.slice(-recentLimit).map((result: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.comparison_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {result.pc_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.snapshot_before_time ? new Date(result.snapshot_before_time).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.snapshot_after_time ? new Date(result.snapshot_after_time).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.compared_by || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comparisonResults.length > recentLimit && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 