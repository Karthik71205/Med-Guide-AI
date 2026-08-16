const API_BASE = "http://127.0.0.1:5000/api";

function token() {
  return sessionStorage.getItem("medguide_token") || "";
}

function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (token()) h["Authorization"] = `Bearer ${token()}`;
  return h;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers(options.body instanceof FormData ? false : true),
      ...(options.headers || {})
    }
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload.data;
}

function jsonPost(path, data) {
  return api(path, {
    method: "POST",
    body: JSON.stringify(data)
  });
}

function formPost(path, formData) {
  return api(path, {
    method: "POST",
    body: formData
  });
}

function showToast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}
