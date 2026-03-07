// frontend service, e.g., /services/deployService.ts
export async function logDeployment(imageName: string, tag: string, dryRun = true) {
  try {
    await fetch("/api/deployments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_name: imageName,
        image_tag: tag,
        status: dryRun ? "pending" : "deployed",
        deployed_at: new Date().toISOString()
      })
    });
  } catch (err) {
    console.error("Failed to log deployment:", err);
  }
}