import { ShieldCheck, ShieldAlert } from "lucide-react";

interface ScanSummaryCardProps {
  scan: {
    image_name: string;
    image_tag?: string;
    registry_type: "public" | "private";
    predicted_vulnerabilities: number;
    scan_time: string;
    final_decision?: "ALLOW" | "DENY";
    final_result: "SAFE" | "NOT_SAFE" | null; // changed
    critical_count?: number;
    high_count?: number;
    medium_count?: number;
    low_count?: number;
  };
}


export default function ScanSummaryCard({ scan }: ScanSummaryCardProps) {
  if (!scan) return null;


  const isSecure = scan.final_result === "SAFE";



  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center gap-6">
      
      {/* LEFT SECTION */}
      <div className="flex-1 space-y-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {scan.registry_type === "public" ? "Public Registry" : "Private Registry"}:{" "}
            {scan.image_name || "Unknown Image"}
            {scan.image_tag && <span className="text-gray-500">:{scan.image_tag}</span>}
          </h2>

          <p className="text-md font-semibold text-gray-700 mt-1">
            Estimated Vulnerability Risk Score:{" "}
            <strong>{Math.max(0, scan.predicted_vulnerabilities ?? 0)}</strong>
          </p>


          {scan.scan_time && (
            <p className="text-sm text-gray-400 mt-1">
              Scanned at: {new Date(scan.scan_time).toLocaleString()}
            </p>
          )}
          <div className="mt-2 h-px bg-gray-200" />
        </div>

        {/* SEVERITY BADGES */}
        <div className="flex gap-3 pt-2">
          <SeverityBadge label="Critical" count={scan.critical_count} color="red" />
          <SeverityBadge label="High" count={scan.high_count} color="orange" />
          <SeverityBadge label="Medium" count={scan.medium_count} color="yellow" />
          <SeverityBadge label="Low" count={scan.low_count} color="green" />
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex flex-col items-center justify-center gap-4 min-w-[220px]">

        {/* STATUS WITH OVERLAPPING SHIELD */}
        <div className="relative inline-flex items-center">
          
          {/* Status Bar */}
          <div
            className={`flex items-center px-5 py-3 pl-18 rounded-lg font-bold text-md ${
              isSecure
                ? "bg-green-200 text-green-700"
                : "bg-red-200 text-red-700"
            }`}
          >
            Status: {scan.final_result ?? "UNKNOWN"}
          </div>

          {/* Shield Image */}
          <img
            src={isSecure ? "/green.png" : "/red.png"}
            alt={isSecure ? "Secure" : "Not Secure"}
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-19 h-19 object-contain"
          />
        </div>

        {/* ACTION BUTTON */}
        {scan.final_decision === "ALLOW" ? (
          <button className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold">
            Allowed for Deployment
          </button>
        ) : (
          <button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold">
            Denied for Deployment
          </button>
        )}

      </div>

    </div>
  );
}

/* ---------------- SEVERITY BADGE ---------------- */

interface SeverityBadgeProps {
  label: string;
  count?: number;
  color: "red" | "orange" | "yellow" | "green";
}

function SeverityBadge({ label, count = 0, color }: SeverityBadgeProps) {
  const colorMap = {
    red: "bg-red-100 text-red-700",
    orange: "bg-orange-100 text-orange-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${colorMap[color]}`}>
      {label}: {count}
    </div>
  );
}
