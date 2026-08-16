requireAuth();

function setLanguage(language) {
  localStorage.setItem("medguide_language", language);
  showToast(`Preferred language set to ${language}.`);
}

function clearLocalSession() {
  sessionStorage.removeItem("last_analysis");
  sessionStorage.removeItem("ocr_result");
  sessionStorage.removeItem("selected_medicine");
  showToast("Temporary analysis data cleared.");
}
