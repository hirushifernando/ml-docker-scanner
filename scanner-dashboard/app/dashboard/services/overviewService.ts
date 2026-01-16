
export const getOverviewData = async () => {
  // Mock data, replace with real API call to /api/dashboard_overview/route.ts
  return Promise.resolve({
    total_scanned: 128,
    vulnerable_count: 15,
    secure_count: 113,
    critical_alerts: 3,
    last_scan_time: new Date().toLocaleString(),
    recent_scans: [
      { id: 1, image: "app-backend:v1.2", status: "Secure", scanned_at: "2026-01-13 10:00" },
      { id: 2, image: "db-service:v3.1", status: "Anomalous", scanned_at: "2026-01-13 09:30" },
      { id: 3, image: "cache:v2.5", status: "Secure", scanned_at: "2026-01-13 09:15" },
    ],
    vulnerability_breakdown: { critical: 3, high: 7, medium: 10, low: 5 },
    registries: [
      { type: "Public", secure: 23, anomalous: 2 },
      { type: "Private", secure: 90, anomalous: 5 },
    ],
    alerts: [
      { id: 1, severity: "High", title: "Critical vulnerability found", timestamp: "2026-01-13 10:05" },
      { id: 2, severity: "Medium", title: "Unpatched dependency", timestamp: "2026-01-13 09:50" },
      { id: 3, severity: "High", title: "Docker image anomaly detected", timestamp: "2026-01-13 09:40" },
    ],
  });
};
