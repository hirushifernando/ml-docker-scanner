

interface ScanTableProps {
  scans: any[];
}

export default function ScanTable({ scans }: ScanTableProps) {
  if (!scans || scans.length === 0) return <p>No scan results found.</p>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Image Name</th>
            <th className="px-4 py-2 text-left">Registry</th>
            <th className="px-4 py-2 text-left">Vulnerabilities</th>
            <th className="px-4 py-2 text-left">Severity</th>
            <th className="px-4 py-2 text-left">Decision</th>
            <th className="px-4 py-2 text-left">Scan Time</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id} className="border-t">
              <td className="px-4 py-2">{scan.id}</td>
              <td className="px-4 py-2">{scan.image_name}</td>
              <td className="px-4 py-2">{scan.registry_type}</td>
              <td className="px-4 py-2">{scan.vulnerabilities}</td>
              <td className="px-4 py-2">{scan.severity}</td>
              <td className="px-4 py-2">{scan.final_decision}</td>
              <td className="px-4 py-2">{new Date(scan.scan_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
