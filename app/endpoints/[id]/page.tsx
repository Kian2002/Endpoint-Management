"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import DataVisualization from "../../components/DataVisualization";
import { AlertTriangle, CheckCircle, Info, XCircle, Clock, Activity, Eye, EyeOff } from 'lucide-react';

export default function EndpointDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  // All hooks at the top
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const toggleExpand = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const [comparisonPage, setComparisonPage] = useState(1);
  const comparisonsPerPage = 5;

  // Pagination for processes and software
  const [processPage, setProcessPage] = useState(1);
  const [softwarePage, setSoftwarePage] = useState(1);
  const itemsPerPage = 10;

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
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: Reset to page 1 if endpoint changes
  useEffect(() => {
    setComparisonPage(1);
  }, [id]);

  // Reset process/software page if endpoint or data changes
  useEffect(() => {
    setProcessPage(1);
    setSoftwarePage(1);
  }, [id, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading endpoint details...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  if (!data) return null;

  // Debug: log id and all endpoint ids
  console.log('URL param id:', id);
  console.log('All pc_asset ids:', (data.pc_asset || []).map((a: any) => a.id));

  // Find the endpoint asset (fallback to asset_tag or serial_number if id is missing)
  const endpoint = (data.pc_asset || []).find((a: any) => {
    return String(a.pc_id) === String(id) || String(a.asset_tag) === String(id) || String(a.serial_number) === String(id);
  });
  if (!endpoint) {
    return <div className="p-8 text-center text-red-500">Endpoint not found.</div>;
  }

  // Related data (must be after endpoint is found)
  const endpointComparisons = (data.comparison_result || []).filter((c: any) => String(c.pc_id) === String(endpoint.pc_id));
  const endpointComponents = (data.comparison_component || []).filter((comp: any) => {
    // Find all comparison_components for this endpoint's comparison_results
    return endpointComparisons.some((cr: any) => cr.comparison_id === comp.comparison_id);
  });
  const totalPages = Math.ceil(endpointComparisons.length / comparisonsPerPage);
  const paginatedComparisons = endpointComparisons.slice((comparisonPage - 1) * comparisonsPerPage, comparisonPage * comparisonsPerPage);

  // Extract latest processes/software from the most recent comparison_component
  function getLatestComponentDetails(type: string) {
    // Find the most recent comparison_component of this type
    const sorted = endpointComponents
      .filter((cc: any) => cc.component_type === type)
      .sort((a: any, b: any) => b.comparison_id - a.comparison_id);
    if (sorted.length === 0) return [];
    return parseDiffJson(sorted[0].diff_json);
  }
  const latestProcesses = getLatestComponentDetails('processes');
  const latestSoftware = getLatestComponentDetails('software');

  // Paginate processes and software (must be after latestProcesses/latestSoftware)
  const paginatedProcesses = latestProcesses.slice((processPage - 1) * itemsPerPage, processPage * itemsPerPage);
  const processTotalPages = Math.ceil(latestProcesses.length / itemsPerPage);
  const paginatedSoftware = latestSoftware.slice((softwarePage - 1) * itemsPerPage, softwarePage * itemsPerPage);
  const softwareTotalPages = Math.ceil(latestSoftware.length / itemsPerPage);

  // Helper to parse diff_json safely
  function parseDiffJson(diff_json: string) {
    try {
      const parsed = diff_json ? JSON.parse(diff_json) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Helper: Normalize SideIndicator
  function normalizeSideIndicator(val: string | undefined) {
    if (!val) return val;
    if (val === '=>') return '=>';
    if (val === '<=') return '<=';
    return val;
  }

  // Helper: Classify severity
  function classifySeverity(componentType: string, detailsRaw: any): 'critical' | 'warning' | 'info' {
    const details: any[] = Array.isArray(detailsRaw) ? detailsRaw : [];
    const nonEqualCount = details.filter((item: any) => {
      const indicator = normalizeSideIndicator(item.SideIndicator);
      return indicator && indicator !== '==';
    }).length;
    if (nonEqualCount > 5) return 'critical';
    if (nonEqualCount > 0) return 'warning';
    return 'info';
  }

  // Helper: Render SideIndicator with color
  function renderSideIndicator(indicator: string | undefined) {
    if (indicator === '==') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 font-semibold">==</span>;
    }
    if (indicator === '=>') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">=&gt;</span>;
    }
    if (indicator === '<=') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 font-semibold">&lt;=</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">{indicator || '-'}</span>;
  }

  // Helper: Render details table for processes/software (copy from EnhancedAlerts)
  function renderDetailsTable(componentType: string, details: any[]) {
    if (!Array.isArray(details) || details.length === 0) return <div className="text-gray-400 italic">No details</div>;
    if (componentType === 'processes') {
      return (
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">Id</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">Name</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">StartTime</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">Path</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">SideIndicator</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {details.map((item: any, idx: number) => {
              const indicator = normalizeSideIndicator(item.SideIndicator);
              return (
                <tr key={idx}>
                  <td className="px-2 py-1 whitespace-nowrap">{item.Id || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.Name || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.StartTime || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.Path || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{renderSideIndicator(indicator)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    if (componentType === 'software') {
      return (
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">DisplayName</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">DisplayVersion</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">Publisher</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">InstallDate</th>
              <th className="px-2 py-1 text-left font-semibold text-gray-600">SideIndicator</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {details.map((item: any, idx: number) => {
              const indicator = normalizeSideIndicator(item.SideIndicator);
              return (
                <tr key={idx}>
                  <td className="px-2 py-1 whitespace-nowrap">{item.DisplayName || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.DisplayVersion || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.Publisher || '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{item.InstallDate ? new Date(item.InstallDate).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{renderSideIndicator(indicator)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    // Fallback: generic key-value table
    const keys = Array.from(new Set(details.flatMap((item: any) => Object.keys(item))));
    return (
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead className="bg-gray-50">
          <tr>
            {keys.map((key) => (
              <th key={key} className="px-2 py-1 text-left font-semibold text-gray-600">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {details.map((item: any, idx: number) => (
            <tr key={idx}>
              {keys.map((key) => (
                <td key={key} className="px-2 py-1 whitespace-nowrap">{typeof item[key] === 'object' && item[key] !== null ? JSON.stringify(item[key]) : (item[key] !== undefined ? String(item[key]) : '-')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="endpoints" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          className="mb-4 text-blue-600 hover:underline"
          onClick={() => router.push("/endpoints")}
        >
          &larr; Back to Endpoints
        </button>
        <h1 className="text-2xl font-bold mb-2">Endpoint Details</h1>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{endpoint.asset_tag || `Endpoint ${endpoint.pc_id}`}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(endpoint).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm border-b py-1">
                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                <span>{String(value) || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Processes</h3>
            {latestProcesses.length === 0 ? (
              <p className="text-gray-500">No processes found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">{renderDetailsTable('processes', paginatedProcesses)}</div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => setProcessPage((p) => Math.max(1, p - 1))}
                    disabled={processPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-700">Page {processPage} of {processTotalPages}</span>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => setProcessPage((p) => Math.min(processTotalPages, p + 1))}
                    disabled={processPage === processTotalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Installed Software</h3>
            {latestSoftware.length === 0 ? (
              <p className="text-gray-500">No software found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">{renderDetailsTable('software', paginatedSoftware)}</div>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => setSoftwarePage((p) => Math.max(1, p - 1))}
                    disabled={softwarePage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-xs text-gray-700">Page {softwarePage} of {softwareTotalPages}</span>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => setSoftwarePage((p) => Math.min(softwareTotalPages, p + 1))}
                    disabled={softwarePage === softwareTotalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Comparison Reports</h3>
          {endpointComparisons.length === 0 ? (
            <p className="text-gray-500">No comparison reports found.</p>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedComparisons.map((comp: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg shadow border border-blue-100">
                    <div className="px-4 py-2 border-b border-blue-200 bg-blue-50 rounded-t-lg flex items-center justify-between">
                      <span className="font-semibold text-blue-800">Comparison ID: {comp.comparison_id}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {comp.snapshot_before_time ? new Date(comp.snapshot_before_time).toLocaleString() : '-'}
                        {comp.snapshot_after_time ? ` → ${new Date(comp.snapshot_after_time).toLocaleString()}` : ''}
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div><span className="font-medium">Result:</span> {comp.result_summary || 'N/A'}</div>
                      {/* Show related comparison components for this comparison */}
                      {endpointComponents.filter((cc: any) => cc.comparison_id === comp.comparison_id).map((cc: any, ccIdx: number) => {
                        const details = parseDiffJson(cc.diff_json);
                        const severity = classifySeverity(cc.component_type, details);
                        const severityLabel = severity.toUpperCase();
                        const severityColor = severity === 'critical' ? 'bg-red-100 text-red-800' : severity === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800';
                        const key = `${comp.comparison_id}-${cc.id}`;
                        return (
                          <div key={key} className="bg-white rounded-lg shadow border-l-4 border-blue-200">
                            <div className="flex items-start justify-between p-2">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-xs font-medium text-gray-900">Component: {cc.component_type}</h4>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>{severityLabel}</span>
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
                            {expanded[key] && (
                              <div className="mt-2 pb-4 px-4">
                                <div className="overflow-x-auto">
                                  {renderDetailsTable(cc.component_type, details)}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => setComparisonPage((p) => Math.max(1, p - 1))}
                  disabled={comparisonPage === 1}
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">Page {comparisonPage} of {totalPages}</span>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => setComparisonPage((p) => Math.min(totalPages, p + 1))}
                  disabled={comparisonPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
        </div>
    </div>
  );
} 