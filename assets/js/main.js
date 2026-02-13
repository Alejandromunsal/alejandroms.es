/**
 * Updated & Optimized: Feb 13 2026 with Bootstrap v5.3.7
 * Author: Alejandro Muñoz Salas
 */
(function () {
  "use strict";

  const header = document.getElementById('header');
  const headerToggleBtn = document.querySelector('.header-toggle');
  const swipeArea = document.querySelector('.swipe-area');
  const swipeHint = document.querySelector('.swipe-hint');
  const scrollTop = document.querySelector('.scroll-top');
  const toggleThemeBtn = document.getElementById('toggle-theme');
  const preloader = document.querySelector('#preloader');

  if (!header || !headerToggleBtn) return;

  let headerWidth = header.offsetWidth;
  window.addEventListener('resize', () => { headerWidth = header.offsetWidth; updateSwipeArea(); });

  /* ===============================
     Swipe hint & mobile swipe
  =============================== */
  let hintTimeout, startX = 0, currentX = 0, isDragging = false;

  const showSwipeHint = () => {
    if (window.innerWidth > 1199 || header.classList.contains('header-show')) return;
    swipeHint?.classList.add('active');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => swipeHint?.classList.remove('active'), 4500);
  };

  const addSwipeHint = () => header.classList.add('header-closed');
  const removeSwipeHint = () => header.classList.remove('header-closed');

  const updateSwipeArea = () => {
    if (window.innerWidth >= 1200) {
      header.classList.remove('header-closed');
      if (swipeArea) swipeArea.style.pointerEvents = 'none';
      return;
    }
    if (swipeArea) swipeArea.style.pointerEvents = header.classList.contains('header-show') ? 'none' : 'auto';
  };

  updateSwipeArea();
  if (!header.classList.contains('header-show')) showSwipeHint();

  const openHeader = () => {
    header.classList.add('header-show');
    headerToggleBtn.classList.replace('bi-list', 'bi-x');
    header.classList.remove('header-closed');
    swipeHint?.classList.remove('active');
    removeSwipeHint();
    updateSwipeArea();
  };

  const closeHeader = () => {
    header.classList.remove('header-show');
    headerToggleBtn.classList.replace('bi-x', 'bi-list');
    addSwipeHint();
    showSwipeHint();
    updateSwipeArea();
  };

  const headerToggle = (forceClose = false) => forceClose || header.classList.contains('header-show') ? closeHeader() : openHeader();

  headerToggleBtn.addEventListener('click', e => { e.stopPropagation(); headerToggle(); });
  header.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', e => {
    if (window.innerWidth >= 1200) return;
    if (header.classList.contains('header-show') &&
        !header.contains(e.target) &&
        !headerToggleBtn.contains(e.target)) headerToggle(true);
  });

  const onTouchStart = (e) => {
    if (window.innerWidth >= 1200) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    if ((!header.classList.contains('header-show') && e.target.closest('.swipe-area')) || header.classList.contains('header-show')) {
      isDragging = true;
      header.style.transition = 'none';
    }
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    let deltaX = currentX - startX;
    if (header.classList.contains('header-show')) {
      deltaX = Math.min(0, deltaX);
      header.style.transform = `translateX(${deltaX}px)`;
    } else {
      deltaX = Math.max(0, deltaX);
      deltaX = Math.min(deltaX, headerWidth);
      header.style.transform = `translateX(${deltaX - headerWidth}px)`;
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    header.style.transition = '';
    header.style.transform = '';
    const deltaX = currentX - startX;
    const threshold = headerWidth / 4;
    header.classList.contains('header-show') ? (deltaX < -threshold ? closeHeader() : openHeader())
                                           : (deltaX > threshold ? openHeader() : closeHeader());
  };

  document.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);

  /* ===============================
     Close nav on mobile link click
  =============================== */
  document.querySelectorAll('#navmenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1200 && header.classList.contains('header-show')) closeHeader();
    });
  });

  /* ===============================
     Dropdowns multinivel
  =============================== */
  const openDropdown = (li, menu, arrow) => {
    li.classList.add('active');
    menu.style.display = 'block';
    menu.style.height = '0px';
    menu.style.opacity = 0;
    const height = menu.scrollHeight + 'px';
    menu.offsetHeight;
    menu.style.transition = 'height 0.3s ease, opacity 0.3s ease';
    menu.style.height = height;
    menu.style.opacity = 1;
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    menu.addEventListener('transitionend', function cleanup() {
      menu.style.height = '';
      menu.style.transition = '';
      menu.removeEventListener('transitionend', cleanup);
    });
  };

  const closeDropdown = (li) => {
    li.classList.remove('active');
    const menu = li.querySelector(':scope > ul');
    const arrow = li.querySelector(':scope > a > .toggle-dropdown');
    if (!menu) return;
    menu.style.height = menu.scrollHeight + 'px';
    menu.offsetHeight;
    menu.style.transition = 'height 0.3s ease, opacity 0.3s ease';
    menu.style.height = '0px';
    menu.style.opacity = 0;
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    menu.addEventListener('transitionend', function cleanup() {
      menu.style.display = 'none';
      menu.style.height = '';
      menu.style.opacity = '';
      menu.style.transition = '';
      menu.removeEventListener('transitionend', cleanup);
    });
    li.querySelectorAll('li.dropdown.active').forEach(child => closeDropdown(child));
  };

  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const li = toggle.closest('li.dropdown');
      if (!li) return;
      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;
      li.parentNode.querySelectorAll(':scope > li.dropdown.active').forEach(s => { if (s !== li) closeDropdown(s); });
      li.classList.contains('active') ? closeDropdown(li) : openDropdown(li, submenu, toggle);
    });
  });

  /* ===============================
     Preloader
  =============================== */
  if (preloader) window.addEventListener('load', () => preloader.remove());

  /* ===============================
     Scroll top button
  =============================== */
  const toggleScrollTop = () => scrollTop?.classList.toggle('active', window.scrollY > 100);
  scrollTop?.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /* ===============================
     AOS
  =============================== */
  window.addEventListener('load', () => { if (window.AOS) AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false }); });

  /* ===============================
     Typed.js
  =============================== */
  const typedEl = document.querySelector('.typed');
  if (typedEl && window.Typed) new Typed('.typed', {
    strings: typedEl.getAttribute('data-typed-items').split(','),
    loop: true,
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 2000
  });

  /* ===============================
     PureCounter
  =============================== */
  if (window.PureCounter) new PureCounter();

  /* ===============================
     Skills animation
  =============================== */
  document.querySelectorAll('.skills-animation').forEach(item => {
    if (window.Waypoint) new Waypoint({
      element: item,
      offset: '80%',
      handler: () => item.querySelectorAll('.progress-bar').forEach(el => el.style.width = el.getAttribute('aria-valuenow') + '%')
    });
  });

  /* ===============================
     GLightbox
  =============================== */
  if (window.GLightbox) GLightbox({ selector: '.glightbox' });

  /* ===============================
     Dark / Light Theme
  =============================== */
  const applyTheme = (mode) => {
    if (mode === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
    updateThemeButton();
  };

  const updateThemeButton = () => {
    if (!toggleThemeBtn) return;
    toggleThemeBtn.innerHTML = document.body.classList.contains('light-mode')
      ? '<i class="bi bi-moon-fill"></i>'
      : '<i class="bi bi-sun-fill"></i>';
  };

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      applyTheme(newMode);
    });
  }

  window.addEventListener('storage', e => { if (e.key === 'theme') applyTheme(e.newValue); });

  /* ===============================
     Auto-open dropdowns por URL
  =============================== */
  const normalizePath = (path) => {
    let p = path.replace(window.location.origin, '').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    return p || '/';
  };

  const openMenuByCurrentURL = () => {
    const currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll('#navmenu a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const linkPath = normalizePath(href);
      if (currentPath === linkPath) {
        link.classList.add('active');
        let parent = link.closest('li.dropdown');
        while (parent) {
          parent.classList.add('active');
          const submenu = parent.querySelector(':scope > ul');
          if (submenu) submenu.style.display = 'block';
          const arrow = parent.querySelector(':scope > a > .toggle-dropdown');
          if (arrow) arrow.style.transform = 'rotate(180deg)';
          parent = parent.parentElement.closest('li.dropdown');
        }
      }
    });
  };
  window.addEventListener('load', openMenuByCurrentURL);

  /* ===============================
     Tutoriales dinámicos en header
  =============================== */
  const categoryIcons = {
    proxmox: 'bi bi-server',
    docker: 'bi bi-box',
    linux: 'bi bi-terminal',
    network: 'bi bi-wifi',
    default: 'bi bi-hdd-stack'
  };

  const getIconClass = (category) => categoryIcons[category.toLowerCase()] || categoryIcons.default;

  const createDropdown = (category, files) => {
    const li = document.createElement('li');
    li.classList.add('dropdown');
    li.dataset.id = category;

    li.innerHTML = `
      <a href="#"><i class="${getIconClass(category)} navicon"></i> ${category.charAt(0).toUpperCase() + category.slice(1)}
        <i class="bi bi-chevron-down toggle-dropdown"></i>
      </a>
      <ul class="dropdown-menu">
        ${files.map(file => `
          <li><a href="/tutoriales/${category}/${file}">
            <i class="bi bi-file-earmark-text navicon"></i> ${file.replace(/-/g,' ')}
          </a></li>
        `).join('')}
      </ul>
    `;

    const toggle = li.querySelector('.toggle-dropdown');
    toggle?.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;
      li.parentNode.querySelectorAll(':scope > li.dropdown.active').forEach(s => { if (s !== li) closeDropdown(s); });
      const isActive = li.classList.toggle('active');
      submenu.style.display = isActive ? 'block' : 'none';
      toggle.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    return li;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector('#navmenu li[data-id="tutoriales"] > .dropdown-menu');
    if (!menu) return;

    fetch('/forms/get-md-dir-tree.php')
      .then(res => res.json())
      .then(data => {
        Object.entries(data).forEach(([category, files]) => menu.appendChild(createDropdown(category, files)));

        // Abrir automáticamente según URL
        const currentPath = window.location.pathname.replace(window.location.origin, '').replace(/\/$/, '');
        document.querySelectorAll('#navmenu li.dropdown a[href]').forEach(link => {
          if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
            let parent = link.closest('li.dropdown');
            while (parent) {
              parent.classList.add('active');
              const submenu = parent.querySelector(':scope > ul');
              if (submenu) submenu.style.display = 'block';
              const arrow = parent.querySelector(':scope > a > .toggle-dropdown');
              if (arrow) arrow.style.transform = 'rotate(180deg)';
              parent = parent.parentElement.closest('li.dropdown');
            }
          }
        });
      })
      .catch(err => console.error('Error cargando tutoriales dinámicos:', err));
  });

})();
