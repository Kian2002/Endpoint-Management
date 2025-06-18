"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="p-8 space-y-12">
      {/* Process Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Running Processes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Name</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.get_process_temp.map((proc: any) => (
                <tr key={proc.id}>
                  <td className="px-4 py-2 text-sm">{proc.pid}</td>
                  <td className="px-4 py-2 text-sm">{proc.process_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Installed Software */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Installed Software</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Publisher</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Install Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.installed_software.map((sw: any) => (
                <tr key={sw.id}>
                  <td className="px-4 py-2 text-sm">{sw.display_name}</td>
                  <td className="px-4 py-2 text-sm">{sw.display_version}</td>
                  <td className="px-4 py-2 text-sm">{sw.publisher}</td>
                  <td className="px-4 py-2 text-sm">{sw.install_date || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Process Log */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Process Log</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Process Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Memory (KB)</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CPU Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Logged At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.process_log.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-sm">{log.process_name}</td>
                  <td className="px-4 py-2 text-sm">{log.pid}</td>
                  <td className="px-4 py-2 text-sm">{log.memory_kb}</td>
                  <td className="px-4 py-2 text-sm">{log.cpu_time ?? "-"}</td>
                  <td className="px-4 py-2 text-sm">{log.logged_at ? new Date(log.logged_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
} 