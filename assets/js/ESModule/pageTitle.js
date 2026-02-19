export function initPageTitle() {
    const container = document.getElementById('page-title');
    if (!container) return;
  
    // Limpiar contenido previo
    container.innerHTML = '';
  
    // Obtener partes de la URL
    let path = window.location.pathname; // ej: "/tutoriales/proxmox/servidor-lemp.html"
    path = path.replace(/\.html$/, ''); // quitar ".html"
    const parts = path.split('/').filter(Boolean); // ["tutoriales","proxmox","servidor-lemp"]
  
    // Función para capitalizar y reemplazar guiones por espacios
    const formatText = str => str ? str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ') : '';
  
    // Crear el div principal con clase page-title dark-background
    const pageTitle = document.createElement('div');
    pageTitle.className = 'page-title dark-background';
  
    // Crear div interno con id service-page-title y clases container d-lg-flex justify-content-between align-items-center
    const innerDiv = document.createElement('div');
    innerDiv.id = 'service-page-title';
    innerDiv.className = 'container d-lg-flex justify-content-between align-items-center';
  
    // Crear nav breadcrumbs
    const nav = document.createElement('nav');
    nav.className = 'breadcrumbs';
    const ol = document.createElement('ol');
  
    parts.forEach((part, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
  
      if (index === 0) {
        // Primer nivel: link al listado principal
        a.href = `/${part}.html`;
        a.textContent = formatText(part);
      } else if (index === parts.length - 1) {
        // Último nivel: tutorial actual
        a.href = '#';
        a.className = 'md-title';
        a.textContent = formatText(part);
      } else {
        // Nivel intermedio
        a.href = '#';
        a.textContent = formatText(part);
      }
  
      li.appendChild(a);
      ol.appendChild(li);
    });
  
    nav.appendChild(ol);
    innerDiv.appendChild(nav);
    pageTitle.appendChild(innerDiv);
  
    // Insertar todo en el contenedor
    container.appendChild(pageTitle);
  }
  