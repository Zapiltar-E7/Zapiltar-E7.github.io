// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Project filters
const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll("#project-grid .card");
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((c) => c.classList.toggle("active", c === chip));
    const f = chip.dataset.filter;
    cards.forEach((card) => {
      const cats = card.dataset.cat.split(" ");
      card.classList.toggle("hidden", f !== "all" && !cats.includes(f));
    });
  });
});

// Theme toggle (remembers choice when storage is available)
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch {}
document.getElementById("theme-toggle").addEventListener("click", () => {
  const isDark = root.dataset.theme
    ? root.dataset.theme === "dark"
    : !matchMedia("(prefers-color-scheme: light)").matches;
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
});
