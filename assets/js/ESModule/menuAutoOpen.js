// ESModule/menuAutoOpen.js
export function initMenuAutoOpenPersistent() {
  const STORAGE_KEY = 'lastOpenedMenu';

  const normalizePath = path =>
    path.replace(window.location.origin,'')
        .replace(/index\.html$/,'')
        .replace(/\.html$/,'')
        .replace(/\/$/,'') || '/';

  const currentPath = normalizePath(window.location.pathname);
  const lastOpened = localStorage.getItem(STORAGE_KEY);

  // Función que intenta abrir el menú cuando exista
  const tryOpenMenus = () => {
    const menu = document.querySelector('#navmenu');
    if (!menu || menu.querySelectorAll('li.dropdown').length === 0) {
      // Menú aún no creado, reintentar en 200ms
      setTimeout(tryOpenMenus, 200);
      return;
    }

    menu.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const linkPath = normalizePath(href);

      // Abrir menú si coincide con URL actual o último menú guardado
      if (linkPath === currentPath || linkPath === lastOpened) {
        link.classList.add('active');

        let parent = link.closest('li.dropdown');
        while(parent) {
          parent.classList.add('active');

          const submenu = parent.querySelector(':scope>ul');
          if(submenu) {
            submenu.style.display = 'block';
            submenu.style.height = '';
            submenu.style.opacity = '';
            submenu.style.transition = '';
          }

          const arrow = parent.querySelector(':scope>a>.toggle-dropdown');
          if(arrow) arrow.style.transform = 'rotate(180deg)';

          parent = parent.parentElement.closest('li.dropdown');
        }
      }

      // Guardar en localStorage al hacer clic
      link.addEventListener('click', () => {
        if(link.closest('li.dropdown')) {
          localStorage.setItem(STORAGE_KEY, linkPath);
        }
      });
    });
  };

  // Iniciar polling para esperar al menú dinámico
  tryOpenMenus();
}
