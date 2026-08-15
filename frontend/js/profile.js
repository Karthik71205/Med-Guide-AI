(function () {
  Auth.requireAuth();
  renderAppNav("profile.html");

  let conditions = [];
  const chipsEl = document.getElementById("conditions-chips");
  const conditionInput = document.getElementById("condition-input");

  loadProfile();

  async function loadProfile() {
    try {
      const data = await MedGuideAPI.getProfile();
      const p = data.profile || data || {};
      if (p.age) document.getElementById("age").value = p.age;
      if (p.sex) document.getElementById("sex").value = p.sex;
      if (p.weight_kg) document.getElementById("weight").value = p.weight_kg;
      if (p.preferred_language) document.getElementById("preferred_language").value = p.preferred_language;
      conditions = Array.isArray(p.conditions) ? [...p.conditions] : [];
      renderChips();
    } catch (err) {
      // No profile saved yet is a normal state — nothing to prefill.
    }
  }

  conditionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = conditionInput.value.trim();
      if (val && !conditions.includes(val.toLowerCase())) {
        conditions.push(val.toLowerCase());
        renderChips();
      }
      conditionInput.value = "";
    }
  });

  function renderChips() {
    chipsEl.innerHTML = conditions.map((c, i) => `
      <span class="chip">${c}<button type="button" data-i="${i}" aria-label="Remove ${c}">×</button></span>
    `).join("");
    chipsEl.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        conditions.splice(Number(btn.dataset.i), 1);
        renderChips();
      });
    });
  }

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      await MedGuideAPI.saveProfile({
        age: Number(document.getElementById("age").value),
        sex: document.getElementById("sex").value,
        weight_kg: Number(document.getElementById("weight").value),
        conditions,
        preferred_language: document.getElementById("preferred_language").value,
      });
      showToast("Profile saved");
    } catch (err) {
      showToast(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });
})();
