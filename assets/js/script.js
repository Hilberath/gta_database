// Util: include components
async function include(selector, url) {
  const container = document.querySelector(selector);
  if (!container) return;
  const res = await fetch(url, { cache: "no-cache" });
  container.innerHTML = await res.text();
}

// Theme toggle
function setupThemeToggle() {
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const updateIcon = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    const icon = btn.querySelector(".icon");
    if (icon) icon.textContent = isLight ? "☀" : "☾";
  };
  updateIcon();
  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", current);
    localStorage.setItem("theme", current);
    updateIcon();
  });
}

// i18n
let i18n = { current: "de", dict: {} };
async function loadLang(lang) {
  const res = await fetch(`lang/${lang}.json?ts=${Date.now()}`);
  if (!res.ok) return;
  i18n.dict = await res.json();
  i18n.current = lang;
  applyI18n();
  // update dynamic labels that depend on i18n (e.g., entries suffix)
  refreshTileLabels();
}
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = key.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), i18n.dict);
    if (typeof value === "string") el.textContent = value;
  });
}
function setupLanguageSwitch() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      localStorage.setItem("lang", lang);
      loadLang(lang);
    });
  });
}

// Active nav highlight
function highlightActiveNav() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;
  const links = nav.querySelectorAll("a[href]");
  const path = window.location.pathname;
  const pathEnd = path.split("/").filter(Boolean).slice(-2).join("/"); // e.g. pages/mapview or index.html
  const file = path.split("/").pop() || "index.html";

  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    const hrefEnd = href.split("/").filter(Boolean).slice(-2).join("/");
    const hrefFile = href.split("/").pop();
    const isIndex = file === "index.html" && (href === "index.html" || href === "./" || href === "/");
    const isExactFile = hrefFile && hrefFile === file;
    const isNestedMatch = hrefEnd && pathEnd && pathEnd.endsWith(hrefEnd);
    if (isIndex || isExactFile || isNestedMatch) {
      a.classList.add("active");
    }
  });
}

// Boot
document.addEventListener("DOMContentLoaded", async () => {
  await include("#header-include", "components/header.html");
  await include("#footer-include", "components/footer.html");
  // After include, wire up controls found in header/footer
  setupThemeToggle();
  setupLanguageSwitch();
  highlightActiveNav();
  const savedLang = localStorage.getItem("lang") || "de";
  await loadLang(savedLang);
  await augmentTilesWithDatasetInfo();
});

async function augmentTilesWithDatasetInfo() {
  const tiles = document.querySelectorAll(".tile[data-dataset]");
  const tasks = Array.from(tiles).map(async (tile) => {
    const datasetFile = tile.getAttribute("data-dataset");
    if (!datasetFile) return;
    const countEl = tile.querySelector('[data-meta="count"]');
    const updatedEl = tile.querySelector('[data-meta="updated"]');

    try {
      // HEAD to get last-modified
      const headRes = await fetch(`data/${datasetFile}`, { method: "HEAD" });
      const lastModified = headRes.headers.get("Last-Modified");
      if (lastModified && updatedEl) {
        const date = new Date(lastModified);
        const formatted = date.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
        updatedEl.textContent = formatted;
      }
    } catch {}

    try {
      const res = await fetch(`data/${datasetFile}?ts=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      let count = 0;
      if (Array.isArray(json)) count = json.length;
      else if (json && typeof json === "object") {
        if (Array.isArray(json.data)) count = json.data.length;
        else count = Object.keys(json).length;
      }
      if (countEl) {
        countEl.setAttribute("data-count", String(count));
        countEl.textContent = `${count} ${t("common.entries", "entries")}`;
      }
      if (updatedEl && !updatedEl.textContent.trim()) {
        const now = new Date();
        updatedEl.textContent = now.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
      }
    } catch (e) {
      if (countEl) countEl.textContent = "—";
    }
  });
  await Promise.all(tasks);
}

function t(path, fallback = "") {
  const value = path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), i18n.dict);
  return typeof value === "string" ? value : fallback;
}

function refreshTileLabels() {
  document.querySelectorAll('.tile[data-dataset] [data-meta="count"]').forEach((el) => {
    const text = el.getAttribute("data-count");
    if (text) el.textContent = `${text} ${t("common.entries", "entries")}`;
  });
}
