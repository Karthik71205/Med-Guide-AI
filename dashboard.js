requireAuth();

async function loadDashboard() {
  try {
    const profile = await api("/profile");
    const name = profile.name || "there";
    document.getElementById("welcome").textContent = `Welcome, ${name}`;
    const status = profile.name ? "Profile completed" : "Complete your profile";
    document.getElementById("profileStatus").textContent = status;
    document.getElementById("profileMetric").textContent = profile.name ? "Ready" : "Setup";
  } catch {
    document.getElementById("welcome").textContent = "Welcome";
    document.getElementById("profileStatus").textContent = "Complete your profile";
    document.getElementById("profileMetric").textContent = "Setup";
  }

  try {
    const history = await api("/analysis");
    document.getElementById("analysisCount").textContent = history.length;
    const list = document.getElementById("recent");
    list.innerHTML = history.slice(0, 3).map(item => `
      <article class="history-item">
        <div class="history-icon">✚</div>
        <div class="history-info">
          <strong>${item.medicines.map(m => m.medicine_name).join(", ")}</strong>
          <small>${new Date(item.created_at).toLocaleString()}</small>
        </div>
        <a class="btn btn-secondary" href="results.html?id=${encodeURIComponent(item.id)}">View</a>
      </article>
    `).join("") || `<div class="empty">No analyses yet. Your next medicine review will appear here.</div>`;
  } catch {
    document.getElementById("recent").innerHTML = `<div class="empty">Recent analyses could not be loaded.</div>`;
  }
}
document.addEventListener("DOMContentLoaded", loadDashboard);
