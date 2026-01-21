import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

interface Registry {
  registry_type: "public" | "private";
  secure: number | string;   
  anomalous: number | string;
}


interface RegistryOverviewProps {
  registries: Registry[];
}

/* 🔒 Registry icons (internal mapping) */
const registryIcons: Record<"public" | "private", string> = {
  public: "/public.png",
  private: "/private.png",
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
          const type = r.registry_type; // ✅ FROM DB
          const secureCount = Number(r.secure);
          const anomalousCount = Number(r.anomalous);
          const total = secureCount + anomalousCount;
          const hasData = total > 0;

          // 📊 Chart Data
          const chartData = {
            labels: hasData ? ["Secure", "Anomalous"] : ["No Data"],
            datasets: [
              {
                data: hasData ? [r.secure, r.anomalous] : [1],
                backgroundColor: hasData
                  ? ["#00c72b", "#d70202"]
                  : ["#d9d9d9"], // gray
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          };

          return (
            <React.Fragment key={index}>
              {/* ================= SINGLE REGISTRY ================= */}
              <div className="flex-1 flex flex-col items-center">
                {/* Title */}
                <p className="text-gray-800 font-semibold mb-2">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Registry
                </p>

                {/* Donut Chart */}
                <div className="relative w-40 h-40">
                  <Pie
                    data={chartData}
                    options={{
                      cutout: "65%",
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: hasData },
                      },
                    }}
                  />

                  {/* Center Image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={registryIcons[type]}
                      alt={`${type} registry`}
                      className="w-12 h-10 opacity-80"
                    />
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-700">
                      {secureCount} Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-700">
                      {anomalousCount} Anomalous
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