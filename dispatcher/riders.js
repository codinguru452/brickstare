const API = "/api";

async function loadRiders() {
  const [riderResponse, deliveryResponse] = await Promise.all([
    fetch(`${API}/users/riders`),
    fetch(`${API}/deliveries`),
  ]);
  const riderData = await riderResponse.json();
  const deliveryData = await deliveryResponse.json();
  const riders = riderData.riders || [];
  const deliveries = deliveryData.deliveries || [];

  document.getElementById("stat-total").textContent = riders.length;
  document.getElementById("stat-available").textContent = riders.filter((r) => r.status === "Available").length;
  document.getElementById("stat-busy").textContent = riders.filter((r) => r.status !== "Available").length;

  const container = document.getElementById("riders-list");
  container.innerHTML = riders.map((rider) => {
    const active = deliveries.filter((d) => d.riderId === rider.id && d.status !== "Delivered").length;
    return `<div class="list-item">
      <div class="item-info">
        <h4>${rider.name}</h4>
        <p><i class="fa-solid fa-envelope"></i> ${rider.email}</p>
        <p>Active deliveries: ${active}</p>
      </div>
      <span class="status-badge">${rider.status}</span>
    </div>`;
  }).join("") || '<p class="loading">No riders found.</p>';
}

document.addEventListener("DOMContentLoaded", () => {
  loadRiders().catch(() => {
    document.getElementById("riders-list").innerHTML = '<p class="loading">Start the Reflex backend on port 5000.</p>';
  });
  setInterval(() => loadRiders().catch(() => {}), 5000);
});
