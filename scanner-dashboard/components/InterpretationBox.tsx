interface InterpretationBoxProps {
  scan: {
    image_name: string;
    image_tag?: string;
    registry_type?: "public" | "private";
    vulnerabilities?: number;
    decision?: "ALLOW" | "DENY";
    supervised_explanation?: string | string[];
    unsupervised_explanation?: string | string[];
    model_decision?: "SECURE" | "NOT SECURE" | "NORMAL" | "ANOMALY";
  };
}

export default function InterpretationBox({ scan }: InterpretationBoxProps) {
  if (!scan) return null;

  const imageFullName = `${scan.image_name}${scan.image_tag ? `:${scan.image_tag}` : ""}`;
  const registryLabel = scan.registry_type === "public" ? "Public Registry" : "Private Registry";

  // Normalize explanations
  const supervised = normalizeToArray(scan.supervised_explanation);
  const unsupervised = normalizeToArray(scan.unsupervised_explanation);

  const statusText = scan.decision === "ALLOW" ? "SECURE" : "NOT SECURE";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Interpretation</h3>
      <div className="mt-2 h-px bg-gray-200" />

      <p className="text-gray-700 leading-relaxed text-sm mt-4">
        The Docker image <strong>{imageFullName}</strong> from <strong>{registryLabel}</strong> was scanned.
        <br />
        Detected vulnerabilities: <strong>{scan.vulnerabilities ?? 0}</strong>.
        <br />
        Final status: <strong>{statusText}</strong>.
        <br /><br />

        {/* Supervised explanation */}
        {supervised.length > 0 && (
          <>
            <strong>Supervised Model Explanation:</strong>
            <ul className="list-disc list-inside ml-4">
              {supervised.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </>
        )}

        {/* Unsupervised explanation */}
        {unsupervised.length > 0 && (
          <>
            <strong>Unsupervised Model Explanation:</strong>
            <ul className="list-disc list-inside ml-4">
              {unsupervised.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </>
        )}

        {/* Fallback if no explanations */}
        {supervised.length === 0 && unsupervised.length === 0 && (
          <span>No additional explanation available.</span>
        )}
      </p>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */
function normalizeToArray(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  return input.split("\n").map(l => l.trim()).filter(Boolean);
}

