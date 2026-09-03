const API = "/api";
let allDeliveries = [];
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
    document.getElementById("dispatcherName")?.replaceChildren(document.createTextNode(currentUser.name));
    return true;
  } catch (_) {
    window.location.href = "/auth/auth.html";
    return false;
  }
}

function render(list) {
  const container = document.getElementById("all-deliveries-list");
  if (!container) return;
  container.innerHTML = list.length ? list.map(d => `
    <div class="list-item">
      <div class="item-info">
        <h4>${esc(d.id)} · ${esc(d.customerName)}</h4>
        <p><i class="fa-solid fa-location-dot"></i> ${esc(d.destination)}</p>
        <p><i class="fa-solid fa-box"></i> ${esc(d.itemDescription)}</p>
        ${d.riderName ? `<p><i class="fa-solid fa-motorcycle"></i> Rider: ${esc(d.riderName)}</p>` : ""}
      </div>
      <span class="status-badge">${esc(d.status)}</span>
    </div>`).join("") : '<p class="loading">No deliveries found.</p>';
}

window.filterDeliveries = (status) => render(
  status === "all" ? allDeliveries :
  allDeliveries.filter(d => d.status.toLowerCase().replace(/\s+/g, "_") === status)
);

async function logout() {
  try { await api("/logout", { method: "POST" }); } catch (_) {}
  window.location.href = "/auth/auth.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!await requireDispatcher()) return;
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  try {
    allDeliveries = (await api("/deliveries")).deliveries || [];
    render(allDeliveries);
  } catch (_) {
    render([]);
  }
});
