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

// Nav: turns into a shrinking pill as you scroll (desktop)
const nav = document.getElementById("main-nav");
let rafId = null;
function updateNav() {
  rafId = null;
  if (window.scrollY > 0) {
    nav.classList.add("scrolling");
    if (window.innerWidth >= 768) {
      const p = Math.min(window.scrollY / 1000, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const max = window.innerWidth * 0.8;
      nav.style.width = `${max - (max - 528) * ease}px`;
    }
  } else {
    nav.classList.remove("scrolling");
    nav.style.width = "";
  }
}
window.addEventListener("scroll", () => { if (!rafId) rafId = requestAnimationFrame(updateNav); }, { passive: true });
updateNav();

// Nav: highlight the section you're looking at
const links = document.querySelectorAll(".nav a");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach((s) => observer.observe(s));
