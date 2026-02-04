

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const conn = await mysql.createConnection({
      port: 3306,
      ssl: false,
      host:"localhost",
      user:"scanner_user",
      password:"StrongPass123!",
      database:"scanner_db"
    });

    const [rows] = await conn.execute(
      "SELECT * FROM scan_results ORDER BY id DESC LIMIT 10"
    );

    await conn.end();

    // Map over rows to parse result_json
    const data = rows.map((row) => ({
      image_name: row.image_name,
      image_tag: row.image_tag,
      registry_type: row.registry_type,
      predicted_vulnerabilities: row.predicted_vulnerabilities,
      critical_count: row.critical_count,
      high_count: row.high_count,
      medium_count: row.medium_count,
      low_count: row.low_count,
      supervised_decision: row.supervised_decision,
      supervised_result: row.supervised_result,
      anomaly_decision: row.anomaly_decision,
      anomaly_result: row.anomaly_result,
      final_decision: row.final_decision,
      final_result: row.final_result,
      supervised_explanation: row.supervised_explanation,
      classification_explanation: row.classification_explanation,
      unsupervised_explanation: row.unsupervised_explanation,
      interpretation: row.interpretation,
      ml_timestamp: row.ml_timestamp,
      scan_time: row.scan_time
  }));




    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan results", details: error.message },
      { status: 500 }
    );
  }
}
