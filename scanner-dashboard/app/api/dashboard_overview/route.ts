// app/api/dashboard_overview/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host:"localhost",
    user:"scanner_user",
    password:"StrongPass123!",
    database:"scanner_db"
});

export async function GET() {
  try {
    const connection = await pool.getConnection();

    /* ===============================
       1. TOTAL SCANS
    =============================== */
    const [[total]]: any = await connection.query(
      `SELECT COUNT(*) AS total_scanned FROM scan_results`
    );

    /* ===============================
       2. SECURE vs NOT SECURE
    =============================== */
    const [[secure]]: any = await connection.query(
      `SELECT COUNT(*) AS secure_count 
       FROM scan_results 
       WHERE model_decision = 'SECURE'`
    );

    const [[notSecure]]: any = await connection.query(
      `SELECT COUNT(*) AS vulnerable_count 
       FROM scan_results 
       WHERE model_decision = 'NOT SECURE'`
    );

    /* ===============================
       3. CRITICAL ALERTS
    =============================== */
    const [[critical]]: any = await connection.query(
      `SELECT SUM(critical_count) AS critical_alerts FROM scan_results`
    );

    /* ===============================
       4. LAST SCAN TIME
    =============================== */
    const [[lastScan]]: any = await connection.query(
      `SELECT MAX(scan_time) AS last_scan_time FROM scan_results`
    );

    /* ===============================
       5. RECENT SCANS (TABLE)
    =============================== */
    const [recentScans]: any = await connection.query(
      `SELECT
        image_name,
        image_tag,
        registry_type,
        predicted_vulnerabilities,
        scan_time,
        model_decision,
        decision
      FROM scan_results
      ORDER BY scan_time DESC
      LIMIT 5`
    );


    /* ===============================
       6. VULNERABILITY BREAKDOWN
    =============================== */
    const [[breakdown]]: any = await connection.query(
      `SELECT 
        SUM(critical_count) AS critical,
        SUM(high_count) AS high,
        SUM(medium_count) AS medium,
        SUM(low_count) AS low
       FROM scan_results`
    );

    /* ===============================
       7. REGISTRY STATS
    =============================== */
    const [registries]: any = await connection.query(
      `SELECT 
        registry_type,
        SUM(CASE WHEN model_decision = 'SECURE' THEN 1 ELSE 0 END) AS secure,
        SUM(CASE WHEN model_decision = 'NOT SECURE' THEN 1 ELSE 0 END) AS anomalous
       FROM scan_results
       GROUP BY registry_type`
    );

    connection.release();

    /* ===============================
       FINAL DASHBOARD RESPONSE
    =============================== */
    return NextResponse.json({
      total_scanned: total.total_scanned,
      secure_count: secure.secure_count,
      vulnerable_count: notSecure.vulnerable_count,
      critical_alerts: critical.critical_alerts || 0,
      last_scan_time: lastScan.last_scan_time,
      recent_scans: recentScans,
      vulnerability_breakdown: breakdown,
      registries,
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

