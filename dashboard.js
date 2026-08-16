requireAuth();

async function loadDashboard() {
  try {
    const profile = await api("/profile");
    const name = profile.name || "there";
    document.getElementById("welcome").textContent = `Welcome, ${name}`;
    document.getElementById("profileStatus").textContent =
      profile.name ? "Profile completed" : "Complete your profile";
  } catch {
    document.getElementById("welcome").textContent = "Welcome";
  }

  try {
    const history = await api("/analysis");
    document.getElementById("analysisCount").textContent = history.length;
    const list = document.getElementById("recent");
    list.innerHTML = history.slice(0, 3).map(item => `
      <div class="medicine-card">
        <strong>${item.medicines.map(m => m.medicine_name).join(", ")}</strong>
        <p class="muted">${new Date(item.created_at).toLocaleString()}</p>
        <a class="btn btn-secondary" href="results.html?id=${encodeURIComponent(item.id)}">View</a>
      </div>
    `).join("") || `<div class="empty">No analyses yet.</div>`;
  } catch {}
}

document.addEventListener("DOMContentLoaded", loadDashboard);
