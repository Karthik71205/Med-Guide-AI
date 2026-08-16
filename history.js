requireAuth();

async function loadHistory() {
  try {
    const history = await api("/history");
    document.getElementById("history").innerHTML = history.length
      ? history.map(x => `
        <article class="history-item history-large">
          <div class="history-icon">✚</div>
          <div class="history-info">
            <span class="section-kicker">MEDICINE REVIEW</span>
            <strong>${x.medicines.map(m => m.medicine_name).join(", ")}</strong>
            <small>${new Date(x.created_at).toLocaleString()}</small>
          </div>
          <a class="btn btn-primary" href="results.html?id=${encodeURIComponent(x.id)}">Open analysis →</a>
        </article>`).join("")
      : `<div class="empty">No previous analyses. Start with a medicine scan or prescription.</div>`;
  } catch (error) {
    showToast(error.message);
  }
}
document.addEventListener("DOMContentLoaded", loadHistory);
