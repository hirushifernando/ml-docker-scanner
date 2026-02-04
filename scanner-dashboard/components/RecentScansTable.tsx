import React from "react";

interface Scan {
  image_name: string;
  image_tag?: string;
  registry_type: "public" | "private";
  predicted_vulnerabilities: number;
  scan_time: string;
  final_result?: "SAFE" | "NOT_SAFE";
  final_decision?: "ALLOW" | "DENY";
}

interface RecentScansTableProps {
  scans: Scan[];
}

export default function RecentScansTable({ scans }: RecentScansTableProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Recent Image Scans</h3>
        <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-md hover:bg-blue-200 transition">
          View All
        </button>
      </div>
      <div className="mt-2 h-px bg-gray-200" />

      {/* Table Rows */}
      <div className="space-y-3 mt-4">
        {/* COLUMN HEADERS */}
        <div className="grid grid-cols-6 gap-4 items-center px-2 text-gray-700 text-sm font-medium divide-x divide-gray-300 text-center sticky top-0 bg-white z-10">
          <span className="pr-4">Image Name</span>
          <span className="px-4">Registry</span>
          <span className="px-4">Vulnerabilities</span>
          <span className="px-4">Scanned At</span>
          <span className="px-4">Status</span>
          <span className="pl-4">Decision</span>
        </div>

        {/* ROWS */}
        <div className="mt-2 max-h-53 overflow-y-auto space-y-3">
          {scans.map((scan, index) => (
            <div
              key={`${scan.image_name}-${scan.image_tag ?? "none"}-${scan.scan_time}-${index}`} // UNIQUE key
              className="grid grid-cols-6 gap-4 items-center bg-gray-100 rounded-lg p-3 text-sm text-center"
            >
              {/* Image Name */}
              <div className="font-semibold text-gray-700">
                {scan.image_name}{scan.image_tag ? `:${scan.image_tag}` : ""}
              </div>

              {/* Registry */}
              <div className="text-gray-500 text-sm capitalize">
                {scan.registry_type}
              </div>

              {/* Vulnerabilities */}
              <div className="font-semibold text-gray-700">
                {scan.predicted_vulnerabilities ?? 0}
              </div>

              {/* Scanned Time */}
              <div className="text-gray-500 text-sm">
                {new Date(scan.scan_time).toLocaleString()}
              </div>

              {/* Status */}
              <div className="flex justify-center">
                <span
                  className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${
                    scan.final_result === "SAFE"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {scan.final_result ?? "N/A"}
                </span>
              </div>

              {/* Decision */}
              <div
                className={`font-semibold ${
                  scan.final_decision === "ALLOW"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {scan.final_decision ?? "N/A"}
              </div>
            </div>
          ))}
          {scans.length === 0 && (
            <div className="text-center text-gray-400 py-6">
              No scan results available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
