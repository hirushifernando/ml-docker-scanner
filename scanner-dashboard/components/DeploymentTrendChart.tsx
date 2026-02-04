// components/DeploymentTrendChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

interface TrendData {
  date: string;      // X-axis (Date)
  deployed: number; // Y-axis (Deployment count)
}

interface DeploymentTrendChartProps {
  data: TrendData[];
}

export default function DeploymentTrendChart({ data }: DeploymentTrendChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900">Deployment Status</h2>
      <hr className="mt-2 mb-4 border-gray-200" />

      <div className="flex items-center mb-4 text-md text-gray-700">
        <ShieldCheckIcon className="w-4 h-4 text-blue-500 mr-1" />
        Cloud Environment
      </div>

      <ResponsiveContainer width="100%" height={250}>
         <LineChart data={data.length ? data : [{ date: "No Data", deployed: 0 }]} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddddde" />

          {/* Horizontal axis → Date */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#707070", fontSize: 15 }}
            dy={10} 
          />

          {/* Vertical axis → Deployment Count */}
          <YAxis
            label={{
              value: "Deployments",
              angle: -90,
              position: "center",
              dx: -20,          // ← move text toward center
              fill: "#707070",
              style: { fontSize: 15 }
            }}
            tick={{ fill: "#707070" }}
            allowDecimals={false}
            domain={[0, 'auto']}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1f2933",
              borderRadius: "8px",
            }}
            labelStyle={{
              color: "#afafaf",   // ← gray date text
              fontSize: "15px",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#e5e7eb",   // value text
            }}
            formatter={(value) => [`${value}`, "Deployments"]}
          />

          {/* Blue Line */}
          <Line
            type="monotone"
            dataKey="deployed"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />

          {/* Blue Area */}
          <Area
            type="monotone"
            dataKey="deployed"
            fill="#3b82f6"
            fillOpacity={0.15}
            tooltipType="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}