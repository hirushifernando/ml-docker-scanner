"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";


interface DeploymentBarChartProps {
  totalDeployed: number;
  totalBlocked: number;
  totalPending: number;
  lastUpdated: string;
}

export default function DeploymentBarChart({
  totalDeployed,
  totalBlocked,
  totalPending,
  lastUpdated,
}: DeploymentBarChartProps) {
  const data = [
    { name: "Deployed", value: totalDeployed, fill: "#22c55e" }, // green
    { name: "Blocked", value: totalBlocked, fill: "#ef4444" },  // red
    { name: "Pending", value: totalPending, fill: "#facc15" },  // yellow
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900">Deployment Summary</h2>
      <hr className="mt-2 mb-4 border-gray-200" />

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddddde" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#707070", fontSize: 15 }}
            dy={10}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#707070", fontSize: 15 }}
            allowDecimals={false}
            label={{
              value: "Docker Images",
              angle: -90,
              position: "center",
              dx: -20,
              fill: "#707070",
              offset: 10,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #1f2933",
              borderRadius: "8px",
            }}
            labelStyle={{
              color: "#afafaf",
              fontSize: "15px",
              marginBottom: "4px",
            }}
            itemStyle={{
              color: "#e5e7eb",
            }}
            formatter={(value) => [`${value}`, "Images"]}
          />
          {/* ONE Bar for all data */}
          <Bar dataKey="value">
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-sm text-gray-400 mt-3">Last updated: {lastUpdated}</p>
    </div>
  );
}
