(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");

  function isDark() {
    return root.hasAttribute("dark");
  }

  function sync() {
    if (!btn) return;
    var dark = isDark();
    btn.setAttribute("aria-pressed", dark ? "true" : "false");
    btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  if (btn) {
    btn.addEventListener("click", function () {
      if (isDark()) {
        root.removeAttribute("dark");
        root.setAttribute("data-theme", "light");
        try { localStorage.setItem("theme", "light"); } catch (e) {}
      } else {
        root.setAttribute("dark", "");
        root.setAttribute("data-theme", "dark");
        try { localStorage.setItem("theme", "dark"); } catch (e) {}
      }
      sync();
    });
    sync();
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (event) {
      var stored = null;
      try { stored = localStorage.getItem("theme"); } catch (e) {}
      if (stored === "light" || stored === "dark") return;
      if (event.matches) {
        root.setAttribute("dark", "");
        root.setAttribute("data-theme", "auto");
      } else {
        root.removeAttribute("dark");
        root.removeAttribute("data-theme");
      }
      sync();
    });
  }

  var kudos = document.querySelector(".kudos");
  if (!kudos) return;

  var slug = kudos.getAttribute("data-kudos") || "";
  var endpoint = kudos.getAttribute("data-endpoint") || "";
  var countEl = kudos.querySelector(".kudos-count");
  var key = "kudo:" + slug;
  var holdMs = 800;
  var timer = null;
  var holding = false;
  var given = false;

  try { given = localStorage.getItem(key) === "1"; } catch (e) {}

  function showCount(value) {
    if (!countEl) return;
    if (typeof value !== "number" || isNaN(value)) {
      countEl.textContent = "";
      countEl.classList.remove("is-spoken");
      return;
    }
    countEl.classList.remove("is-spoken");
    countEl.textContent = String(value);
  }

  function speak(text) {
    if (!countEl) return;
    countEl.classList.add("is-spoken");
    countEl.textContent = text;
  }

  function markGiven() {
    given = true;
    kudos.classList.add("is-given");
    kudos.classList.remove("is-holding");
    kudos.setAttribute("aria-pressed", "true");
    kudos.setAttribute("aria-label", "Kudo given");
    try { localStorage.setItem(key, "1"); } catch (e) {}
  }

  if (given) markGiven();

  function readCount(response) {
    if (!response.ok) throw new Error("kudos");
    return response.json();
  }

  if (endpoint) {
    fetch(endpoint + "?slug=" + encodeURIComponent(slug), { method: "GET" })
      .then(readCount)
      .then(function (data) {
        showCount(data && typeof data.count === "number" ? data.count : null);
      })
      .catch(function () { showCount(null); });
  }

  function start(event) {
    if (given || holding) return;
    if (event && event.repeat) return;
    holding = true;
    kudos.classList.add("is-holding");
    timer = window.setTimeout(commit, holdMs);
  }

  function cancel() {
    if (!holding || given) return;
    holding = false;
    kudos.classList.remove("is-holding");
    window.clearTimeout(timer);
  }

  function commit() {
    if (!holding || given) return;
    holding = false;
    window.clearTimeout(timer);
    kudos.classList.add("is-pop");
    markGiven();
    if (!endpoint) {
      speak("Kudo given");
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slug })
    })
      .then(readCount)
      .then(function (data) {
        if (data && typeof data.count === "number") showCount(data.count);
        else speak("Kudo given");
      })
      .catch(function () { speak("Kudo given"); });
  }

  kudos.addEventListener("pointerdown", function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (given) return;
    try { kudos.setPointerCapture(event.pointerId); } catch (e) {}
    start(event);
  });
  kudos.addEventListener("pointerup", cancel);
  kudos.addEventListener("pointercancel", cancel);
  kudos.addEventListener("keydown", function (event) {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    start(event);
  });
  kudos.addEventListener("keyup", function (event) {
    if (event.key === " " || event.key === "Enter") cancel();
  });
  kudos.addEventListener("blur", cancel);
})();
