(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme-toggle");

  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function mode() {
    try {
      var stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return "system";
  }

  function label(current) {
    if (current === "light") return "Light theme";
    if (current === "dark") return "Dark theme";
    return "Theme follows the system setting";
  }

  function paint(current) {
    var dark = current === "dark" || (current === "system" && prefersDark());
    if (dark) {
      root.setAttribute("dark", "");
      root.setAttribute("data-theme", current === "dark" ? "dark" : "auto");
    } else if (current === "light") {
      root.removeAttribute("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("dark");
      root.removeAttribute("data-theme");
    }
  }

  function remember(current) {
    try {
      if (current === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", current);
    } catch (e) {}
  }

  function sync(current) {
    if (!btn) return;
    btn.setAttribute("data-mode", current);
    btn.setAttribute("aria-pressed", current === "system" ? "false" : "true");
    btn.setAttribute("aria-label", label(current));
  }

  function nextMode(current) {
    var systemDark = prefersDark();
    if (current === "system") return systemDark ? "light" : "dark";
    if (current === "light") return systemDark ? "dark" : "system";
    return systemDark ? "system" : "light";
  }

  if (btn) {
    sync(mode());
    btn.addEventListener("click", function () {
      var current = nextMode(mode());
      paint(current);
      remember(current);
      sync(current);
    });
  }

  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (mode() !== "system") return;
      paint("system");
      sync("system");
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
