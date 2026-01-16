"use client"; // important for client-side hooks
import { useState, useEffect } from "react";

import ScanSummaryCard from "@/components/ScanSummaryCard";
import SupervisedPanel from "@/components/SupervisedPanel";
import UnsupervisedPanel from "@/components/UnsupervisedPanel";
import InterpretationBox from "@/components/InterpretationBox";

import { getScanResults } from "./services/scanService";


export default function DashboardPage() {
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await getScanResults();
      setScanResults(data);
      setLoading(false);
    }
    fetchData();
  }, []);


  if (loading) {
    return <p className="p-6 text-gray-500">Loading scan results...</p>;
  }

  if (!scanResults.length) {
    return <p className="p-6 text-gray-500">No scan data available</p>;
  }

  const latestScan = scanResults[0];


  return (
    <main className="p-6 space-y-6">
      {/* ================= PAGE TITLE ================= */}
      <h1 className="text-lg md:text-md font-bold uppercase text-gray-300">
        Scan Result
      </h1>
      {/* You can pass the latest scan result to your components */}
      <ScanSummaryCard scan={latestScan} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupervisedPanel scan={latestScan} />
        <UnsupervisedPanel scan={latestScan} />
      </div>

      <InterpretationBox scan={latestScan}/>
    </main>
  );
}

