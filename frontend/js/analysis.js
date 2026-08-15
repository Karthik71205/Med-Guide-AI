(function () {
  Auth.requireAuth();
  renderAppNav("");

  const params = new URLSearchParams(window.location.search);
  const medicineName = params.get("medicine") || sessionStorage.getItem("mg_pending_medicine");

  if (!medicineName) {
    document.getElementById("loading-state").innerHTML = `<p>No medicine selected. <a href="scan.html">Go back and scan one</a>.</p>`;
    return;
  }

  let currentExplanation = "";
  let currentLanguage = "en";

  runAnalysis();

  async function runAnalysis() {
    try {
      const data = await MedGuideAPI.analyzeMedicine(medicineName);
      renderAnalysis(data);
    } catch (err) {
      document.getElementById("loading-state").innerHTML = `<p>Couldn't analyze "${medicineName}" — ${err.message}</p>`;
    }
  }

  function renderAnalysis(data) {
    document.getElementById("loading-state").style.display = "none";
    document.getElementById("analysis-content").style.display = "block";

    const info = data.medicine_information || data.medicine || {};
    const name = info.name || data.medicine_name || medicineName;
    document.getElementById("med-name").textContent = name;

    const risk = (data.risk_level || (data.risk && data.risk.level) || "low").toString().toLowerCase();
    const badge = document.getElementById("risk-badge");
    badge.textContent = `${risk} risk`;
    badge.className = `badge badge-${["low", "moderate", "high"].includes(risk) ? risk : "low"}`;

    currentExplanation = data.patient_friendly_explanation || data.explanation || data.simple_explanation || "No explanation available.";
    document.getElementById("explanation-text").textContent = currentExplanation;

    fillList("uses-list", data.uses || info.uses);
    fillList("precautions-list", data.precautions || info.precautions);
    fillList("side-effects-list", data.common_side_effects || data.side_effects || info.side_effects);
    fillList("personal-notes-list", data.profile_specific_notes || data.personalized_notes);

    document.getElementById("prescription-guidance").textContent =
      data.prescription_guidance || "Follow the dosage and schedule your physician prescribed. This tool does not set or change dosage.";
    if (data.disclaimer) document.getElementById("disclaimer-text").textContent = data.disclaimer;
  }

  function fillList(id, items) {
    const el = document.getElementById(id);
    if (!items || (Array.isArray(items) && items.length === 0)) {
      el.innerHTML = `<li class="muted">Nothing noted.</li>`;
      return;
    }
    const arr = Array.isArray(items) ? items : [items];
    el.innerHTML = arr.map(i => `<li>${i}</li>`).join("");
  }

  document.getElementById("translate-btn").addEventListener("click", async () => {
    const lang = document.getElementById("translate-lang").value;
    const btn = document.getElementById("translate-btn");
    btn.disabled = true;
    try {
      const data = await MedGuideAPI.translate(currentExplanation, lang);
      currentLanguage = lang;
      const out = document.getElementById("translated-out");
      const textEl = document.getElementById("translated-text");
      textEl.textContent = data.translated_text || data.text || data.translation || "";
      textEl.setAttribute("lang", lang);
      out.classList.add("show");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("speak-btn").addEventListener("click", async () => {
    const btn = document.getElementById("speak-btn");
    btn.disabled = true;
    try {
      const translatedText = document.getElementById("translated-text").textContent;
      const text = translatedText || currentExplanation;
      const lang = translatedText ? currentLanguage : "en";
      const data = await MedGuideAPI.speak(text, lang);
      const url = data.audio_url || data.url;
      if (!url) { showToast("Voice output isn't available on this backend right now.", true); return; }
      const audio = document.getElementById("tts-audio");
      audio.src = url.startsWith("http") ? url : `${window.MEDGUIDE_API_BASE || "http://127.0.0.1:5000"}${url}`;
      audio.style.display = "block";
      audio.play();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("btn-consult").addEventListener("click", async () => {
    try { await MedGuideAPI.consultDoctor("General Physician"); showToast("Consultation request created (demo only)."); }
    catch (err) { showToast(err.message, true); }
  });
  document.getElementById("btn-book-test").addEventListener("click", async () => {
    try { await MedGuideAPI.bookTest("HbA1c"); showToast("Test booking created (demo only)."); }
    catch (err) { showToast(err.message, true); }
  });
  document.getElementById("btn-order").addEventListener("click", async () => {
    try { await MedGuideAPI.orderMedicine(medicineName); showToast("Order request created (demo only)."); }
    catch (err) { showToast(err.message, true); }
  });
})();
