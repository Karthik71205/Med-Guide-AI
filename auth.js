function requireAuth() {
  if (!sessionStorage.getItem("medguide_token")) {
    window.location.href = "login.html";
  }
}

function logout() {
  sessionStorage.removeItem("medguide_token");
  sessionStorage.removeItem("medguide_user");
  window.location.href = "login.html";
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const button = event.submitter || event.target.querySelector("button[type='submit']");
  if (button) { button.disabled = true; button.classList.add("is-loading"); }
  try {
    const data = await jsonPost("/auth/login", { email, password });
    sessionStorage.setItem("medguide_token", data.access_token);
    sessionStorage.setItem("medguide_user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (error) {
    showToast(error.message);
  } finally {
    if (button) { button.disabled = false; button.classList.remove("is-loading"); }
  }
}

async function register(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm_password = document.getElementById("confirm_password").value;
  if (password !== confirm_password) return showToast("Passwords do not match.");
  try {
    await jsonPost("/auth/register", { email, password, confirm_password });
    showToast("Account created. You can now log in.");
    setTimeout(() => window.location.href = "login.html", 900);
  } catch (error) {
    showToast(error.message);
  }
}
