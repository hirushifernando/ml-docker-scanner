interface InterpretationBoxProps {
  scan: {
    image_name: string;
    image_tag?: string;
    registry_type?: "public" | "private";
    vulnerabilities?: number;
    model_decision?: "SECURE" | "NOT SECURE" | "NORMAL" | "ANOMALY";
    interpretation?: string; // DB value
  };
}

export default function InterpretationBox({ scan }: InterpretationBoxProps) {
  if (!scan) return null;

  const imageFullName = `${scan.image_name}${scan.image_tag ? `:${scan.image_tag}` : ""}`;
  const registryLabel = scan.registry_type === "public" ? "public registry" : "private registry";
  const vulnerabilitiesCount = scan.vulnerabilities ?? 0;
  const status = scan.model_decision ?? "UNKNOWN";

  // Use DB interpretation if exists, else fallback
  let interpretationText =
    scan.interpretation?.trim() ||
    generateInterpretation({
      image: imageFullName,
      registry: registryLabel,
      anomaly: status === "ANOMALY",
      secure: status === "SECURE",
      vulnerabilities: vulnerabilitiesCount,
      status: status,
    });

  // Replace highlight markers with <span> for inline coloring
  interpretationText = interpretationText
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-blue-700">$1</span>');

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3">
        Model Interpretation
      </h3>
      <div className="mt-1 h-px bg-gray-200" />

      {/* Render explanation with inline highlights */}
      <p
        className="text-gray-700 leading-relaxed text-sm mt-4"
        dangerouslySetInnerHTML={{ __html: interpretationText }}
      />
    </div>
  );
}

/* ---------------- FALLBACK INTERPRETATION ---------------- */
function generateInterpretation({
  image,
  registry,
  anomaly,
  secure,
  vulnerabilities,
  status,
}: {
  image: string;
  registry: string;
  anomaly: boolean;
  secure: boolean;
  vulnerabilities: number;
  status: string;
}): string {
  // Wrap important terms in ** ** to mark for highlighting
  if (anomaly && secure) {
    return `The Docker image **${image}** from the **${registry}** deviates from normal Docker image patterns learned by the unsupervised detection model.
Despite this deviation, the supervised security model has classified it as **${status}**.
A total of **${vulnerabilities} vulnerabilities** were identified, none exceeding the risk threshold.`;
  }

  if (anomaly && !secure) {
    return `The Docker image **${image}** from the **${registry}** significantly deviates from normal Docker image behavior and has been classified as **${status}**.
Detected anomalies, combined with the identified **vulnerabilities (${vulnerabilities})**, indicate a high security risk.`;
  }

  if (!anomaly && secure) {
    return `The Docker image **${image}** from the **${registry}** aligns with normal Docker image patterns and has been classified as **${status}**.
The analysis identified **${vulnerabilities} vulnerabilities**, all within acceptable security limits.`;
  }

  return `The Docker image **${image}** from the **${registry}** follows normal structural patterns; however, the supervised model has classified it as **${status}**.
Identified **vulnerabilities (${vulnerabilities})** suggest potential security weaknesses.`;
}
