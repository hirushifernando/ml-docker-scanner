// app/api/deployments/route.ts

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "127.0.0.1",
  user: "scanner_user",
  password: "StrongPass123!",
  database: "scanner_db",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET() {

  let conn: mysql.PoolConnection | null = null;

  try {

    conn = await pool.getConnection();

    const [rows]: any = await conn.query(`
      SELECT DATE(deployed_at) AS date, status, COUNT(*) AS count
      FROM deployments
      GROUP BY DATE(deployed_at), status
      ORDER BY DATE(deployed_at) ASC
    `);

    const chartData: Record<string, { deployed: number; blocked: number; pending: number }> = {};

    rows.forEach((r:any)=>{

      const date = new Date(r.date)
        .toLocaleDateString("en-US",{month:"short",day:"numeric"});

      if(!chartData[date]){
        chartData[date]={deployed:0,blocked:0,pending:0};
      }

      const status = String(r.status).toLowerCase();

      if(status==="deployed") chartData[date].deployed = Number(r.count);
      if(status==="blocked") chartData[date].blocked = Number(r.count);
      if(status==="pending") chartData[date].pending = Number(r.count);

    });

    const dataArray = Object.keys(chartData).map(date=>({
      date,
      ...chartData[date]
    }));

    return NextResponse.json(dataArray.length ? dataArray : [{ date: "No Data", deployed: 0, blocked: 0, pending: 0 }]);

  }
  catch(error:any){

    console.error("Deployment API error:",error);

    return NextResponse.json({
      error:"Failed to fetch deployment data",
      details:error.message
    },{status:500});

  }
  finally{

    if(conn) conn.release();

  }

}