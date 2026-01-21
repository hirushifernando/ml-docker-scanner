import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "scanner_user",
  password: "StrongPass123!",
  database: "scanner_db",
});

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
      decision = "DENY",
      modelDecision = "NOT SECURE",
    } = await req.json();

    const totalVulns = critical + high + medium + low;

    /* ===============================
       1. INSERT SCAN RESULT
    =============================== */
    await connection.query(
      `INSERT INTO scan_results
       (image_name, image_tag, registry_type,
        critical_count, high_count, medium_count, low_count,
        decision, model_decision, scan_time, predicted_vulnerabilities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        image_name,
        image_tag,
        registry_type,
        critical,
        high,
        medium,
        low,
        decision,
        modelDecision,
        totalVulns,
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
