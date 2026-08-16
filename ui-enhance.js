/* Purely presentational — does not define any function the rest of the
   app relies on, and does not overwrite anything from api.js/app.js/etc.
   Safe to include on every page before or after the existing scripts. */
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var nav = document.querySelector(".nav");
    var menuBtn = document.querySelector(".menu-btn");

    // Mobile nav toggle
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("open");
        });
      });
    }

    // Highlight the current page in the nav
    var here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a[href]").forEach(function (a) {
      var target = a.getAttribute("href").split("/").pop();
      if (target === here) a.classList.add("active");
    });
  });
})();
