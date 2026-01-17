

interface SupervisedPanelProps {
  scan: {
    supervised_explanation?: string | string[];
    classification_explanation?: string | string[];
    model_decision?: "SECURE" | "NOT SECURE" | "NORMAL" | "ANOMALY";
  };
}

export default function SupervisedPanel({ scan }: SupervisedPanelProps) {
  if (!scan) return null;

  const supervisedText: string =
  scan.supervised_explanation && Array.isArray(scan.supervised_explanation)
    ? scan.supervised_explanation.join("\n")
    : scan.supervised_explanation || "";

    // Split regression vs classification
    let regressionText = "";
    let classificationText = "";

    const classIndex = supervisedText.indexOf("Classification explanation:");
    if (classIndex !== -1) {
      regressionText = supervisedText
        .slice(0, classIndex)
        // Remove the first line "Image has an estimated..." and "Regression explanation:"
        .replace(/[\s\S]*?Regression explanation:/, "")
        .replace(/Interpretation:[\s\S]*/, "")
        .trim();

      classificationText = supervisedText
        .slice(classIndex + "Classification explanation:".length)
        .replace(/Interpretation:[\s\S]*/, "")
        .trim();
    } else {
      regressionText = supervisedText.replace(/[\s\S]*?Regression explanation:/, "").trim();
      classificationText = "";

}

  // Convert escaped \n to real newlines
  const regressionPoints = regressionText
    .replace(/\\n/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const classificationPoints = classificationText
    .replace(/\\n/g, "\n")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);




  const isSecure =
  scan.model_decision === "SECURE" || scan.model_decision === "NORMAL";


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

          <div className="space-y-1 text-sm text-gray-700">
            {regressionPoints.length ? (
              regressionPoints.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))
            ) : (
              <p className="text-gray-400">No regression explanation available</p>
            )}
          </div>

          <div className="mt-2 h-px bg-gray-200" />
        </div>

        {/* CLASSIFICATION EXPLANATION */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-2">
            Classification Explanation:
          </h4>

          <div className="space-y-1 text-sm text-gray-700">
            {classificationPoints.length ? (
              classificationPoints.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))
            ) : (
              <p className="text-gray-400">No classification explanation available</p>
            )}
          </div>
        </div>

        {/* FINAL STATUS */}
        <div className="flex justify-center pt-4">
          <span
            className={`px-6 py-3 rounded-lg font-semibold text-md text-white
            bg-blue-800`}
          >
            Final Status: {scan.model_decision ?? "UNKNOWN"}
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
