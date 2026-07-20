/* ============================================================
   MTFBYW Components — inject shared header/footer via JS
   This is the "include" approach since we're pure static HTML.
   Each page calls: Components.init()
   ============================================================ */

'use strict';

const Components = (() => {

  const NAV_LINKS = [
    { href: 'index.html',       label: 'Home',        page: 'index.html' },
    { href: 'auth.html',        label: 'Sign In',     page: 'auth.html' },
    { href: 'hero-creation.html', label: 'Create',    page: 'hero-creation.html' },
    { href: 'species.html',     label: 'Species',     page: 'species.html' },
    { href: 'paths.html',       label: 'Paths',       page: 'paths.html' },
    { href: 'careers.html',     label: 'Careers',     page: 'careers.html' },
    { href: 'rules.html',       label: 'Rules',       page: 'rules.html' },
    { href: 'combat.html',      label: 'Combat',      page: 'combat.html' },
    { href: 'gm-guide.html',    label: 'GM Guide',    page: 'gm-guide.html' },
    { href: 'appendix.html',    label: 'Appendix',    page: 'appendix.html' },
  ];

  function renderHeader() {
    const current = location.pathname.split('/').pop() || 'index.html';
    const navHTML = NAV_LINKS.map(l =>
      `<a href="${l.href}" class="nav-link${current === l.page ? ' active' : ''}" data-page="${l.page}">${l.label}</a>`
    ).join('');

    return `
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="site-logo">MTF<span>B</span>WY</a>
    <nav class="site-nav" aria-label="Main navigation">
      ${navHTML}
    </nav>
    <span class="header-badge">v1.1.1 Closed Beta</span>
  </div>
</header>`;
  }

  function renderFooter() {
    return `
<footer style="border-top:1px solid var(--color-rim);padding:var(--space-8) var(--space-6);text-align:center;color:var(--color-dim);font-size:var(--text-sm);max-width:1280px;margin:0 auto;">
  <p>MTFBYW RPG is a fan-created, non-commercial project. All Star Wars material is property of Lucasfilm Ltd. and The Walt Disney Company.</p>
  <p style="margin-top:var(--space-2);font-family:var(--font-mono);font-size:var(--text-xs);">Closed Beta v1.1.1 &nbsp;·&nbsp; May the Force be with you.</p>
</footer>`;
  }

  function init() {
    // Inject header
    const headerTarget = document.getElementById('site-header-mount');
    if (headerTarget) headerTarget.outerHTML = renderHeader();

    // Inject footer
    const footerTarget = document.getElementById('site-footer-mount');
    if (footerTarget) footerTarget.outerHTML = renderFooter();

    // Run main init (nav highlight, tabs, scroll spy)
    const script = document.createElement('script');
    script.src = 'js/main.js';
    document.body.appendChild(script);
  }

  return { init, renderHeader, renderFooter };
})();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Components.init());
} else {
  Components.init();
}
