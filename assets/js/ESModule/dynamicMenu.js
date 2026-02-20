export function initDynamicMenu() {

  const categoryIcons = {
    proxmox: 'si si-proxmox',
    docker: 'si si-docker',
    linux: 'si si-linux',
    web: 'si si-html5',
    arduino: 'si si-arduino',
    esp32: 'bi bi-cpu',
    default: 'bi bi-hdd-stack'
  };

  const getIconClass = cat => categoryIcons[cat.toLowerCase()] || categoryIcons.default;

  const createMenuItems = (data, basePath, level = 1) => {
    return Object.entries(data).map(([key, value]) => {
      const li = document.createElement('li');
      li.dataset.level = level;

      const fullPath = `${basePath}/${key}`; // ruta completa para este li
      li.dataset.path = fullPath;  // <-- aquí asignamos el path único

      li.classList.add('dropdown');

      const hasChildren = (Array.isArray(value) && value.length > 0) || (typeof value === 'object' && Object.keys(value).length > 0);

      const a = document.createElement('a');
      a.href = hasChildren ? '#' : fullPath;
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
          childLi.dataset.level = level + 1;
          const childPath = `${fullPath}/${f}`; // ruta única para sub-item
          childLi.dataset.path = childPath;

          const a = document.createElement('a');
          a.href = childPath;
          a.innerHTML = `<i class="bi bi-file-earmark-text navicon"></i> ${f.replace(/-/g, ' ')}`;

          childLi.appendChild(a);
          submenu.appendChild(childLi);
        });
      } else if (typeof value === 'object') {
        createMenuItems(value, fullPath, level + 1).forEach(c => submenu.appendChild(c));
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
