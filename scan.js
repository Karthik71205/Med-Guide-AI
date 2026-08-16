requireAuth();

const scanFile = document.getElementById("scanFile");
const preview = document.getElementById("preview");

if (scanFile) {
  scanFile.addEventListener("change", () => {
    const file = scanFile.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  });
}

async function analyzeMedicineImage() {
  const file = scanFile.files[0];
  if (!file) return showToast("Select a medicine image first.");

  const form = new FormData();
  form.append("file", file);

  try {
    const data = await formPost("/medicine/analyze", form);
    document.getElementById("scanResult").innerHTML = `
      <div class="medicine-card">
        <span class="severity info">VERIFY OCR</span>
        <h3>${data.medicine.medicine_name}</h3>
        <p><strong>Brand:</strong> ${data.medicine.brand_name}</p>
        <p><strong>Generic:</strong> ${data.medicine.generic_name}</p>
        <p><strong>Strength:</strong> ${data.medicine.strength}</p>
        <p><strong>Form:</strong> ${data.medicine.medicine_type}</p>
        <button class="btn btn-primary" onclick='useMedicine(${JSON.stringify(data.medicine.medicine_name)})'>Use for analysis</button>
      </div>`;
  } catch (error) {
    showToast(error.message);
  }
}

function useMedicine(name) {
  sessionStorage.setItem("selected_medicine", name);
  window.location.href = "results.html?manual=1";
}
