/* ============================================================
   MTFBYW Components — shared header/footer injection
   ============================================================ */

'use strict';

const Components = (() => {

  const NAV_LINKS = [
    { href: 'index.html',    label: 'Home',     page: 'index.html' },
    { href: 'species.html',  label: 'Species',  page: 'species.html' },
    { href: 'origins.html',  label: 'Origins',  page: 'origins.html' },
    { href: 'paths.html',    label: 'Paths',    page: 'paths.html' },
    { href: 'careers.html',  label: 'Careers',  page: 'careers.html' },
    { href: 'rules.html',    label: 'Rules',    page: 'rules.html' },
    { href: 'combat.html',   label: 'Combat',   page: 'combat.html' },
    { href: 'gm-guide.html', label: 'GM Guide', page: 'gm-guide.html' },
    { href: 'appendix.html', label: 'Appendix', page: 'appendix.html' },
  ];

  function renderHeader() {
    const current = location.pathname.split('/').pop() || 'index.html';
    const navHTML = NAV_LINKS.map(l =>
      `<a href="${l.href}" class="nav-link${current === l.page ? ' active' : ''}" data-page="${l.page}">${l.label}</a>`
    ).join('');

    return `
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="site-logo" aria-label="MTFBYW — Home">
      <img src="assets/logo.svg" alt="MTFBYW" height="28" style="display:block;">
    </a>
    <nav class="site-nav" aria-label="Main navigation">
      ${navHTML}
    </nav>
    <span class="header-badge">v1.1.1 Closed Beta</span>
  </div>
</header>`;
  }

  function renderFooter() {
    return `
<footer style="border-top:1px solid var(--color-outline-sub);padding:var(--space-8) var(--space-6);text-align:center;color:var(--color-text-muted);font-size:var(--text-xs);max-width:var(--layout-max);margin:0 auto;">
  <p>MTFBYW RPG is a fan-created, non-commercial project. All Star Wars material is property of Lucasfilm Ltd. and The Walt Disney Company.</p>
  <p style="margin-top:var(--space-2);font-family:var(--font-mono);font-size:11px;">Closed Beta v1.1.1</p>
</footer>`;
  }

  function init() {
    const headerTarget = document.getElementById('site-header-mount');
    if (headerTarget) headerTarget.outerHTML = renderHeader();

    const footerTarget = document.getElementById('site-footer-mount');
    if (footerTarget) footerTarget.outerHTML = renderFooter();

    // Run main JS
    const script = document.createElement('script');
    script.src = 'js/main.js';
    document.body.appendChild(script);
  }

  return { init };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Components.init());
} else {
  Components.init();
}
