"use client";

import React, { useEffect, useState } from "react";
import MetricCard from "@/components/MetricCard";
import RecentScansTable from "@/components/RecentScansTable";
import VulnerabilityDonut from "@/components/VulnerabilityDonut";
import RegistryOverview from "@/components/RegistryOverview";
import SecurityAlertsList from "@/components/SecurityAlertsList";
import { getOverviewData } from "../services/overviewService";

export default function OverviewDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    getOverviewData()
      .then((data) => {
        /* =====================================================
           ✅ MAP BACKEND → UI SHAPE (IMPORTANT FIX)
        ===================================================== */
        const mappedRecentScans = data.recent_scans.map((s: any) => ({
          image_name: s.image || s.image_name,
          image_tag: s.tag || s.image_tag,
          registry_type: s.registry_type,    
          predicted_vulnerabilities: s.vulnerabilities ?? 0,
          scan_time: s.scanned_at || s.scan_time,
          model_decision: s.model_decision,              
          decision: s.decision 
        }));

        setOverview({
          ...data,
          recent_scans: mappedRecentScans, // 🔥 overwrite with mapped data
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="p-6 text-gray-500">Loading dashboard...</p>;

  if (!overview)
    return <p className="p-6 text-red-500">Failed to load dashboard</p>;

  return (
    <div className="p-6 space-y-6">
      {/* ================= PAGE TITLE ================= */}
      <div>
        <h1 className="text-lg md:text-md font-bold uppercase text-gray-300">
          Dashboard
        </h1>
      </div>
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard
          icon="docker"
          title="Total Scanned Docker Images"
          value={overview.total_scanned}
          timestamp={overview.last_scan_time}
          color="blue"
        />
        <MetricCard
          icon="warning"
          title="Total Vulnerable Docker Images"
          value={overview.vulnerable_count}
          timestamp={overview.last_scan_time}
          color="red"
        />
        <MetricCard
          icon="shield"
          title="Total Secure Docker Images"
          value={overview.secure_count}
          timestamp={overview.last_scan_time}
          color="green"
        />
        <MetricCard
          icon="info"
          title="Total Unseen Critical Alerts"
          value={overview.unseen_alerts}
          timestamp={overview.last_scan_time}
          color="yellow"
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2/3 width */}
        <div className="md:col-span-2">
          <RecentScansTable scans={overview.recent_scans} />
        </div>


        {/* 1/3 width */}
        <div className="md:col-span-1">
          <VulnerabilityDonut data={overview.vulnerability_breakdown} />
        </div>
      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegistryOverview registries={overview.registries} />
        <SecurityAlertsList alerts={overview.alerts} />
      </div>
    </div>
  );
}
