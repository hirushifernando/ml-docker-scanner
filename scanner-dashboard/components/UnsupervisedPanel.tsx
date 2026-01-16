interface UnsupervisedPanelProps {
  scan: {
    unsupervised_explanation?: string | string[];
    model_decision?: "NORMAL" | "ANOMALY";
  };
}

export default function UnsupervisedPanel({ scan }: UnsupervisedPanelProps) {
  if (!scan) return null;

  const explanationPoints = normalizeToArray(scan.unsupervised_explanation);
  const isNormal = scan.model_decision === "NORMAL";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 flex flex-col h-96">
      
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          Unsupervised Model Explanation
        </h3>
        <div className="mt-2 h-px bg-gray-200" />
      </div>

      <div className="flex-1 overflow-y-auto mt-4">

        {/* EXPLANATION SECTION */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">
            Anomaly Explanation:
          </h4>

          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {explanationPoints.length ? explanationPoints.map((item, i) => <li key={i}>{item}</li>)
              : <li className="text-gray-400">No unsupervised explanation available</li>}
          </ul>
        </div>

        {/* FINAL STATUS */}
        <div className="flex justify-center pt-4">
          <span
            className={`px-6 py-3 rounded-lg font-semibold text-md text-white
            bg-blue-800`}
          >
            Final Status: {isNormal ? "NORMAL" : "ANOMALY"}
          </span>
        </div>

      </div>

    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function normalizeToArray(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.split("\n").map(l => l.trim()).filter(Boolean);
}
