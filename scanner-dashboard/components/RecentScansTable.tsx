// components/RecentScansTable.tsx
import React from "react";

interface Scan {
  id: number;
  image_name: string;
  registry: "Public" | "Private";
  vulnerabilities: number;
  size: string;               
  status: "Secure" | "Anomalous";
  scanned_at: string;
}


interface RecentScansTableProps {
  scans: Scan[];
}

export default function RecentScansTable({ scans }: RecentScansTableProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
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
        {/* ================= COLUMN HEADERS ================= */}
        <div className="grid grid-cols-6 gap-4 items-center px-2 text-gray-700 text-sm font-medium divide-x divide-gray-300 text-center sticky top-0 bg-white z-10">
          <span className="pr-4">Image Name</span>
          <span className="px-4">Registry</span>
          <span className="px-4">Vulnerabilities</span>
          <span className="px-4">Size</span>
          <span className="px-4">Scanned At</span>
          <span className="pl-4">Status</span>
        </div>


        {/* ================= ROWS ================= */}
        <div className="mt-2 max-h-53 overflow-y-auto space-y-3">
          {scans.map((scan) => (
          <div
            key={scan.id}
            className="grid grid-cols-6 gap-4 items-center bg-gray-200 rounded-lg p-3"
          >
            {/* Image Name */}
            <div className="font-sm text-gray-500">
              {scan.image_name}
            </div>

            {/* Registry */}
            <div className="text-gray-500 text-sm">
              {scan.registry}
            </div>

            {/* Vulnerabilities */}
            <div className="text-sm text-gray-500">
              {scan.vulnerabilities}
            </div>

            {/* Size */}
            <div className="text-gray-500 text-sm">
              {scan.size}
            </div>

            {/* Scanned Time */}
            <div className="text-gray-500 text-sm">
              {new Date(scan.scanned_at).toLocaleString()}
            </div>

            {/* Status */}
            <div className="flex justify-center">
              <span
                className={`px-3 py-1 rounded-md text-sm font-semibold text-white ${
                  scan.status === "Secure"
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              >
                {scan.status}
              </span>
            </div>
          </div>
        ))}
        </div>

      </div>

    </div>
  );
}
