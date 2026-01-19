// scanner-dashboard/app/api/security_alerts/mark_seen/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "scanner_user",
  password: "StrongPass123!",
  database: "scanner_db",
});

export async function POST(req: Request) {
  try {
    const { alertId } = await req.json();

    if (!alertId) return NextResponse.json({ error: "Missing alertId" }, { status: 400 });

    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE security_alerts SET seen = TRUE WHERE id = ?`,
      [alertId]
    );
    connection.release();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark seen error:", error);
    return NextResponse.json({ error: "Failed to mark alert as seen" }, { status: 500 });
  }
}
