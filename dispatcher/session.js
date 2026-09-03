(function () {
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const r = await fetch("/api/me", { credentials: "same-origin" });
      const data = await r.json();
      if (!r.ok || data.user?.role !== "dispatcher") {
        location.href = "/auth/auth.html";
        return;
      }
      document.getElementById("dispatcherName")?.replaceChildren(document.createTextNode(data.user.name));
    } catch (_) {
      location.href = "/auth/auth.html";
      return;
    }
    document.getElementById("logout-btn")?.addEventListener("click", async () => {
      try { await fetch("/api/logout", { method: "POST", credentials: "same-origin" }); } catch (_) {}
      location.href = "/auth/auth.html";
    });
  });
})();