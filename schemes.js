async function loadSchemes() {
  try {
    const schemes = await api("/schemes");
    document.getElementById("schemes").innerHTML = schemes.map(s => `
      <div class="card scheme-card">
        <h2>${s.name}</h2>
        <p>${s.description}</p>
        <div><strong>Benefits</strong><ul>${s.benefits.map(b => `<li>${b}</li>`).join("")}</ul></div>
        <p><strong>Eligibility:</strong> ${s.eligibility}</p>
        <a class="btn btn-primary" href="${s.official_url}" target="_blank" rel="noopener">Visit Official Website</a>
      </div>
    `).join("");
  } catch (error) {
    showToast(error.message);
  }
}
document.addEventListener("DOMContentLoaded", loadSchemes);
