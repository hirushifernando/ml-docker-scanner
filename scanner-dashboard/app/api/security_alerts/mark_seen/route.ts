import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "scanner_user",
  password: "StrongPass123!",
  database: "scanner_db",
});

export async function POST(req: Request) {
  let connection: mysql.PoolConnection | null = null;

  try {
    const { alertId } = await req.json();

    if (!alertId) {
      return NextResponse.json(
        { error: "Missing alertId" },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    await connection.query(
      `UPDATE security_alerts SET seen = 1 WHERE id = ?`,
      [alertId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Mark seen error:", error);
    return NextResponse.json(
      { error: "Failed to mark alert as seen" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

