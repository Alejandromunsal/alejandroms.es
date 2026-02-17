export function initMenuAutoOpenPersistent() {
  const STORAGE_KEY = 'lastOpenedMenu';

  const normalizePath = path =>
    path.replace(window.location.origin,'')
        .replace(/index\.html$/,'')
        .replace(/\.html$/,'')
        .replace(/\/$/,'') || '/';

  const currentPath = normalizePath(window.location.pathname);
  const lastOpened = localStorage.getItem(STORAGE_KEY);

  document.addEventListener('dynamicMenuLoaded', () => {
    document.querySelectorAll('#navmenu a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const linkPath = normalizePath(href);

      if (linkPath === currentPath || linkPath === lastOpened) {
        link.classList.add('active');

        let parent = link.closest('li.dropdown');
        while(parent) {
          parent.classList.add('active');
          const submenu = parent.querySelector(':scope>ul');
          if(submenu) submenu.style.display = 'block';
          const arrow = parent.querySelector(':scope>a>.toggle-dropdown');
          if(arrow) arrow.style.transform = 'rotate(180deg)';
          parent = parent.parentElement.closest('li.dropdown');
        }
      }

      link.addEventListener('click', () => {
        if(link.closest('li.dropdown')) localStorage.setItem(STORAGE_KEY, linkPath);
      });
    });
  });
}
