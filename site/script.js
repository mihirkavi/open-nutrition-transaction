const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const copyButton = document.querySelector("[data-copy-button]");
const codeExample = document.querySelector("#code-example");

const setMenu = (open) => {
  if (!menuButton || !nav) return;
  menuButton.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
};

menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });
window.addEventListener("scroll", () => header?.classList.toggle("scrolled", window.scrollY > 24), { passive: true });

copyButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeExample?.textContent ?? "");
    copyButton.textContent = "Copied";
    window.setTimeout(() => { copyButton.textContent = "Copy"; }, 1800);
  } catch { copyButton.textContent = "Select code"; }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealElements = document.querySelectorAll("[data-reveal]");
if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("revealed"));
} else {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("revealed");
    observer.unobserve(entry.target);
  }), { rootMargin: "0px 0px -8%", threshold: .08 });
  revealElements.forEach((element) => observer.observe(element));
}
