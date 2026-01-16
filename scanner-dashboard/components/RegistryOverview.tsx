import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

interface Registry {
  type: "Public" | "Private";
  secure: number;
  anomalous: number;
}

interface RegistryOverviewProps {
  registries: Registry[];
}

/* 🔒 Registry icons (internal mapping) */
const registryIcons: Record<Registry["type"], string> = {
  Public: "/public.png",
  Private: "/private.png",
};

export default function RegistryOverview({ registries }: RegistryOverviewProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      {/* ================= HEADER ================= */}
      <h3 className="text-lg font-bold text-gray-900">Registry Overview</h3>

      {/* Divider */}
      <div className="mt-2 h-px bg-gray-200" />

      {/* ================= REGISTRIES ================= */}
      <div className="flex flex-col md:flex-row mt-6 relative">
        {registries.map((r, index) => {
          const total = r.secure + r.anomalous;

          const chartData = {
            labels: ["Secure", "Anomalous"],
            datasets: [
              {
                data: [r.secure, r.anomalous],
                backgroundColor: ["#00c72b", "#d70202"],
                borderWidth: 2,
                borderColor: "#ffffff",
                hoverOffset: 8,
              },
            ],
          };

          return (
            <React.Fragment key={r.type}>
              {/* ================= SINGLE REGISTRY ================= */}
              <div className="flex-1 flex flex-col items-center">
                {/* Title */}
                <p className="text-gray-800 font-semibold mb-2">
                  {r.type} Registry
                </p>

                {/* Donut Chart */}
                <div className="relative w-40 h-40">
                  <Pie
                    data={chartData}
                    options={{
                      cutout: "65%", 
                      plugins: { legend: { display: false } },
                    }}
                  />

                  {/* Center Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={registryIcons[r.type]}
                      alt={`${r.type} registry`}
                      className="w-13 h-10"
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700">
                      {r.secure} Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700">
                      {r.anomalous} Anomalous
                    </span>
                  </div>
                </div>

                {/* Total */}
                <p className="text-gray-600 text-sm mt-4">
                  Total Images: {total}
                </p>
              </div>

              {/* ================= VERTICAL DIVIDER ================= */}
              {index === 0 && (
                <div className="hidden md:block w-px bg-gray-300 mx-6" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
