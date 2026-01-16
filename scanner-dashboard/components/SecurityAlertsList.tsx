// components/SecurityAlertsList.tsx
import React from "react";
import { Eye, Trash2, AlertCircle } from "lucide-react";


interface Alert {
  id: number;
  severity: "High" | "Medium" | "Low";
  title: string;
  timestamp: string;
}

interface SecurityAlertsListProps {
  alerts: Alert[];
}

export default function SecurityAlertsList({ alerts }: SecurityAlertsListProps) {
  const severityStyles = {
    High: {
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-500",
    },
    Medium: {
      text: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-500",
    },
    Low: {
      text: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-500",
    },
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Security Alerts
        </h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200 transition"> View All </button>
      </div>

      <div className="mt-2 h-px bg-gray-200" />

      {/* Alerts */}
      <div className="divide-y divide-gray-200 mt-4 max-h-60 overflow-y-auto">
        {alerts.map((a) => {
          const style = severityStyles[a.severity];

          return (
            <div
              key={a.id}
              className="flex items-start gap-3 py-3"
            >
              {/* Left indicator with Icon + Vertical Line */}
                <div className="flex flex-col items-center">
                  {/* Alert Icon */}
                  <AlertCircle
                    size={18}
                    className={style.text}
                  />

                  {/* Vertical Line */}
                  <div className="mt-1 w-0.5 h-10 bg-black" />
                </div>

              {/* Content */}
              <div className="flex-1">
                <span className={`text-md font-semibold ${style.text}`}>
                  [ {a.severity} ]
                </span>
                <p className="text-md font-semibold text-gray-600 mt-0.5">
                  {a.title}
                </p>
                <p className="text-sm text-gray-500">
                  {a.timestamp}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition">
                  <Eye size={18} />
                </button>
                <button className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


