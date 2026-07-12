const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme-Toggle (System-Default, Wahl wird gespeichert) ---------- */

const themeToggle = document.getElementById("theme-toggle");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light" || savedTheme === "dark") {
  document.documentElement.dataset.theme = savedTheme;
}

themeToggle.addEventListener("click", () => {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = document.documentElement.dataset.theme || (systemDark ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("theme", next);
});

/* ---------- Navbar-Rahmen beim Scrollen ---------- */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* ---------- Sanftes Scrollen für Navigation ---------- */

document.querySelectorAll('.nav-links a, a[href^="#"]').forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  link.addEventListener("click", (e) => {
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  });
});

/* ---------- Scroll-Reveal ---------- */

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Terminal: Befehle tippen sich selbst ---------- */

const TERMINAL_SCRIPT = [
  { cmd: "whoami", out: ["Haddice Minawal — Schule tagsüber, Code danach."] },
  { cmd: "skills --ehrlich", out: ["HTML · CSS · JavaScript · Python", "Status: alles am Lernen — und das ist der Plan."] },
  { cmd: "motto", out: ["Jedes Projekt ein Stück besser als das letzte."] },
];

(function initTerminal() {
  const body = document.getElementById("terminal-body");
  if (!body) return;

  const PROMPT = '<span class="prompt">haddice@portfolio</span> <span class="out">%</span> ';

  // Ohne Animation: alles sofort anzeigen
  if (prefersReducedMotion) {
    body.innerHTML = TERMINAL_SCRIPT.map((entry) =>
      PROMPT + '<span class="cmd">' + entry.cmd + "</span><br>" +
      entry.out.map((line) => '<span class="out">' + line + "</span>").join("<br>") + "<br>"
    ).join("") + PROMPT + '<span class="cursor"></span>';
    return;
  }

  let html = "";
  let entryIndex = 0;
  let charIndex = 0;

  function render(suffix) {
    body.innerHTML = html + suffix;
  }

  function typeCommand() {
    const entry = TERMINAL_SCRIPT[entryIndex];
    if (charIndex === 0) {
      render(PROMPT + '<span class="cursor"></span>');
    }
    if (charIndex < entry.cmd.length) {
      charIndex++;
      render(PROMPT + '<span class="cmd">' + entry.cmd.slice(0, charIndex) + '</span><span class="cursor"></span>');
      setTimeout(typeCommand, 55 + Math.random() * 70);
    } else {
      html += PROMPT + '<span class="cmd">' + entry.cmd + "</span><br>";
      setTimeout(printOutput, 350);
    }
  }

  function printOutput() {
    const entry = TERMINAL_SCRIPT[entryIndex];
    html += entry.out.map((line) => '<span class="out">' + line + "</span>").join("<br>") + "<br>";
    entryIndex++;
    charIndex = 0;
    if (entryIndex < TERMINAL_SCRIPT.length) {
      render("");
      setTimeout(typeCommand, 650);
    } else {
      render(PROMPT + '<span class="cursor"></span>');
    }
  }

  setTimeout(typeCommand, 700);
})();
