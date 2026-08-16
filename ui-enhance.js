(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.body.classList.add("page-ready");

    document.querySelectorAll(".nav a[data-nav]").forEach(function (a) {
      const here = location.pathname.split("/").pop() || "index.html";
      if (a.dataset.nav === here) a.classList.add("active");
    });

    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.setProperty("--reveal-delay", `${Math.min(i * 45, 240)}ms`);
      el.classList.add("reveal-ready");
    });

    const toggle = document.querySelector(".password-toggle");
    const password = document.querySelector("#password");
    if (toggle && password) {
      toggle.addEventListener("click", function () {
        const visible = password.type === "text";
        password.type = visible ? "password" : "text";
        toggle.textContent = visible ? "Show" : "Hide";
      });
    }

    document.querySelectorAll(".btn").forEach(btn => {
      btn.addEventListener("click", function () {
        if (!this.classList.contains("is-loading") && this.dataset.noRipple !== "true") {
          this.classList.add("clicked");
          setTimeout(() => this.classList.remove("clicked"), 350);
        }
      });
    });
  });
})();
