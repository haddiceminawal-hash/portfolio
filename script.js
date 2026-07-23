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

/* ---------- Interaktives Terminal ---------- */

const TERMINAL_INTRO = [
  { cmd: "whoami", out: ["Haddice Minawal — Schule tagsüber, Code danach."] },
  { cmd: "skills --ehrlich", out: ["HTML · CSS · JavaScript · Python", "Status: alles am Lernen — und das ist der Plan."] },
];

(function initTerminal() {
  const body = document.getElementById("terminal-body");
  if (!body) return;

  const PROMPT = '<span class="prompt">haddice@portfolio</span> <span class="out">%</span> ';

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const COMMANDS = {
    help: () => [
      "Verfügbare Befehle:",
      "  ueber      – kurz über mich",
      "  projekte   – meine Projekte",
      "  skills     – womit ich arbeite",
      "  kontakt    – Kontaktformular öffnen",
      "  clear      – Terminal leeren",
    ],
    ueber: () => [
      "Schüler, der sich nebenbei das Programmieren beibringt.",
      "Ziel: später in die IT & Softwareentwicklung.",
    ],
    projekte: () => [
      "1) Apfelkuchen-Rezeptseite  — HTML/CSS/JS  (live)",
      "2) TicTacToe                — Python       (Code)",
      "→ Scroll runter zu 'Projekte' für Details.",
    ],
    skills: () => [
      "HTML · CSS · JavaScript · Python",
      "Werkzeuge: VS Code, Git & GitHub",
      "Status: alles am Lernen.",
    ],
    kontakt: () => {
      if (typeof window.openContactModal === "function") {
        setTimeout(() => window.openContactModal(), 350);
        return ["Öffne Kontaktformular … (oder direkt: haddice.minawal@gmail.com)"];
      }
      return ["Schreib mir: haddice.minawal@gmail.com"];
    },
    whoami: () => ["Haddice Minawal"],
  };
  COMMANDS.about = COMMANDS.ueber;
  COMMANDS.projects = COMMANDS.projekte;
  COMMANDS.contact = COMMANDS.kontakt;

  let inputLine = null;
  let input = null;

  function appendLine(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    if (inputLine) body.insertBefore(div, inputLine);
    else body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function runCommand(raw) {
    appendLine(PROMPT + '<span class="cmd">' + esc(raw) + "</span>");
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear" || cmd === "cls") {
      Array.from(body.children).forEach((c) => { if (c !== inputLine) body.removeChild(c); });
      return;
    }
    const handler = COMMANDS[cmd];
    const lines = handler
      ? handler()
      : ["zsh: command not found: " + esc(cmd) + " — tippe 'help'"];
    lines.forEach((line) => appendLine('<span class="out">' + line + "</span>"));
  }

  function startInteractive() {
    appendLine('<span class="out">Tipp: tippe <span class="cmd">help</span> und drück Enter.</span>');
    inputLine = document.createElement("div");
    inputLine.className = "term-line";
    inputLine.innerHTML = PROMPT +
      '<input class="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal-Eingabe">';
    body.appendChild(inputLine);
    input = inputLine.querySelector(".term-input");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = input.value;
        input.value = "";
        runCommand(val);
      }
    });
    body.addEventListener("click", () => {
      if (window.getSelection().toString()) return;
      input.focus();
    });
  }

  // Intro sofort (reduzierte Bewegung) …
  if (prefersReducedMotion) {
    TERMINAL_INTRO.forEach((entry) => {
      appendLine(PROMPT + '<span class="cmd">' + entry.cmd + "</span>");
      entry.out.forEach((line) => appendLine('<span class="out">' + line + "</span>"));
    });
    startInteractive();
    return;
  }

  // … oder als getippte Animation, danach interaktiv
  let entryIndex = 0;
  let charIndex = 0;
  let typedEl = null;

  function typeCommand() {
    const entry = TERMINAL_INTRO[entryIndex];
    if (charIndex === 0) {
      typedEl = document.createElement("div");
      body.appendChild(typedEl);
    }
    if (charIndex < entry.cmd.length) {
      charIndex++;
      typedEl.innerHTML = PROMPT + '<span class="cmd">' + entry.cmd.slice(0, charIndex) + '</span><span class="cursor"></span>';
      setTimeout(typeCommand, 55 + Math.random() * 70);
    } else {
      typedEl.innerHTML = PROMPT + '<span class="cmd">' + entry.cmd + "</span>";
      setTimeout(printOutput, 300);
    }
  }

  function printOutput() {
    const entry = TERMINAL_INTRO[entryIndex];
    entry.out.forEach((line) => appendLine('<span class="out">' + line + "</span>"));
    entryIndex++;
    charIndex = 0;
    if (entryIndex < TERMINAL_INTRO.length) setTimeout(typeCommand, 500);
    else setTimeout(startInteractive, 400);
  }

  setTimeout(typeCommand, 700);
})();

/* ---------- Kontakt-Popup (per Button / Terminal-Befehl) ---------- */

(function initContactModal() {
  const overlay = document.getElementById("contact-modal");
  if (!overlay) return;

  const closeBtn = document.getElementById("modal-close");
  const form = document.getElementById("contact-form");
  const formView = document.getElementById("modal-form-view");
  const successView = document.getElementById("modal-success-view");
  const mathLabel = document.getElementById("f-math-label");
  const mathInput = document.getElementById("f-math");
  const errorBox = document.getElementById("form-error");
  const submitBtn = document.getElementById("form-submit");
  const accessKey = document.getElementById("access-key").value;

  let lastFocused = null;
  let mathSolution = 0;

  function newMathQuestion() {
    const a = 1 + Math.floor(Math.random() * 8);
    const b = 1 + Math.floor(Math.random() * 8);
    mathSolution = a + b;
    mathLabel.textContent = `Verifizierung: Was ist ${a} + ${b}?`;
    mathInput.value = "";
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function openModal() {
    lastFocused = document.activeElement;
    newMathQuestion();
    formView.hidden = false;
    successView.hidden = true;
    clearError();
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeydown);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeModal();
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearError();

    // Honeypot: ausgefüllt = Bot -> still abbrechen
    if (form.botcheck.checked) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name) return showError("Bitte gib deinen Namen ein.");
    if (!isValidEmail(email)) return showError("Bitte gib eine gültige E-Mail-Adresse ein.");
    if (!message) return showError("Bitte schreib eine kurze Nachricht.");
    if (parseInt(mathInput.value, 10) !== mathSolution) {
      newMathQuestion();
      return showError("Die Rechenaufgabe stimmt noch nicht – bitte versuch es erneut.");
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet …";

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name,
          email,
          message,
          subject: `Neue Portfolio-Nachricht von ${name}`,
          from_name: "Portfolio-Kontaktformular",
        }),
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById("success-name").textContent = name;
        formView.hidden = true;
        successView.hidden = false;
      } else {
        showError("Da ist etwas schiefgelaufen. Bitte versuch es später noch einmal.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Absenden";
      }
    } catch (err) {
      showError("Keine Verbindung möglich. Bitte prüfe deine Internetverbindung.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Absenden";
    }
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.getElementById("success-close").addEventListener("click", closeModal);
  form.addEventListener("submit", onSubmit);

  // Öffnen über den schwebenden Button oder den Terminal-Befehl 'kontakt'
  window.openContactModal = openModal;
  const fab = document.getElementById("contact-fab");
  if (fab) fab.addEventListener("click", openModal);
})();
