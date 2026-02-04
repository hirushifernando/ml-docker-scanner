interface UnsupervisedPanelProps {
  scan: {
    unsupervised_explanation?: string | string[];
    anomaly_result?: "NORMAL" | "ANOMALY";
    anomaly_decision?: "ALLOW" | "DENY";
  };
}

export default function UnsupervisedPanel({ scan }: UnsupervisedPanelProps) {
  if (!scan) return null;

  const unsupervisedText =
  scan.unsupervised_explanation && Array.isArray(scan.unsupervised_explanation)
    ? scan.unsupervised_explanation.join("\n")
    : scan.unsupervised_explanation || "";

    // Remove Interpretation part completely
    const anomalyText = unsupervisedText
      .replace(/^"+|"+$/g, "")      
      .replace(/Interpretation:[\s\S]*/, "")
      .trim();

    // Convert escaped \n → real newlines, then split
    const anomalyPoints = anomalyText
      .replace(/\\n/g, "\n")
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

  const isNormal = scan.anomaly_result === "NORMAL";

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

          <div className="space-y-1 text-sm text-gray-700">
            {anomalyPoints.length ? (
              anomalyPoints.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))
            ) : (
              <p className="text-gray-400">No anomaly explanation available</p>
            )}
          </div>
        </div>

        {/* FINAL STATUS */}
        <div className="flex justify-center pt-10">
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


