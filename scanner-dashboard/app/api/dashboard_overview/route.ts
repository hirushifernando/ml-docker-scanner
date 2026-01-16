
// app/api/dashboard_overview/route.ts
import { NextRequest, NextResponse } from "next/server";

// This is a mock API for the new Overview Dashboard.
// Later you can fetch real data from your database here.

export async function GET(req: NextRequest) {
  try {
    const data = {
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
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
