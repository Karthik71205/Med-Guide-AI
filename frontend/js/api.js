// MedGuide AI — API client
// Talks to the Flask backend described in API_REFERENCE.md

const API_BASE = window.MEDGUIDE_API_BASE || "http://127.0.0.1:5000/api";
const TOKEN_KEY = "mg_token";
const USER_KEY = "mg_user";

const Auth = {
  getToken() { return localStorage.getItem(TOKEN_KEY); },
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch { return null; }
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLoggedIn() { return !!this.getToken(); },
  requireAuth() {
    if (!this.isLoggedIn()) window.location.href = "index.html";
  }
};

async function apiFetch(path, { method = "GET", body, isMultipart = false } = {}) {
  const headers = {};
  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let fetchBody = body;
  if (body && !isMultipart) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: fetchBody });
  } catch (err) {
    throw new Error("Can't reach the MedGuide AI backend. Is it running on 127.0.0.1:5000?");
  }

  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

const MedGuideAPI = {
  health: () => apiFetch("/health"),

  register: (name, email, password) =>
    apiFetch("/auth/register", { method: "POST", body: { name, email, password } }),

  login: (email, password) =>
    apiFetch("/auth/login", { method: "POST", body: { email, password } }),

  getProfile: () => apiFetch("/profile"),
  saveProfile: (profile) => apiFetch("/profile", { method: "PUT", body: profile }),

  scanReport: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiFetch("/health/reports/scan", { method: "POST", body: fd, isMultipart: true });
  },

  getHistory: () => apiFetch("/health/history"),

  seedMedicines: () => apiFetch("/medicines/seed", { method: "POST" }),

  scanMedicine: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return apiFetch("/medicines/scan", { method: "POST", body: fd, isMultipart: true });
  },

  recognizeMedicine: (text) =>
    apiFetch("/medicines/recognize", { method: "POST", body: { text } }),

  getMedicine: (slug) => apiFetch(`/medicines/${encodeURIComponent(slug)}`),

  analyzeMedicine: (medicine_name) =>
    apiFetch("/medicines/analyze", { method: "POST", body: { medicine_name } }),

  translate: (text, target_language) =>
    apiFetch("/medicines/translate", { method: "POST", body: { text, target_language } }),

  speak: (text, language) =>
    apiFetch("/medicines/speak", { method: "POST", body: { text, language } }),

  consultDoctor: (specialty) =>
    apiFetch("/actions/consult-doctor", { method: "POST", body: { specialty } }),

  bookTest: (test_name) =>
    apiFetch("/actions/book-test", { method: "POST", body: { test_name } }),

  orderMedicine: (medicine_name) =>
    apiFetch("/actions/order-medicine", { method: "POST", body: { medicine_name } }),
};

function showToast(message, isError = false) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle("error", isError);
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 3200);
}
