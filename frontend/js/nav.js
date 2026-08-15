// Renders the app header into #app-header on protected pages.
function renderAppNav(activePage) {
  const mount = document.getElementById("app-header");
  if (!mount) return;

  const links = [
    { href: "dashboard.html", label: "Dashboard" },
    { href: "scan.html", label: "Scan" },
    { href: "history.html", label: "History" },
    { href: "profile.html", label: "Profile" },
  ];

  mount.innerHTML = `
    <div class="container">
      <a class="logo" href="dashboard.html">
        ${logoMark()}
        MedGuide AI
      </a>
      <nav class="app-nav">
        ${links.map(l => `<a href="${l.href}" class="${l.href === activePage ? "active" : ""}">${l.label}</a>`).join("")}
        <button class="btn-logout btn-ghost btn-sm" id="logout-btn">Log out</button>
      </nav>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    Auth.clear();
    window.location.href = "index.html";
  });
}

function logoMark() {
  return `<svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="22" height="8" rx="4" transform="rotate(-30 13 13)" fill="var(--teal-tint)" stroke="var(--teal)" stroke-width="1.6"/>
    <path d="M13 13 L18 8" stroke="var(--teal)" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}
