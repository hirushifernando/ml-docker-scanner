

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
    const data = rows.map((row) => {
    const parsedResult =
      row.result_json && typeof row.result_json === "string"
        ? JSON.parse(row.result_json)
        : row.result_json || {};

    return {
      id: row.id,
      image_name: row.image_name,
      registry_type: row.registry_type,
      vulnerabilities: parsedResult.predicted_vulnerabilities || 0,
      anomaly_detected: parsedResult.anomaly_detected || false,
      severity: row.severity,
      decision: row.decision,
      supervised_explanation: parsedResult.supervised_explanation || null,
      regression_explanation: parsedResult.regression_explanation || null,
      classification_explanation: parsedResult.classification_explanation || null,
      unsupervised_explanation: parsedResult.unsupervised_explanation || null,
      model_decision: parsedResult.model_decision || null,
      ml_timestamp: parsedResult.timestamp || null,
      Critical: parsedResult.Critical || 0,
      High: parsedResult.High || 0,
      Medium: parsedResult.Medium || 0,
      Low: parsedResult.Low || 0,
    };
  });



    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scan results", details: error.message },
      { status: 500 }
    );
  }
}
