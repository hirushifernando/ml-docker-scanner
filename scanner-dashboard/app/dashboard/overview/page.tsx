"use client";

import React, { useEffect, useState } from "react";
import MetricCard from "@/components/MetricCard";
import RecentScansTable from "@/components/RecentScansTable";
import VulnerabilityDonut from "@/components/VulnerabilityDonut";
import RegistryOverview from "@/components/RegistryOverview";
import SecurityAlertsList from "@/components/SecurityAlertsList";
import DeploymentTrendChart from "@/components/DeploymentTrendChart";
import DeploymentBarChart from "@/components/DeploymentBarChart";
import { getOverviewData } from "../services/overviewService";
import { useAlertContext } from "@/app/layout"; 

export default function OverviewDashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { unseenAlerts, setUnseenAlerts } = useAlertContext();

  /* ================== FETCH DASHBOARD DATA ================== */
  const fetchOverview = async () => {

    try {

      const data = await getOverviewData();

      console.log("Dashboard API response:", data);

      const mappedRecentScans = (data.recent_scans || []).map((s: any) => ({
        image_name: s.image || s.image_name,
        image_tag: s.tag || s.image_tag,
        registry_type: s.registry_type,
        predicted_vulnerabilities: s.vulnerabilities ?? s.predicted_vulnerabilities ?? 0,
        scan_time: s.scanned_at || s.scan_time,
        supervised_decision: s.supervised_decision,
        supervised_result: s.supervised_result,
        anomaly_decision: s.anomaly_decision,
        anomaly_result: s.anomaly_result,
        final_decision: s.final_decision,
        final_result: s.final_result
      }));

       // Calculate totals from deployment_trend
       const deploymentTrend = data.deployment_trend || [];
        const deploymentTotals = deploymentTrend.reduce(
          (acc: any, item: any) => {
            acc.deployed += item.deployed || 0;
            acc.blocked += item.blocked || 0;
            acc.pending += item.pending || 0;
            return acc;
          },
          { deployed: 0, blocked: 0, pending: 0 }
        );
      
      setOverview({
        ...data,
        recent_scans: mappedRecentScans,
        deployment_trend: deploymentTrend,
        pending_count: deploymentTotals.pending,  // optional if you want to track separately
        deploymentTotals, // store totals for bar chart
      });

      setUnseenAlerts(data.unseen_alerts || 0);

    } catch (err) {

      console.error("Failed to fetch overview:", err);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading dashboard...</p>;
  if (!overview) return <p className="p-6 text-red-500">Failed to load dashboard</p>;

  /* ================== HANDLER WHEN ALERT IS VIEWED ================== */
  const handleAlertViewed = (alertId: number) => {
    // Optimistic UI update
    setUnseenAlerts(Math.max(0, unseenAlerts - 1));

    fetch("/api/security_alerts/mark_seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId })
    }).catch(console.error);
  };

  const lastUpdated = overview.last_scan_time || new Date().toLocaleString();


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
          value={unseenAlerts} // reactive count
          timestamp={overview.last_scan_time}
          color="yellow"
        />
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentScansTable scans={overview.recent_scans} />
        </div>
        <div className="md:col-span-1">
          <VulnerabilityDonut data={overview.vulnerability_breakdown} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RegistryOverview registries={overview.registries} />
        <SecurityAlertsList
          alerts={overview.alerts}
          onAlertViewed={handleAlertViewed} // pass handler to child
        />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeploymentTrendChart
            data={overview.deployment_trend || []}
          />
        </div>
        <div className="lg:col-span-1 h-full">
          <DeploymentBarChart
            totalDeployed={overview.deploymentTotals.deployed}
            totalBlocked={overview.deploymentTotals.blocked}
            totalPending={overview.deploymentTotals.pending}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>
    </div>
  );
}
