requireAuth();

async function loadHistory() {
  try {
    const history = await api("/history");
    document.getElementById("history").innerHTML = history.length
      ? history.map(x => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap">
            <div>
              <h3>${x.medicines.map(m => m.medicine_name).join(", ")}</h3>
              <p class="muted">${new Date(x.created_at).toLocaleString()}</p>
            </div>
            <a class="btn btn-primary" href="results.html?id=${x.id}">Open analysis</a>
          </div>
        </div>`).join("")
      : `<div class="empty">No previous analyses.</div>`;
  } catch (error) {
    showToast(error.message);
  }
}
document.addEventListener("DOMContentLoaded", loadHistory);
