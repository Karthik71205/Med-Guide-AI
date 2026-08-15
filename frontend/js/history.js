(function () {
  Auth.requireAuth();
  renderAppNav("history.html");

  loadHistory();

  async function loadHistory() {
    const card = document.getElementById("history-card");
    try {
      const data = await MedGuideAPI.getHistory();
      const scans = data.medicine_history || data.scans || data.history || [];
      const reports = data.report_scans || [];
      const entries = [
        ...scans.map(s => ({ ...s, kind: "medicine" })),
        ...reports.map(r => ({ ...r, kind: "report" })),
      ].sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));

      if (entries.length === 0) {
        card.innerHTML = `<p class="muted">No activity yet. <a href="scan.html">Scan a medicine</a> to get started.</p>`;
        return;
      }

      card.innerHTML = `<div class="timeline">${entries.map(row).join("")}</div>`;
    } catch (err) {
      card.innerHTML = `<p class="muted">Couldn't load history — ${err.message}</p>`;
    }
  }

  function row(e) {
    const when = e.created_at || e.timestamp || e.date || "";
    const d = new Date(when);
    const dateStr = isNaN(d) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    if (e.kind === "report") {
      const hints = e.condition_hints || e.hints || [];
      return `
        <div class="timeline-entry">
          <time>${dateStr}</time>
          <div>
            <span class="tag">Report</span>
            <p style="margin-top:6px;">Condition hints: ${hints.length ? hints.join(", ") : "none detected"}</p>
          </div>
        </div>`;
    }
    const name = e.medicine_name || e.name || "Unknown medicine";
    return `
      <div class="timeline-entry">
        <time>${dateStr}</time>
        <div>
          <span class="tag">Medicine</span>
          <p style="margin-top:6px;"><a href="analysis.html?medicine=${encodeURIComponent(name)}"><strong>${name}</strong></a></p>
        </div>
      </div>`;
  }
})();
