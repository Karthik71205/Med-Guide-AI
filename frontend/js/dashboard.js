(function () {
  Auth.requireAuth();
  renderAppNav("dashboard.html");

  const user = Auth.getUser();
  document.getElementById("welcome-name").textContent = (user && user.name) ? user.name : "there";

  loadProfile();
  loadActivity();

  async function loadProfile() {
    const strip = document.getElementById("profile-strip");
    try {
      const data = await MedGuideAPI.getProfile();
      const p = data.profile || data;
      if (!p || Object.keys(p).length === 0) {
        strip.innerHTML = `<p class="muted">No profile saved yet. <a href="profile.html">Add one</a> so scans can be personalized.</p>`;
        return;
      }
      const conditions = (p.conditions && p.conditions.length) ? p.conditions.join(", ") : "None recorded";
      strip.innerHTML = `
        <div class="stat"><div class="value">${p.age ?? "—"}</div><div class="label">Age</div></div>
        <div class="stat"><div class="value">${p.weight_kg ?? "—"} kg</div><div class="label">Weight</div></div>
        <div class="stat"><div class="value">${(p.preferred_language || "en").toUpperCase()}</div><div class="label">Language</div></div>
        <div class="stat" style="flex:1; min-width:200px;"><div class="value" style="font-size:1rem;">${conditions}</div><div class="label">Conditions</div></div>
      `;
    } catch (err) {
      strip.innerHTML = `<p class="muted">Couldn't load your profile — ${err.message}</p>`;
    }
  }

  async function loadActivity() {
    const card = document.getElementById("activity-card");
    try {
      const data = await MedGuideAPI.getHistory();
      const scans = data.medicine_history || data.scans || data.history || [];
      const reports = data.report_scans || [];
      const entries = [...scans.map(s => ({ ...s, kind: "medicine" })), ...reports.map(r => ({ ...r, kind: "report" }))];

      if (entries.length === 0) {
        card.innerHTML = `<div class="activity-empty"><p>Nothing here yet — scan a medicine to see it appear.</p></div>`;
        return;
      }

      card.innerHTML = `<div class="timeline">${entries.slice(0, 6).map(entryRow).join("")}</div>`;
    } catch (err) {
      card.innerHTML = `<p class="muted">Couldn't load history — ${err.message}</p>`;
    }
  }

  function entryRow(e) {
    const label = e.kind === "report" ? "Report scan" : (e.medicine_name || e.name || "Medicine scan");
    const when = e.created_at || e.timestamp || e.date || "";
    return `
      <div class="timeline-entry">
        <time>${formatWhen(when)}</time>
        <div>
          <strong>${label}</strong>
          <p class="muted">${e.kind === "report" ? "Condition hints extracted from a diagnostic report." : "Recognized and matched against the prototype dataset."}</p>
        </div>
      </div>`;
  }

  function formatWhen(v) {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d)) return String(v).slice(0, 10);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
})();
