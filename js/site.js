(function () {
  'use strict';

  // Header condenses on scroll
  var header = document.getElementById('siteHeader');
  addEventListener('scroll', function () {
    header.classList.toggle('scrolled', scrollY > 40);
  }, { passive: true });

  // Mobile menu
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  // Reveal-on-scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.will-reveal').forEach(function (el) { io.observe(el); });

  // Hero film — if the smoke video can't load, fall back to the CSS smoke layer
  var video = document.querySelector('.hero-film video');
  if (video) {
    var kickPlay = function () { video.play().catch(function () {}); };
    video.addEventListener('loadedmetadata', function () {
      try { video.playbackRate = 0.55; } catch (err) {} // set after metadata; iOS dislikes setting it early
    });
    video.addEventListener('canplay', kickPlay);
    video.addEventListener('stalled', kickPlay);
    document.getElementById('hero').addEventListener('pointerdown', kickPlay, { once: false });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kickPlay(); });
    video.addEventListener('error', function () {
      video.closest('.hero').classList.add('film-dead');
    });
  }

  // Demo enquiry form
  var form = document.getElementById('enquiryForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Enquiry Noted \u2713';
    btn.disabled = true;
  });
})();
