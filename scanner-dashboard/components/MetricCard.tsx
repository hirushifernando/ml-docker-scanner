
// components/MetricCard.tsx
import React from "react";
import {
  FaDocker,
  FaExclamationTriangle,
  FaShieldAlt,
  FaInfo
} from "react-icons/fa";

interface MetricCardProps {
  icon: "docker" | "warning" | "shield" | "info";
  title: string;
  value: number;
  timestamp?: string;
  color: "blue" | "red" | "green" | "yellow";
}

export default function MetricCard({
  icon,
  title,
  value,
  timestamp,
  color
}: MetricCardProps) {
  const colors = {
    blue: "bg-blue-200 text-blue-700",
    red: "bg-red-200 text-red-700",
    green: "bg-green-200 text-green-600",
    yellow: "bg-yellow-200 text-yellow-600",
  };

  const valueColors = {
    blue: "text-blue-700",
    red: "text-red-700",
    green: "text-green-600",
    yellow: "text-yellow-600",
  };

  const icons = {
    docker: <FaDocker size={26} />,
    warning: <FaExclamationTriangle size={26} />,
    shield: <FaShieldAlt size={26} />,
    info: <FaInfo size={26} />,
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-6">
      {/* Icon */}
      <div className={`p-3 rounded-full flex items-center justify-center ${colors[color]}`}>
        {icons[icon]}
      </div>

      {/* Text Content */}
      <div className="flex-1">
        <p className="text-gray-800 font-bold text-md">{title}</p>
        <p className={`font-bold text-2xl mt-3 ${valueColors[color]}`}>
          {String(value).padStart(2, "0")}
        </p>
        {timestamp && (
          <p className="text-gray-400 text-sm mt-3">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
