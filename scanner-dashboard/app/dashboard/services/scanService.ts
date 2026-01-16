export async function getScanResults() {
  try {
    const res = await fetch("http://localhost:8000/api/scans", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch scan results");
    }

    return await res.json();
  } catch (error) {
    console.error("Scan fetch error:", error);
    return [];
  }
}

