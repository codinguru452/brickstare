const API = "/api";

function durationMinutes(delivery) {
  const delivered = (delivery.statusHistory || []).find((entry) => entry.status === "Delivered");
  if (!delivered) return null;
  return Math.max(0, Math.round((new Date(delivered.timestamp) - new Date(delivery.createdAt)) / 60000));
}

async function loadReports() {
  const [deliveryResponse, riderResponse] = await Promise.all([
    fetch(`${API}/deliveries`),
    fetch(`${API}/users/riders`),
  ]);
  const deliveries = (await deliveryResponse.json()).deliveries || [];
  const riders = (await riderResponse.json()).riders || [];
  const delivered = deliveries.filter((d) => d.status === "Delivered");
  const successRate = deliveries.length ? Math.round((delivered.length / deliveries.length) * 100) : 0;
  const times = delivered.map(durationMinutes).filter((value) => value !== null);
  const average = times.length ? Math.round(times.reduce((sum, n) => sum + n, 0) / times.length) : 0;

  document.getElementById("report-total").textContent = deliveries.length;
  document.getElementById("report-rate").textContent = `${successRate}%`;
  document.getElementById("report-average").textContent = times.length ? `${average} min` : "—";

  const statuses = ["Pending", "Assigned", "Picked Up", "Delivered"];
  document.getElementById("status-breakdown").innerHTML = statuses.map((status) => {
    const count = deliveries.filter((d) => d.status === status).length;
    const percentage = deliveries.length ? Math.round((count / deliveries.length) * 100) : 0;
    return `<div class="list-item"><div class="item-info"><h4>${status}</h4><p>${percentage}% of deliveries</p></div><strong>${count}</strong></div>`;
  }).join("");

  const riderCounts = riders.map((rider) => ({
    name: rider.name,
    deliveries: delivered.filter((d) => d.riderId === rider.id).length,
  })).sort((a, b) => b.deliveries - a.deliveries);

  document.getElementById("top-riders").innerHTML = riderCounts.map((rider, index) =>
    `<div class="list-item"><div class="item-info"><h4>#${index + 1} ${rider.name}</h4><p>Completed deliveries</p></div><strong>${rider.deliveries}</strong></div>`
  ).join("") || '<p class="loading">No rider data yet.</p>';
}

document.addEventListener("DOMContentLoaded", () => {
  loadReports().catch(() => {});
  setInterval(() => loadReports().catch(() => {}), 5000);
});
