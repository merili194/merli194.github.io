// =========================================================
//  Portfoolio — interaktsioonid
// =========================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Aasta jaluses ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Tallinna kellaaeg navis ----------
const clock = document.getElementById("clock");
function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("et-EE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Tallinn",
  }).format(new Date());
}
updateClock();
setInterval(updateClock, 30_000);

// ---------- Nav taust kerimisel ----------
const nav = document.querySelector(".nav");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---------- Mobiilimenüü ----------
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
  burger.setAttribute("aria-expanded", open);
  navLinks.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(!navLinks.classList.contains("is-open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ---------- Elementide ilmumine kerimisel ----------
// Kõrvuti asuvad elemendid saavad väikese viivituse, et tekiks "laine"
document.querySelectorAll(".hero__title .line").forEach((el, i) => el.style.setProperty("--d", `${i * 0.12}s`));
document.querySelectorAll(".stats > div").forEach((el, i) => el.style.setProperty("--d", `${i * 0.1}s`));
document.querySelectorAll(".case__info").forEach((el) => el.style.setProperty("--d", "0.12s"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- Numbrite üleslugemine (Instagrami statistika) ----------
function countUp(el) {
  const target = Number(el.dataset.to);
  if (reduceMotion) {
    el.textContent = target.toLocaleString("et-EE");
    return;
  }
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString("et-EE");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      countObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".count").forEach((el) => countObserver.observe(el));

// ---------- Projektide pildigalerii ----------
// Iga projekti pildid galeriis. Järjekord loeb: data-index="0" on esimene pilt jne.
const galleries = {
  kringel: [
    { src: "images/web/kringel-koostamine-suur.webp", cap: "Õpetaja vaade: testi koostamine" },
    { src: "images/web/kringel-lahendamine-suur.webp", cap: "Õpilane lahendab testi, ülal taimer" },
    { src: "images/web/kringel-testid-suur.webp", cap: "Kõik testid ühes vaates" },
    { src: "images/web/kringel-figma-suur.webp", cap: "Figma prototüüp: kogu rakenduse vaated" },
    { src: "images/web/kringel-vastus-suur.webp", cap: "Ühe võistkonna vastused" },
    { src: "images/web/kringel-avaleht-suur.webp", cap: "Õpilase avaleht" },
  ],
  formforge: [
    { src: "images/web/formforge-avaleht-suur.webp", cap: "Avaleht" },
    { src: "images/web/formforge-toode-suur.webp", cap: "Tooteleht" },
    { src: "images/web/formforge-ostukorv-suur.webp", cap: "Ostukorv" },
    { src: "images/web/formforge-konto-suur.webp", cap: "Kasutajakonto" },
    { src: "images/web/formforge-ekraanid-suur.webp", cap: "Eesmärgipõhised kategoorialehed ja tootelehed" },
    { src: "images/web/formforge-figma-suur.webp", cap: "Figma fail: ostu- ja kontovaated" },
  ],
  reel: [
    { src: "images/web/reel-avaleht-suur.webp", cap: "Avaleht" },
    { src: "images/web/reel-kusimustik-suur.webp", cap: "5-sammuline küsimustik" },
    { src: "images/web/reel-tulemus-suur.webp", cap: "Personaalne soovitus ja sarnased filmid" },
    { src: "images/web/reel-filmid-suur.webp", cap: "Kõik filmid žanrifiltriga" },
    { src: "images/web/reel-wireframe-suur.webp", cap: "Alguses paberil: wireframe" },
  ],
};

const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
const lbCount = document.getElementById("lbCount");
let lbList = [];
let lbIndex = 0;
let lastFocus = null;

function showImage(i) {
  lbIndex = (i + lbList.length) % lbList.length;
  const item = lbList[lbIndex];
  lbImg.style.animation = "none";
  lbImg.offsetHeight; // käivitab animatsiooni uuesti
  lbImg.style.animation = "";
  lbImg.src = item.src;
  lbImg.alt = item.cap;
  lbCap.textContent = item.cap;
  lbCount.textContent = `${lbIndex + 1} / ${lbList.length}`;
}

function openLightbox(nameOrList, i) {
  lbList = Array.isArray(nameOrList) ? nameOrList : galleries[nameOrList] || [];
  if (!lbList.length) return;
  lastFocus = document.activeElement;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  showImage(i);
  document.getElementById("lbClose").focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}

document.querySelectorAll(".case").forEach((card) => {
  const name = card.dataset.gallery;
  card.querySelectorAll("[data-index]").forEach((btn) =>
    btn.addEventListener("click", () => openLightbox(name, Number(btn.dataset.index)))
  );
  card.querySelectorAll("[data-open]").forEach((btn) =>
    btn.addEventListener("click", () => openLightbox(name, Number(btn.dataset.open)))
  );
});

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", () => showImage(lbIndex - 1));
document.getElementById("lbNext").addEventListener("click", () => showImage(lbIndex + 1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showImage(lbIndex + 1);
  if (e.key === "ArrowLeft") showImage(lbIndex - 1);
});

// ---------- Disainitööd: klikk avab galerii ----------
const posterButtons = [...document.querySelectorAll(".poster button")];
const posterList = posterButtons
  .filter((btn) => btn.dataset.full)
  .map((btn) => ({
    src: btn.dataset.full,
    cap: btn.closest(".poster").querySelector("strong").textContent,
  }));

posterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const i = posterList.findIndex((x) => x.src === btn.dataset.full);
    openLightbox(posterList, Math.max(i, 0));
  });
});

