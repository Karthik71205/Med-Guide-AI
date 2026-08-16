function setupMenu() {
  const button = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");
  if (!button || !nav) return;
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function speak(text, lang = "en-IN") {
  if (!("speechSynthesis" in window)) {
    showToast("Voice output is not supported in this browser.");
    return;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

document.addEventListener("DOMContentLoaded", setupMenu);
