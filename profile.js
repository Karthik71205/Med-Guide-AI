requireAuth();

async function loadProfile() {
  try {
    const p = await api("/profile");
    for (const key of ["name","age","sex","weight"]) {
      if (document.getElementById(key)) document.getElementById(key).value = p[key] ?? "";
    }
    document.getElementById("medical_conditions").value = (p.medical_conditions || []).join(", ");
    document.getElementById("allergies").value = (p.allergies || []).join(", ");
    document.getElementById("current_medicines").value = (p.current_medicines || []).join(", ");
  } catch {}
}

async function saveProfile(event) {
  event.preventDefault();
  const split = id => document.getElementById(id).value
    .split(",").map(x => x.trim()).filter(Boolean);

  const data = {
    name: document.getElementById("name").value.trim(),
    age: document.getElementById("age").value,
    sex: document.getElementById("sex").value,
    weight: document.getElementById("weight").value,
    medical_conditions: split("medical_conditions"),
    allergies: split("allergies"),
    current_medicines: split("current_medicines")
  };

  try {
    await jsonPost("/profile/update", data);
    showToast("Profile saved.");
  } catch (error) {
    showToast(error.message);
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
