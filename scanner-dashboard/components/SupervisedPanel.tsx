

interface SupervisedPanelProps {
  scan: {
    regression_explanation?: string | string[];
    classification_explanation?: string | string[];
    model_decision?: "SECURE" | "NOT SECURE";
  };
}

export default function SupervisedPanel({ scan }: SupervisedPanelProps) {
  if (!scan) return null;

  const regressionPoints = normalizeToArray(scan.regression_explanation);
  const classificationPoints = normalizeToArray(scan.classification_explanation);

  const isSecure = scan.model_decision === "SECURE";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6 flex flex-col h-96">
      
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          Supervised Model Explanation
        </h3>
        <div className="mt-2 h-px bg-gray-200" />
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-6">
        {/* REGRESSION EXPLANATION */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">
            Regression Explanation:
          </h4>

          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {regressionPoints.length ? regressionPoints.map((item, i) => <li key={i}>{item}</li>)
              : <li className="text-gray-400">No regression explanation available</li>}
          </ul>
          <div className="mt-2 h-px bg-gray-200" />
        </div>

        {/* CLASSIFICATION EXPLANATION */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">
            Classification Explanation:
          </h4>

          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {classificationPoints.length ? classificationPoints.map((item, i) => <li key={i}>{item}</li>)
              : <li className="text-gray-400">No classification explanation available</li>}
          </ul>
        </div>

        {/* FINAL STATUS */}
        <div className="flex justify-center pt-4">
          <span
            className={`px-6 py-3 rounded-lg font-semibold text-md text-white
            bg-blue-800`}
          >
            Final Status: {isSecure ? "SECURE" : "NOT SECURE"}
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
