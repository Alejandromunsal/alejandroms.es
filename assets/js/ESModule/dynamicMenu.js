export function initDynamicMenu() {

  const categoryIcons = {
    proxmox: 'bi bi-server',
    docker: 'bi bi-box',
    linux: 'bi bi-terminal',
    web: 'bi bi-wifi',
    default: 'bi bi-hdd-stack'
  };

  const getIconClass = cat => categoryIcons[cat.toLowerCase()] || categoryIcons.default;

  const createMenuItems = (data, basePath) => {
    return Object.entries(data).map(([key, value]) => {
      const li = document.createElement('li');
      li.classList.add('dropdown');

      const hasChildren = (Array.isArray(value) && value.length > 0) || (typeof value === 'object' && Object.keys(value).length > 0);

      const a = document.createElement('a');
      a.href = hasChildren ? '#' : `/${basePath}/${key}`;
      a.innerHTML = `<i class="${getIconClass(key)} navicon"></i>${key.charAt(0).toUpperCase() + key.slice(1)}`;

      if (hasChildren && !a.querySelector('.toggle-dropdown')) {
        const arrow = document.createElement('i');
        arrow.className = 'bi bi-chevron-down toggle-dropdown';
        a.appendChild(arrow);
      }

      li.appendChild(a);

      const submenu = document.createElement('ul');
      submenu.classList.add('dropdown-menu');
      li.appendChild(submenu);

      if (Array.isArray(value)) {
        value.forEach(f => {
          const childLi = document.createElement('li');
          childLi.innerHTML = `<a href="/${basePath}/${key}/${f}"><i class="bi bi-file-earmark-text navicon"></i>${f.replace(/-/g,' ')}</a>`;
          submenu.appendChild(childLi);
        });
      } else if (typeof value === 'object') {
        createMenuItems(value, `${basePath}/${key}`).forEach(c => submenu.appendChild(c));
      }

      return li;
    });
  };

  const loadDynamicMenuRecursive = (selector, section, basePath) => {
    const menu = document.querySelector(selector);
    if (!menu) return Promise.resolve();

    return fetch(`/forms/get-md-dir-tree.php?section=${section}`)
      .then(r => r.json())
      .then(data => {
        createMenuItems(data, basePath).forEach(li => menu.appendChild(li));
      });
  };

  // Cargar ambos menús y disparar evento cuando termine
  Promise.all([
    loadDynamicMenuRecursive('#navmenu li[data-id="tutoriales"]>.dropdown-menu', 'tutorials', 'tutoriales'),
    loadDynamicMenuRecursive('#navmenu li[data-id="proyectos"]>.dropdown-menu', 'proyectos', 'proyectos')
  ]).then(() => {
    document.dispatchEvent(new Event('dynamicMenuLoaded'));
  }).catch(console.error);
}