// Telefonis: pühi vasakule/paremale
let touchX = null;
lightbox.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showImage(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ---------- E-posti kopeerimine ----------
const copyBtn = document.getElementById("copyMail");
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.mail);
    copyBtn.textContent = "Kopeeritud ✓";
    copyBtn.classList.add("is-copied");
    setTimeout(() => {
      copyBtn.textContent = "Kopeeri e-post";
      copyBtn.classList.remove("is-copied");
    }, 2000);
  } catch {
    window.location.href = `mailto:${copyBtn.dataset.mail}`;
  }
});

// ---------- Koodiaken, mis kirjutab ennast ise ----------
// Muuda teksti siin. Iga rida: [värviklass, tekst]
//   k = märksõna (oranž), s = tekst (roheline), p = omadus (lilla), c = kommentaar, "" = tavaline
const codeTokens = [
  ["c", "// natuke minust\n"],
  ["k", "const "], ["", "merili = {\n"],
  ["p", "  roll"], ["", ": "], ["s", "\"veebiarendaja & UI/UX\""], ["", ",\n"],
  ["p", "  kool"], ["", ": "], ["s", "\"TLÜ, informaatika\""], ["", ",\n"],
  ["p", "  suund"], ["", ": "], ["s", "\"digimeedia\""], ["", ",\n"],
  ["p", "  kursus"], ["", ": "], ["k", "3"], ["", ",\n"],
  ["p", "  lemmikud"], ["", ": ["], ["s", "\"Figma\""], ["", ", "], ["s", "\"CSS\""], ["", ", "], ["s", "\"JS\""], ["", "],\n"],
  ["p", "  otsinPraktikat"], ["", ": "], ["k", "true"], ["", ",\n"],
  ["", "};\n\n"],
  ["k", "if "], ["", "(merili.otsinPraktikat) {\n"],
  ["", "  kirjuta("], ["s", "\"tiikmerili@gmail.com\""], ["", ");\n"],
  ["", "}"],
];

const typedEl = document.getElementById("typed");
const escapeHtml = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderTokens(charCount) {
  let html = "";
  let left = charCount;
  for (const [cls, text] of codeTokens) {
    if (left <= 0) break;
    const part = escapeHtml(text.slice(0, left));
    html += cls ? `<span class="${cls}">${part}</span>` : part;
    left -= text.length;
  }
  typedEl.innerHTML = html;
}

const totalChars = codeTokens.reduce((n, [, t]) => n + t.length, 0);

function startTyping() {
  if (reduceMotion) return renderTokens(totalChars);
  let i = 0;
  (function step() {
    i++;
    renderTokens(i);
    if (i < totalChars) setTimeout(step, 18 + Math.random() * 40);
  })();
}

const editorObserver = new IntersectionObserver(
  (entries) => {
    if (!entries[0].isIntersecting) return;
    startTyping();
    editorObserver.disconnect();
  },
  { threshold: 0.4 }
);
editorObserver.observe(document.querySelector(".editor"));

// ---------- Jooksurada: lehe kerimine = 800 m ----------
const track = document.getElementById("track");
const trackFill = document.getElementById("trackFill");
const trackRunner = document.getElementById("trackRunner");
const trackLabel = document.getElementById("trackLabel");
let trackTicking = false;
let trackTimer = null;

function updateTrack() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  const meters = Math.round(p * 800);

  trackFill.style.transform = `scaleX(${p})`;
  trackRunner.style.left = `${p * 100}%`;
  trackLabel.textContent = meters >= 800 ? "800 m · finiš" : `${meters} m`;

  track.classList.toggle("is-visible", window.scrollY > 40);
  track.classList.toggle("is-finished", meters >= 800);
  track.classList.toggle("is-left", p < 0.06);
  track.classList.toggle("is-right", p > 0.92);

  // Silt on näha kerimise ajal ja kaob siis, kui kasutaja peatub (finišis jääb alles)
  track.classList.add("is-moving");
  clearTimeout(trackTimer);
  trackTimer = setTimeout(() => track.classList.remove("is-moving"), 1200);
  trackTicking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!trackTicking) {
      requestAnimationFrame(updateTrack);
      trackTicking = true;
    }
  },
  { passive: true }
);
window.addEventListener("resize", updateTrack);
updateTrack();
track.classList.remove("is-moving");