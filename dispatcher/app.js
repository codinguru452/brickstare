const API = "/api";
let deliveries = [];
let riders = [];
let currentUser = null;

const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { credentials: "same-origin", ...options });
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

async function requireDispatcher() {
  try {
    const data = await api("/me");
    if (!data.user || data.user.role !== "dispatcher") throw new Error();
    currentUser = data.user;
    return true;
  } catch (_) {
    window.location.href = "/auth/auth.html";
    return false;
  }
}

async function loadData() {
  const [d, r] = await Promise.all([api("/deliveries"), api("/users/riders")]);
  deliveries = d.deliveries || [];
  riders = r.riders || [];
  renderDashboard();
}

function renderDashboard() {
  if (currentUser?.name) {
    document.getElementById("dispatcherName")?.replaceChildren(document.createTextNode(currentUser.name));
  }
  document.getElementById("stat-pending")?.replaceChildren(document.createTextNode(deliveries.filter(d => d.status === "Pending").length));
  document.getElementById("stat-riders")?.replaceChildren(document.createTextNode(riders.filter(r => r.status === "Available").length));
  document.querySelector(".stat-card:nth-child(3) p")?.replaceChildren(document.createTextNode(deliveries.filter(d => d.status === "Delivered").length));

  const active = deliveries.filter(d => d.status !== "Delivered");
  const list = document.getElementById("deliveries-list");
  if (list) {
    list.innerHTML = active.length ? active.map(d => `
      <div class="list-item">
        <div class="item-info">
          <h4>${esc(d.id)} · ${esc(d.customerName)}</h4>
          <p><i class="fa-solid fa-location-dot"></i> ${esc(d.destination)}</p>
          <p><i class="fa-solid fa-box"></i> ${esc(d.itemDescription)}</p>
          ${d.riderName ? `<p><i class="fa-solid fa-motorcycle"></i> ${esc(d.riderName)}</p>` : ""}
        </div>
        ${d.status === "Pending" ? `<div class="action-group">
          <select id="rider-${esc(d.id)}">
            <option value="">Select rider</option>
            ${riders.filter(r => r.status === "Available").map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join("")}
          </select>
          <button class="btn btn-primary" onclick="assignRider('${d.id}')">Assign</button>
        </div>` : `<span class="status-badge">${esc(d.status)}</span>`}
      </div>`).join("") : `<p class="loading">No open deliveries.</p>`;
  }

  const riderList = document.getElementById("riders-list");
  if (riderList) {
    riderList.innerHTML = riders.length ? riders.map(r => `
      <div class="list-item">
        <div class="item-info"><h4>${esc(r.name)}</h4><p>${esc(r.email)}</p></div>
        <span class="status-badge">${esc(r.status)}</span>
      </div>`).join("") : `<p class="loading">No riders found.</p>`;
  }
}

window.assignRider = async (deliveryId) => {
  const riderId = document.getElementById(`rider-${deliveryId}`)?.value;
  if (!riderId) return alert("Please select a rider first.");
  try {
    await api(`/deliveries/${deliveryId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId })
    });
    await loadData();
  } catch (error) {
    alert(error.message || "Assignment failed.");
  }
};

async function logout() {
  try { await api("/logout", { method: "POST" }); } catch (_) {}
  localStorage.removeItem("dispatcherToken");
  localStorage.removeItem("dispatcherUser");
  window.location.href = "/auth/auth.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!await requireDispatcher()) return;
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  await loadData().catch((error) => alert(error.message || "Unable to load dispatcher dashboard."));
  setInterval(() => loadData().catch(() => {}), 5000);
});
