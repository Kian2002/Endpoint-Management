"use client";

import { useEffect, useState } from "react";
import DataVisualization from "./DataVisualization";

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
    <div className="p-6">
      <DataVisualization data={data} />
    </div>
  );
} 