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

  useEffect(() => {
    getOverviewData().then(setOverview);
  }, []);

  if (!overview) return <p className="p-6 text-gray-500">Loading dashboard...</p>;

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
          value={overview.critical_alerts}
          timestamp={overview.last_scan_time}
          color="yellow"
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2/3 width */}
        <div className="md:col-span-2">
          <RecentScansTable
            scans={[
              { id: 1, image_name: "myapp-prod:v3.4", registry: "Public", vulnerabilities: 5, size: "120MB", status: "Secure", scanned_at: "2026-01-15T10:00:00Z" },
              { id: 2, image_name: "backend:v2.1", registry: "Private", vulnerabilities: 2, size: "95MB", status: "Anomalous", scanned_at: "2026-01-15T09:30:00Z" },
              { id: 3, image_name: "frontend:v1.5", registry: "Public", vulnerabilities: 0, size: "110MB", status: "Secure", scanned_at: "2026-01-14T16:45:00Z" },
              { id: 4, image_name: "db-service:v1.2", registry: "Private", vulnerabilities: 1, size: "200MB", status: "Secure", scanned_at: "2026-01-14T15:20:00Z" },
              { id: 5, image_name: "api-gateway:v3.0", registry: "Public", vulnerabilities: 3, size: "150MB", status: "Anomalous", scanned_at: "2026-01-14T14:10:00Z" },
              { id: 6, image_name: "worker:v2.3", registry: "Private", vulnerabilities: 0, size: "80MB", status: "Secure", scanned_at: "2026-01-14T13:05:00Z" },
            ]}
          />
        </div>


        {/* 1/3 width */}
        <div className="md:col-span-1">
          <VulnerabilityDonut data={overview.vulnerability_breakdown} />
        </div>
      </div>


      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegistryOverview registries={overview.registries} />
         <SecurityAlertsList
        alerts={[
          {
            id: 1,
            severity: "High",
            title: "Vulnerability detected in myapp-prod:v3.4",
            timestamp: "Detected 10 mins ago",
          },
          {
            id: 2,
            severity: "High",
            title: "Vulnerability detected in myapp-prod:v3.4",
            timestamp: "Detected 10 mins ago",
          },
          {
            id: 3,
            severity: "High",
            title: "Vulnerability detected in myapp-prod:v3.4",
            timestamp: "Detected 10 mins ago",
          },
          {
            id: 4,
            severity: "High",
            title: "Vulnerability detected in myapp-prod:v3.4",
            timestamp: "Detected 10 mins ago",
          },
          {
            id: 5,
            severity: "High",
            title: "Vulnerability detected in myapp-prod:v3.4",
            timestamp: "Detected 10 mins ago",
          },
        ]}
      />
      </div>
    </div>
  );
}
