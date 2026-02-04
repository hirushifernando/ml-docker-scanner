export async function getScanResults() {
  try {
    // Use relative path (no localhost)
    const res = await fetch("/api/scan", { cache: "no-store" });


    if (!res.ok) {
      throw new Error("Failed to fetch scan results");
    }

    return await res.json();
  } catch (error) {
    console.error("Scan fetch error:", error);
    return [];
  }
}


