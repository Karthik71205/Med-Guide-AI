requireAuth();

function setLanguage(language) {
  localStorage.setItem("medguide_language", language);
  const labels = { en: "English", te: "Telugu", hi: "Hindi" };
  showToast(`Preferred language set to ${labels[language] || language}.`);
}

function clearLocalSession() {
  sessionStorage.removeItem("last_analysis");
  sessionStorage.removeItem("ocr_result");
  sessionStorage.removeItem("selected_medicine");
  showToast("Temporary analysis data cleared.");
}
