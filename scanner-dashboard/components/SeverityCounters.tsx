

interface SeverityCountersProps {
  scan: any;
}

export default function SeverityCounters({ scan }: SeverityCountersProps) {
  if (!scan) return null;

  // Example: if you store individual counts, adjust here
  const critical = scan.critical_count || 0;
  const high = scan.high_count || 0;
  const medium = scan.medium_count || 0;
  const low = scan.low_count || 0;

  return (
    <div className="flex space-x-6 mt-4">
      <div className="bg-red-100 text-red-700 px-4 py-2 rounded font-bold">Critical: {critical}</div>
      <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded font-bold">High: {high}</div>
      <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded font-bold">Medium: {medium}</div>
      <div className="bg-green-100 text-green-700 px-4 py-2 rounded font-bold">Low: {low}</div>
    </div>
  );
}
