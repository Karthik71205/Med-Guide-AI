async function loadSchemes() {
  try {
    const schemes = await api("/schemes");
    document.getElementById("schemes").innerHTML = schemes.map((s, i) => `
      <article class="scheme-card">
        <div class="scheme-icon">${i % 2 ? "♥" : "✚"}</div>
        <span class="section-kicker">HEALTHCARE SUPPORT</span>
        <h2>${s.name}</h2>
        <p>${s.description}</p>
        <div class="benefits"><strong>Benefits</strong><ul>${s.benefits.map(b => `<li>${b}</li>`).join("")}</ul></div>
        <p class="eligibility"><strong>Eligibility:</strong> ${s.eligibility}</p>
        <a class="btn btn-primary" href="${s.official_url}" target="_blank" rel="noopener">Visit official website →</a>
      </article>
    `).join("");
  } catch (error) {
    showToast(error.message);
  }
}
document.addEventListener("DOMContentLoaded", loadSchemes);
