requireAuth();

const scanFile = document.getElementById("scanFile");
const preview = document.getElementById("preview");

scanFile?.addEventListener("change", () => {
  const file = scanFile.files[0];
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  document.getElementById("scanDrop")?.classList.add("has-file");
});

async function analyzeMedicineImage() {
  const file = scanFile?.files[0];
  if (!file) return showToast("Select a medicine image first.");
  const form = new FormData();
  form.append("file", file);
  const button = document.querySelector(".center-actions .btn-primary");
  button?.classList.add("is-loading");
  try {
    const data = await formPost("/medicine/analyze", form);
    document.getElementById("scanResult").innerHTML = `
      <article class="analysis-preview">
        <div class="analysis-preview-head"><span class="severity info">VERIFY OCR</span><span>Recognized medicine</span></div>
        <h3>${data.medicine.medicine_name}</h3>
        <div class="detail-grid">
          <div><small>Brand</small><strong>${data.medicine.brand_name}</strong></div>
          <div><small>Generic</small><strong>${data.medicine.generic_name}</strong></div>
          <div><small>Strength</small><strong>${data.medicine.strength}</strong></div>
          <div><small>Form</small><strong>${data.medicine.medicine_type}</strong></div>
        </div>
        <button class="btn btn-primary" onclick='useMedicine(${JSON.stringify(data.medicine.medicine_name)})'>Use for analysis →</button>
      </article>`;
  } catch (error) {
    showToast(error.message);
  } finally {
    button?.classList.remove("is-loading");
  }
}

function useMedicine(name) {
  sessionStorage.setItem("selected_medicine", name);
  window.location.href = "results.html?manual=1";
}

function clearScan() {
  if (scanFile) scanFile.value = "";
  if (preview) { preview.removeAttribute("src"); preview.style.display = "none"; }
  const result = document.getElementById("scanResult");
  if (result) result.innerHTML = "";
}
