requireAuth();

async function loadSubscription() {
  try {
    const data = await api("/subscription");
    document.getElementById("currentPlan").textContent = data.plan.toUpperCase();
  } catch {}
}

async function choosePlan(plan) {
  try {
    await jsonPost("/subscription", {plan});
    showToast(`${plan} plan selected in demo mode.`);
    loadSubscription();
  } catch (error) {
    showToast(error.message);
  }
}

document.addEventListener("DOMContentLoaded", loadSubscription);
