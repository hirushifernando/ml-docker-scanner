// app/dashboard/services/overviewServices.ts

export const getOverviewData = async () => {
  const res = await fetch("/api/dashboard_overview", {
    method: "GET",
    cache: "no-store", // important for real-time dashboard
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard overview");
  }

  return res.json();
};
