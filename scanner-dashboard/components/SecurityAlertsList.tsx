// components/SecurityAlertsList.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Eye, Trash2, AlertCircle, X } from "lucide-react";
import { useAlertContext } from "@/app/layout";

interface Alert {
  id: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  timestamp: string;
  isNew?: boolean; // from backend
}

interface SecurityAlertsListProps {
  alerts: Alert[];
  onAlertViewed?: (alertId: number) => void;
}

export default function SecurityAlertsList({ alerts, onAlertViewed }: SecurityAlertsListProps) {
  const [popupAlert, setPopupAlert] = useState<Alert | null>(null);

  // ✅ Local reactive alert state
  const [localAlerts, setLocalAlerts] = useState<Alert[]>(alerts ?? []);

  // Update localAlerts if props change
  useEffect(() => {
    setLocalAlerts(alerts ?? []);
  }, [alerts]);

  // ✅ global unseen alert state
  const { unseenAlerts, setUnseenAlerts } = useAlertContext();

  const severityStyles = {
    Critical: {
      text: "text-red-800",
      bg: "bg-red-100",
      border: "border-red-700",
    },
    High: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-500",
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

  const handleViewAlert = async (alert: Alert) => {
    setPopupAlert(alert);

    if (!alert.isNew) return;

    try {
      // Call backend to mark as seen
      await fetch("/api/security_alerts/mark_seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId: alert.id }),
      });

      // Update global unseen count
      setUnseenAlerts(Math.max(unseenAlerts - 1, 0));

      // Update local alert state so background changes immediately
      setLocalAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id ? { ...a, isNew: false } : a
        )
      );

      // Call parent handler if provided
      if (onAlertViewed) onAlertViewed(alert.id);
    } catch (err) {
      console.error("Failed to mark alert as seen", err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Security Alerts</h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200 transition">
          View All
        </button>
      </div>

      <div className="mt-2 h-px bg-gray-200" />

      {/* Alerts */}
      <div className="divide-y divide-gray-200 mt-4 max-h-60 overflow-y-auto">
        {(localAlerts ?? [])
          // Only show Critical & High alerts in UI
          .filter((a) => a.severity === "Critical" || a.severity === "High")
          .map((a) => {
            const style = severityStyles[a.severity];
            return (
              <div
                key={a.id}
                className={`flex items-start gap-3 py-3 px-2 rounded-md transition ${
                  a.isNew ? "bg-blue-100" : "bg-white"
                }`}
              >
                {/* Left indicator */}
                <div className="flex flex-col items-center">
                  <AlertCircle size={18} className={style.text} />
                  <div className="mt-1 w-0.5 h-10 bg-black" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <span className={`text-md font-semibold ${style.text}`}>
                    [ {a.severity} ]
                  </span>
                  <p className="text-md font-semibold text-gray-600 mt-0.5">{a.title}</p>
                  <p className="text-sm text-gray-500">{a.timestamp}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewAlert(a)}
                    className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                  >
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

      {/* Popup */}
      {popupAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setPopupAlert(null)}
              className="absolute top-3 right-3 p-1 bg-gray-200 text-gray-900 hover:bg-gray-400 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2 mt-7">{popupAlert.title}</h3>
            <p className="text-sm text-gray-600 mb-1">
              Severity: <span className={severityStyles[popupAlert.severity].text}>{popupAlert.severity}</span>
            </p>
            <p className="text-sm text-gray-600 mb-1">Timestamp: {popupAlert.timestamp}</p>
          </div>
        </div>
      )}
    </div>
  );
}
