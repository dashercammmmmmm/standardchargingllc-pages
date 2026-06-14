(function () {
  const mobileQuery = window.matchMedia('(max-width: 760px)');
  const placements = new WeakMap();

  function getPanel(menu) {
    const saved = placements.get(menu);
    return menu.querySelector('.menu-panel, .menu-content') || (saved && saved.panel) || null;
  }

  function movePanelToBody(menu, panel) {
    if (!placements.has(menu)) {
      placements.set(menu, { parent: panel.parentNode, next: panel.nextSibling, panel });
    }
    if (mobileQuery.matches && panel.parentNode !== document.body) {
      document.body.appendChild(panel);
      panel.classList.add('mobile-menu-portal');
    }
  }

  function restorePanel(menu, panel) {
    const saved = placements.get(menu);
    panel.classList.remove('mobile-menu-portal');
    if (saved && saved.parent && panel.parentNode !== saved.parent) {
      saved.parent.insertBefore(panel, saved.next && saved.next.parentNode === saved.parent ? saved.next : null);
    }
  }

  function closeMenu(menu) {
    const button = menu.querySelector('button');
    const panel = getPanel(menu);
    menu.classList.remove('is-open');
    if (panel) {
      panel.classList.remove('is-open');
      restorePanel(menu, panel);
    }
    if (button) button.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.menu.is-open, .menu-wrap.is-open')) {
      document.body.classList.remove('site-menu-open');
    }
  }

  function openMenu(menu) {
    document.querySelectorAll('.menu.is-open, .menu-wrap.is-open').forEach((other) => {
      if (other !== menu) closeMenu(other);
    });

    const button = menu.querySelector('button');
    const panel = getPanel(menu);
    if (!panel) return;

    movePanelToBody(menu, panel);
    menu.classList.add('is-open');
    panel.classList.add('is-open');
    document.body.classList.add('site-menu-open');
    if (button) button.setAttribute('aria-expanded', 'true');
  }

  function bindMenus() {
    document.querySelectorAll('.menu button, .menu-toggle').forEach((button) => {
      if (button.dataset.menuBound === 'true') return;
      button.dataset.menuBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const menu = button.closest('.menu, .menu-wrap');
        if (!menu) return;
        if (menu.classList.contains('is-open')) closeMenu(menu);
        else openMenu(menu);
      });
    });

    document.querySelectorAll('.menu-panel, .menu-content').forEach((panel) => {
      if (panel.dataset.menuPanelBound === 'true') return;
      panel.dataset.menuPanelBound = 'true';
      panel.addEventListener('click', (event) => {
        if (!event.target.closest('a')) return;
        const owner = Array.from(document.querySelectorAll('.menu, .menu-wrap')).find((menu) => getPanel(menu) === panel);
        if (owner) closeMenu(owner);
      });
    });
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.menu, .menu-wrap, .mobile-menu-portal')) return;
    document.querySelectorAll('.menu.is-open, .menu-wrap.is-open').forEach(closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.menu.is-open, .menu-wrap.is-open').forEach(closeMenu);
    }
  });

  window.addEventListener('resize', () => {
    document.querySelectorAll('.menu.is-open, .menu-wrap.is-open').forEach((menu) => {
      const panel = getPanel(menu);
      if (!panel) return;
      if (mobileQuery.matches) movePanelToBody(menu, panel);
      else restorePanel(menu, panel);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMenus);
  } else {
    bindMenus();
  }
})();
