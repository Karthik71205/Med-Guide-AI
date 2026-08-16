requireAuth();

function renderSafety(safety) {
  const warnings = safety?.warnings || [];
  const interactions = safety?.interactions || [];

  const warningHtml = warnings.length
    ? warnings.map(w => `<div class="alert ${w.level === "high" ? "alert-danger" : "alert-warning"}"><strong>${w.title}</strong><p>${w.message}</p></div>`).join("")
    : `<div class="alert alert-success"><strong>No patient-specific warning identified</strong><p>No warning was identified by the prototype rules. This does not prove a medicine or combination is safe.</p></div>`;

  const interactionHtml = interactions.length
    ? interactions.map(i => `
      <article class="interaction-card">
        <span class="severity ${(i.severity || "info").toLowerCase()}">${i.severity}</span>
        <h3>${i.drug1} + ${i.drug2}</h3>
        <p><strong>Why:</strong> ${i.mechanism}</p>
        <p><strong>Possible effect:</strong> ${i.effect}</p>
      </article>`).join("")
    : `<div class="empty compact">No matching interaction was found in the prototype reference data. This does not prove that a combination is safe.</div>`;

  return `${warningHtml}<div class="subsection-title"><span>INTERACTION REVIEW</span><h3>Medicine combinations</h3></div>${interactionHtml}`;
}

async function runAnalysis(medicines, language = "en") {
  try {
    const data = await jsonPost("/analysis/run", { medicines, language });
    sessionStorage.setItem("last_analysis", JSON.stringify(data));
    renderResult(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showToast(error.message);
  }
}

function renderResult(data) {
  const langCode = data.language === "te" ? "te-IN" : data.language === "hi" ? "hi-IN" : "en-IN";
  document.getElementById("resultContent").innerHTML = `
    <div class="alert alert-warning reveal"><strong>Important</strong><p>${data.medical_disclaimer}</p></div>

    <section class="result-section reveal">
      <div class="result-section-head"><div><span class="section-kicker">01 · MEDICINE INFORMATION</span><h2>What was found</h2></div><span class="result-badge">REVIEW</span></div>
      <div class="medicine-results">
        ${data.medicines.map(m => `
          <article class="medicine-result">
            <div class="medicine-result-icon">✚</div>
            <div class="medicine-result-head"><h3>${m.medicine_name}</h3><span>${m.medicine_type}</span></div>
            <div class="detail-grid">
              <div><small>Brand</small><strong>${m.brand_name}</strong></div>
              <div><small>Generic</small><strong>${m.generic_name}</strong></div>
              <div><small>Strength</small><strong>${m.strength}</strong></div>
            </div>
            <div class="info-block"><small>Common uses</small><p>${m.common_uses}</p></div>
            <div class="info-block"><small>Precautions</small><p>${m.precautions}</p></div>
            <div class="info-block"><small>Possible side effects</small><p>${m.side_effects}</p></div>
          </article>`).join("")}
      </div>
    </section>

    <section class="result-section safety-section reveal">
      <div class="result-section-head"><div><span class="section-kicker">02 · SAFETY REVIEW</span><h2>Pause, check, confirm</h2></div><span class="safety-heart">♥</span></div>
      ${renderSafety(data.safety)}
    </section>

    <section class="result-section explanation-section reveal">
      <div class="result-section-head"><div><span class="section-kicker">03 · SIMPLE EXPLANATION</span><h2>In plain language</h2></div><span class="voice-badge">◖ VOICE</span></div>
      <div class="explanation-box"><p id="explanation">${data.ai_explanation}</p></div>
      <div class="actions"><button class="btn btn-primary" onclick="speak(document.getElementById('explanation').innerText,'${langCode}')">▶ Play aloud</button><button class="btn btn-outline" onclick="stopSpeaking()">■ Stop</button></div>
    </section>`;
}

async function loadResults() {
  const params = new URLSearchParams(location.search);

  if (params.get("id")) {
    try {
      const data = await api(`/analysis/${encodeURIComponent(params.get("id"))}`);
      renderResult(data);
      return;
    } catch (error) {
      showToast(error.message);
    }
  }

  if (params.get("ocr")) {
    const ocr = JSON.parse(sessionStorage.getItem("ocr_result") || "{}");
    document.getElementById("verification").innerHTML = `
      <section class="verification-card reveal">
        <div class="result-section-head"><div><span class="section-kicker">PRESCRIPTION OCR</span><h2>Verify extracted medicines</h2></div><span class="result-badge">VERIFY</span></div>
        <div class="alert alert-warning"><strong>OCR can be wrong.</strong><p>Verify medicine name, strength, dosage, frequency, duration and instructions before continuing.</p></div>
        <div class="ocr-list">${(ocr.items || []).map((x, i) => `
          <div class="ocr-item"><div class="medicine-result-icon">✚</div><div><label for="ocr_${i}">Medicine name</label><input id="ocr_${i}" value="${x.medicine_name || ""}"><p>Strength: ${x.strength || "—"} · Dosage: ${x.dosage || "—"} · ${x.frequency || "—"} · ${x.duration || "—"}</p></div></div>`).join("")}</div>
        <button class="btn btn-primary btn-lg" onclick="analyzeVerifiedOCR()">Continue safety analysis →</button>
      </section>`;
    return;
  }

  const manual = sessionStorage.getItem("selected_medicine");
  if (manual) {
    document.getElementById("verification").innerHTML = `
      <section class="verification-card reveal"><span class="section-kicker">MANUAL MEDICINE</span><h2>Ready to analyze</h2><p>Selected medicine: <strong>${manual}</strong></p><button class="btn btn-primary btn-lg" onclick='runAnalysis([${JSON.stringify(manual)}])'>Analyze medicine →</button></section>`;
  }
}

function analyzeVerifiedOCR() {
  const items = [...document.querySelectorAll("[id^='ocr_']")].map(x => x.value).filter(Boolean);
  if (!items.length) return showToast("No medicine names were found.");
  runAnalysis(items);
}

async function changeLanguage(language) {
  const data = JSON.parse(sessionStorage.getItem("last_analysis") || "{}");
  if (!data.medicines) return showToast("Run an analysis first.");
  await runAnalysis(data.medicines.map(x => x.medicine_name), language);
}

document.addEventListener("DOMContentLoaded", loadResults);
