requireAuth();

const prescriptionFile = document.getElementById("prescriptionFile");
const prescriptionPreview = document.getElementById("prescriptionPreview");

if (prescriptionFile) {
  prescriptionFile.addEventListener("change", () => {
    const file = prescriptionFile.files[0];
    if (!file) return;
    prescriptionPreview.src = URL.createObjectURL(file);
    prescriptionPreview.style.display = "block";
  });
}

async function analyzePrescription() {
  const file = prescriptionFile.files[0];
  if (!file) return showToast("Select a prescription image.");

  document.getElementById("processing").classList.remove("hidden");

  const form = new FormData();
  form.append("file", file);

  try {
    const data = await formPost("/prescription/analyze", form);
    sessionStorage.setItem("ocr_result", JSON.stringify(data));
    window.location.href = "results.html?ocr=1";
  } catch (error) {
    showToast(error.message);
  } finally {
    document.getElementById("processing").classList.add("hidden");
  }
}
