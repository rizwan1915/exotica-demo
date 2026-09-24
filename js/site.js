const burger = document.getElementById("burger");
const links = document.getElementById("navLinks");
function closeMenu() {
  links.classList.remove("open");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Open menu");
}
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
links.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && links.classList.contains("open")) {
    closeMenu();
    burger.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
matchMedia("(min-width: 761px)").addEventListener("change", closeMenu);

// Product selection stays in the existing, explicitly labelled demo enquiry flow.
const form = document.getElementById("enquiryForm");
const interest = document.getElementById("interest");
const status = document.getElementById("enquiryStatus");
document.querySelectorAll("[data-interest]").forEach((link) => {
  link.addEventListener("click", () => {
    interest.value = link.dataset.interest;
    status.textContent = "";
  });
});
form.addEventListener("input", () => {
  status.textContent = "";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.textContent = `Preview ready for ${interest.value}. This is a demo; no enquiry has been sent and no details have been stored.`;
});
document.querySelectorAll('a[href="#delivery"]').forEach((link) =>
  link.addEventListener("click", () => {
    document.getElementById("delivery").open = true;
  }),
);

// Posters are the default. Load a single WebGL scene only when appropriate.
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const connection = navigator.connection;
const constrained = () =>
  reduced.matches ||
  connection?.saveData ||
  /(^|-)2g$|3g/.test(connection?.effectiveType || "") ||
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
const host = document.getElementById("heroBottle");
const preview = document.createElement("button");
preview.type = "button";
preview.textContent = "Explore in 3D";
preview.hidden = true;
host.parentElement.querySelector(".hero-art-caption").append(preview);
let dispose = null,
  loading = false,
  inView = false,
  requested = false;
async function loadScene() {
  if (loading || dispose || constrained() || !inView || document.hidden) return;
  loading = true;
  preview.disabled = true;
  preview.textContent = "Loading 3D…";
  try {
    const { mount } = await import("./bottle-scene.min.js");
    if (!constrained() && inView && !document.hidden && requested)
      dispose = mount(host);
  } catch {
    /* The existing image remains the complete visual fallback. */
  }
  loading = false;
  preview.disabled = false;
  preview.textContent = host.classList.contains("model-ready")
    ? "Back to portrait"
    : "Explore in 3D";
  preview.hidden = constrained();
}
function policyChanged() {
  if (constrained()) {
    dispose?.();
    dispose = null;
  }
  preview.hidden = constrained();
  preview.textContent = host.classList.contains("model-ready")
    ? "Back to portrait"
    : "Explore in 3D";
  if (requested && !constrained() && inView) loadScene();
}
preview.addEventListener("click", () => {
  if (dispose) {
    dispose();
    dispose = null;
    requested = false;
    preview.textContent = "Explore in 3D";
    return;
  }
  requested = true;
  loadScene();
});
reduced.addEventListener("change", policyChanged);
connection?.addEventListener?.("change", policyChanged);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) policyChanged();
});
const observer = new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  if (inView && requested && !constrained()) {
    if ("requestIdleCallback" in window)
      requestIdleCallback(loadScene, { timeout: 1800 });
    else setTimeout(loadScene, 400);
  }
});
observer.observe(host);
preview.hidden = constrained();

// Continuously billowing smoke. Load only when visible and motion is allowed.
const hero = document.getElementById("hero");
const smokeVideo = document.querySelector(".smoke-video");
const smokeToggle = document.querySelector(".smoke-toggle");
const bottleMotion = document.querySelector("[data-motion-toggle]");
let smokePaused = false;
let heroVisible = false;
const smokeRestricted = () => reduced.matches || connection?.saveData;
function syncSmoke() {
  const bottlePaused =
    !bottleMotion.hidden &&
    bottleMotion.getAttribute("aria-pressed") === "true";
  const allowed = !smokeRestricted();
  smokeToggle.hidden = !allowed;
  if (!allowed) hero.classList.remove("smoke-live");
  if (
    !allowed ||
    !heroVisible ||
    document.hidden ||
    smokePaused ||
    bottlePaused
  ) {
    smokeVideo.pause();
    return;
  }
  if (!smokeVideo.getAttribute("src"))
    smokeVideo.src = "assets/hero-smoke-loop.mp4";
  smokeVideo.play().catch((error) => {
    if (error.name !== "NotAllowedError") return;
    smokePaused = true;
    smokeToggle.textContent = "Play smoke";
    smokeToggle.setAttribute("aria-pressed", "true");
  });
}
// Slow movement is baked into the file; normal playback preserves all 30 fps.
smokeVideo.addEventListener("loadedmetadata", () => {
  smokeVideo.playbackRate = 1;
});
smokeVideo.addEventListener("playing", () => {
  if (!smokeRestricted()) hero.classList.add("smoke-live");
});
smokeVideo.addEventListener("error", () => {
  hero.classList.remove("smoke-live");
  smokeToggle.hidden = true;
});
smokeToggle.addEventListener("click", () => {
  smokePaused = !smokePaused;
  smokeToggle.textContent = smokePaused ? "Resume smoke" : "Pause smoke";
  smokeToggle.setAttribute("aria-pressed", String(smokePaused));
  syncSmoke();
});
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  syncSmoke();
}).observe(hero);
new MutationObserver(syncSmoke).observe(bottleMotion, {
  attributes: true,
  attributeFilter: ["aria-pressed", "hidden"],
});
reduced.addEventListener("change", syncSmoke);
connection?.addEventListener?.("change", syncSmoke);
document.addEventListener("visibilitychange", syncSmoke);

// Short, once-only entrances; native scrolling and no perpetual transforms.
if (!reduced.matches && "IntersectionObserver" in window) {
  const entrances = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          entrances.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".coll-card, .story-copy").forEach((element) => {
    element.classList.add("editorial-enter");
    entrances.observe(element);
  });
}
