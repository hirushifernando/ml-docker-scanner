import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "scanner_user",
  password: "StrongPass123!",
  database: "scanner_db",
});

/* ===============================
   GET /api/scans - Fetch scan results
=============================== */
export async function GET() {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      `SELECT
         image_name,
         image_tag,
         registry_type,
         predicted_vulnerabilities,
         supervised_explanation,
         supervised_result,
         supervised_decision,
         unsupervised_explanation,
         anomaly_result,
         anomaly_decision,
         scan_time,
         final_decision,
         final_result
       FROM scan_results
       ORDER BY scan_time DESC
       LIMIT 10`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Scan fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan results", details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

/* ===============================
   POST /api/scans - Insert scan result
=============================== */
export async function POST(req: Request) {
  const connection = await pool.getConnection();

  try {
    const {
      image_name,
      image_tag,
      registry_type = "public",
      critical = 0,
      high = 0,
      medium = 0,
      low = 0,
      supervised_explanation = "",
      supervised_result = "NOT_SECURE",
      supervised_decision = "DENY",
      unsupervised_explanation = "",
      anomaly_result = "NORMAL",
      anomaly_decision = "DENY",
      finalDecision = "DENY",
      finalResult = "NOT_SAFE",
    } = await req.json();

    const totalVulns = critical + high + medium + low;

    /* ===============================
       1. INSERT SCAN RESULT
    =============================== */
    await connection.query(
      `INSERT INTO scan_results
        (image_name, image_tag, registry_type,
         critical_count, high_count, medium_count, low_count,
         supervised_explanation, supervised_result, supervised_decision,
         unsupervised_explanation, anomaly_result, anomaly_decision,
         final_decision, final_result, scan_time, predicted_vulnerabilities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
    [
    image_name,
    image_tag,
    registry_type,
    critical,
    high,
    medium,
    low,
    supervised_explanation, 
    supervised_result,     
    supervised_decision,   
    unsupervised_explanation,
    anomaly_result,
    anomaly_decision,
    finalDecision,
    finalResult,
    totalVulns
  ]
);


    /* ===============================
       2. ALERT LOGIC (CRITICAL / HIGH)
    =============================== */
    const criticalHighCount = critical + high;

    if (criticalHighCount > 0) {
      const severity = critical > 0 ? "Critical" : "High";
      const title = `${image_name}:${image_tag} has ${criticalHighCount} critical/high vulnerabilities`;

      // prevent duplicate alerts
      await connection.query(
        `INSERT INTO security_alerts (severity, title, timestamp, seen)
         SELECT ?, ?, NOW(), 0
         FROM DUAL
         WHERE NOT EXISTS (
           SELECT 1 FROM security_alerts
           WHERE title = ?
         )`,
        [severity, title, title]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Scan insert error:", error);
    return NextResponse.json(
      { error: "Failed to save scan result", details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
