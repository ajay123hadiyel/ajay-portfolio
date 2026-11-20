/**
 * Portfolio scripts: navigation, scroll effects, counters, lightbox and project filters.
 */
(function () {
  "use strict";

  const header = document.querySelector('.site-header');
  const nav = document.querySelector('#site-nav');
  const toggle = document.querySelector('.nav-toggle');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const navLinks = Array.from(document.querySelectorAll('#site-nav a[href^="#"]'));
  const sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.scroll-progress span');

  /** Header background and scroll-to-top visibility */
  function onScroll() {
    const y = window.scrollY;
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    if (header) header.classList.toggle('scrolled', y > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('active', y > 400);

    const pos = y + 140;
    let current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach(function (a) {
      const active = current && a.getAttribute('href') === '#' + current.id;
      a.classList.toggle('active', !!active);
      if (active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);

  /** Mobile menu */
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('i').className = open ? 'bi bi-x-lg' : 'bi bi-list';
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  }
  navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /** Animate on scroll */
  if (window.AOS) {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  /** Counters */
  if (window.PureCounter) {
    new PureCounter();
  }

  /** Lightbox */
  if (window.GLightbox) {
    GLightbox({ selector: '.glightbox' });
  }

  /** Project filters */
  const items = Array.from(document.querySelectorAll('.project-item'));
  const buttons = Array.from(document.querySelectorAll('.project-filters button'));
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        b.classList.remove('filter-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('filter-active');
      btn.setAttribute('aria-pressed', 'true');
      const f = btn.getAttribute('data-filter');
      items.forEach(function (item) {
        item.hidden = !(f === '*' || item.matches(f));
      });
    });
  });

  /** Typed rotating line */
  const typedEl = document.querySelector('.typed');
  if (typedEl && window.Typed && !reduce) {
    new Typed('.typed', {
      strings: typedEl.getAttribute('data-typed-items').split(','),
      loop: true,
      typeSpeed: 55,
      backSpeed: 28,
      backDelay: 1800
    });
  }

  /** Spotlight and 3D tilt on cards */
  document.querySelectorAll('.skill-card, .service-card, .project-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      if (reduce || e.pointerType === 'touch') return;
      const rx = ((y / r.height) - 0.5) * -7;
      const ry = ((x / r.width) - 0.5) * 7;
      card.classList.add('tilt', 'is-tilting');
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    });
  });

  /** Hero particle network */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, pts = [], raf = null, visible = true;
    const mouse = { x: -999, y: -999 };

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, Math.max(24, (w * h) / 26000)));
      pts = Array.from({ length: n }, function () {
        return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 };
      });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 140) { p.x += (p.x - mouse.x) * 0.012; p.y += (p.y - mouse.y) * 0.012; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, 6.283);
        ctx.fillStyle = 'rgba(103, 232, 249, 0.85)';
        ctx.fill();
        for (let k = i + 1; k < pts.length; k++) {
          const q = pts[k];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.strokeStyle = 'rgba(56, 189, 248,' + (0.22 * (1 - d / 130)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      raf = visible ? requestAnimationFrame(frame) : null;
    }

    size();
    frame();
    window.addEventListener('resize', size);
    hero.addEventListener('pointermove', function (e) {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !raf) frame();
      }).observe(hero);
    }
  }
})();
