requireAuth();

function renderSafety(safety) {
  const warnings = safety.warnings || [];
  const interactions = safety.interactions || [];

  const warningHtml = warnings.length
    ? warnings.map(w => `<div class="alert ${w.level === "high" ? "alert-danger" : "alert-warning"}"><strong>${w.title}</strong><br>${w.message}</div>`).join("")
    : `<div class="alert alert-success">No patient-specific warning was identified by the prototype rules.</div>`;

  const interactionHtml = interactions.length
    ? interactions.map(i => `
      <div class="medicine-card">
        <span class="severity ${i.severity.toLowerCase()}">${i.severity}</span>
        <h3>${i.drug1} + ${i.drug2}</h3>
        <p><strong>Why:</strong> ${i.mechanism}</p>
        <p><strong>Possible effect:</strong> ${i.effect}</p>
      </div>`).join("")
    : `<div class="empty">No matching interaction was found in the prototype reference data. This does not prove that a combination is safe.</div>`;

  return warningHtml + `<h3>Interactions</h3>` + interactionHtml;
}

async function runAnalysis(medicines, language = "en") {
  try {
    const data = await jsonPost("/analysis/run", {medicines, language});
    sessionStorage.setItem("last_analysis", JSON.stringify(data));
    renderResult(data);
  } catch (error) {
    showToast(error.message);
  }
}

function renderResult(data) {
  document.getElementById("resultContent").innerHTML = `
    <div class="alert alert-warning"><strong>Important:</strong> ${data.medical_disclaimer}</div>

    <div class="card result-card">
      <h2>Medicine Information</h2>
      <div class="grid">
        ${data.medicines.map(m => `
          <div class="medicine-card">
            <h3>${m.medicine_name}</h3>
            <p><strong>Brand:</strong> ${m.brand_name}</p>
            <p><strong>Generic:</strong> ${m.generic_name}</p>
            <p><strong>Strength:</strong> ${m.strength}</p>
            <p><strong>Type:</strong> ${m.medicine_type}</p>
            <p>${m.common_uses}</p>
            <p><strong>Precautions:</strong> ${m.precautions}</p>
            <p><strong>Possible side effects:</strong> ${m.side_effects}</p>
          </div>`).join("")}
      </div>
    </div>

    <div class="card result-card">
      <h2>Safety Review</h2>
      ${renderSafety(data.safety)}
    </div>

    <div class="card result-card">
      <h2>Simple Explanation</h2>
      <p id="explanation">${data.ai_explanation}</p>
      <div class="actions">
        <button class="btn btn-primary" onclick="speak(document.getElementById('explanation').innerText, '${data.language === "te" ? "te-IN" : data.language === "hi" ? "hi-IN" : "en-IN"}')">▶ Play</button>
        <button class="btn btn-outline" onclick="stopSpeaking()">■ Stop</button>
      </div>
    </div>`;
}

async function loadResults() {
  const params = new URLSearchParams(location.search);

  if (params.get("id")) {
    try {
      const data = await api(`/analysis/${params.get("id")}`);
      renderResult(data);
      return;
    } catch (error) {
      showToast(error.message);
    }
  }

  if (params.get("ocr")) {
    const ocr = JSON.parse(sessionStorage.getItem("ocr_result") || "{}");
    document.getElementById("verification").innerHTML = `
      <div class="card">
        <h2>Verify extracted prescription</h2>
        <div class="alert alert-warning">OCR can be wrong. Verify every medicine, strength, dosage, frequency, duration and instruction before continuing.</div>
        ${ocr.items?.map((x, i) => `
          <div class="medicine-card">
            <input id="ocr_${i}" value="${x.medicine_name}" aria-label="Medicine name">
            <p>Strength: ${x.strength} · Dosage: ${x.dosage} · ${x.frequency} · ${x.duration}</p>
          </div>`).join("")}
        <button class="btn btn-primary" onclick="analyzeVerifiedOCR()">Continue safety analysis</button>
      </div>`;
    return;
  }

  const manual = sessionStorage.getItem("selected_medicine");
  if (manual) {
    document.getElementById("verification").innerHTML = `
      <div class="card">
        <h2>Manual medicine</h2>
        <p>Selected: <strong>${manual}</strong></p>
        <button class="btn btn-primary" onclick="runAnalysis(['${manual}'])">Analyze</button>
      </div>`;
  }
}

function analyzeVerifiedOCR() {
  const items = [...document.querySelectorAll("[id^='ocr_']")].map(x => x.value).filter(Boolean);
  runAnalysis(items);
}

async function changeLanguage(language) {
  const data = JSON.parse(sessionStorage.getItem("last_analysis") || "{}");
  if (!data.medicines) return showToast("Run an analysis first.");
  await runAnalysis(data.medicines.map(x => x.medicine_name), language);
}

document.addEventListener("DOMContentLoaded", loadResults);
