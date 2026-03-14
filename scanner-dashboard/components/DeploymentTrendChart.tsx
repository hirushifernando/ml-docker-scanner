// components/DeploymentTrendChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Legend } from "recharts";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

interface TrendData {
  date: string;      
  deployed: number;
  blocked: number;
  pending: number;
}


interface DeploymentTrendChartProps {
  data: TrendData[];
}


export default function DeploymentTrendChart({ data }: DeploymentTrendChartProps) {
  const chartData =
    data.length > 0
      ? data
      : [{ date: "No Data", deployed: 0, blocked: 0, pending: 0 }];
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold text-gray-900">Deployment Status</h2>
      <hr className="mt-2 mb-4 border-gray-200" />

      <div className="flex items-center mb-4 text-md text-gray-700">
        <ShieldCheckIcon className="w-4 h-4 text-blue-500 mr-1" />
        Cloud Environment
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
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
            formatter={(value: any, name: any) => {
              const labels: Record<string, string> = {
                deployed: "Deployed",
                blocked: "Blocked",
                pending: "Pending",
              };

              return [value, labels[name] || name] as [number | string, string];
            }}
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
          />
          {/* Legend */}
          <Legend wrapperStyle={{ top: 230 }}/>

          <Area
          type="monotone"
          dataKey="deployed"
          fill="#3b82f6"
          fillOpacity={0.15}
          legendType="none"
          tooltipType="none"
          />

          <Line type="monotone" dataKey="deployed" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="blocked" stroke="#ef4444" strokeWidth={2} />
          <Line type="monotone" dataKey="pending" stroke="#facc15" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}