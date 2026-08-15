(function () {
  Auth.requireAuth();
  renderAppNav("scan.html");

  const params = new URLSearchParams(window.location.search);
  const tabs = document.querySelectorAll("#scan-tabs button");
  tabs.forEach(btn => btn.addEventListener("click", () => switchPanel(btn.dataset.panel)));
  if (params.get("mode") === "report") switchPanel("report");

  function switchPanel(name) {
    tabs.forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    document.querySelectorAll(".scan-panel").forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
  }

  let recognizedMedicineName = null;

  // ---- Medicine: file upload ----
  setupDropzone("med-dropzone", "med-file-input", async (file) => {
    setFramePreview("med-dropzone", file);
    await runMedicineScan(file);
  });

  // ---- Medicine: manual text ----
  document.getElementById("recognize-btn").addEventListener("click", async () => {
    const text = document.getElementById("manual-text").value.trim();
    if (!text) { showToast("Type a medicine name first", true); return; }
    await runMedicineRecognize(text);
  });

  async function runMedicineScan(file) {
    try {
      showToast("Reading the image…");
      const data = await MedGuideAPI.scanMedicine(file);
      displayMedicineResult(data);
    } catch (err) {
      showToast(err.message, true);
    }
  }

  async function runMedicineRecognize(text) {
    try {
      const data = await MedGuideAPI.recognizeMedicine(text);
      displayMedicineResult(data, text);
    } catch (err) {
      showToast(err.message, true);
    }
  }

  function displayMedicineResult(data, manualText) {
    const box = document.getElementById("med-result");
    box.classList.add("show");
    const ocrText = data.ocr_text || data.text || manualText || "—";
    document.getElementById("med-result-ocr").textContent = ocrText;

    const match = data.medicine || data.match || data;
    const name = match.name || match.medicine_name || match.slug || "No confident match";
    recognizedMedicineName = match.slug || match.name || match.medicine_name || manualText;

    document.getElementById("med-result-name").textContent = name;
    document.getElementById("med-result-sub").textContent = match.slug ? `slug: ${match.slug}` : "Tap Analyze to get the full, personalized breakdown.";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.getElementById("analyze-btn").addEventListener("click", () => {
    if (!recognizedMedicineName) { showToast("Recognize a medicine first", true); return; }
    sessionStorage.setItem("mg_pending_medicine", recognizedMedicineName);
    window.location.href = `analysis.html?medicine=${encodeURIComponent(recognizedMedicineName)}`;
  });

  // ---- Report scan ----
  setupDropzone("report-dropzone", "report-file-input", async (file) => {
    setFramePreview("report-dropzone", file);
    try {
      showToast("Reading the report…");
      const data = await MedGuideAPI.scanReport(file);
      const box = document.getElementById("report-result");
      box.classList.add("show");
      const hints = data.condition_hints || data.hints || data.conditions || [];
      const hintsEl = document.getElementById("report-hints");
      hintsEl.innerHTML = hints.length
        ? hints.map(h => `<span class="badge badge-moderate" style="margin:0 8px 8px 0;">${h}</span>`).join("")
        : `<p class="muted">No condition keywords were confidently detected.</p>`;
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      showToast(err.message, true);
    }
  });

  function setupDropzone(zoneId, inputId, onFile) {
    // The <input type=file> is nested inside the <label> zone, so a click on the
    // zone already opens the file dialog natively — no extra click handler needed.
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    input.addEventListener("change", () => { if (input.files[0]) onFile(input.files[0]); });
    ["dragover", "dragenter"].forEach(evt => zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.add("drag-over"); }));
    ["dragleave", "drop"].forEach(evt => zone.addEventListener(evt, (e) => { e.preventDefault(); zone.classList.remove("drag-over"); }));
    zone.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) onFile(f); });
  }

  function setFramePreview(zoneId, file) {
    const zone = document.getElementById(zoneId);
    const url = URL.createObjectURL(file);
    zone.querySelector(".frame-text").textContent = file.name;
    let img = zone.querySelector("img.preview");
    if (!img) {
      img = document.createElement("img");
      img.className = "preview";
      zone.insertBefore(img, zone.querySelector(".frame-hint"));
    }
    img.src = url;
  }
})();
