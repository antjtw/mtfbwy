/* ============================================================
   MTFBYW Main JS
   - Active nav highlighting
   - Tab switching
   - Sidebar scroll spy
   - Mobile menu toggle
   ============================================================ */

'use strict';

// ---- Active nav link ----
(function highlightNav() {
  const links = document.querySelectorAll('.nav-link[data-page]');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    if (link.dataset.page === current) link.classList.add('active');
  });
})();

// ---- Sidebar active link ----
(function sidebarLink() {
  const links = document.querySelectorAll('.sidebar-link');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes(current)) link.classList.add('active');
  });
})();

// ---- Scroll spy for sidebar ----
(function scrollSpy() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
  if (!sidebarLinks.length) return;

  const targets = Array.from(sidebarLinks).map(link => ({
    el: document.querySelector(link.getAttribute('href')),
    link,
  })).filter(item => item.el);

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const match = targets.find(t => t.el === entry.target);
        if (!match) return;
        sidebarLinks.forEach(l => l.classList.remove('active'));
        match.link.classList.add('active');
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );

  targets.forEach(t => observer.observe(t.el));
})();

// ---- Tab switching ----
(function tabs() {
  document.querySelectorAll('.tabs').forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panels  = container.querySelectorAll('.tab-panel');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panels[i]?.classList.add('active');
      });
    });

    // Activate first tab by default
    if (buttons[0]) {
      buttons[0].classList.add('active');
      panels[0]?.classList.add('active');
    }
  });
})();
