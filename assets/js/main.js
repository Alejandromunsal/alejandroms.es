/**
 * Updated: Feb 11 2026 with Bootstrap v5.3.7
 * Author: Alejandro Muñoz Salas
 */
(function () {
  "use strict";

  const header = document.getElementById('header');
  const headerToggleBtn = document.querySelector('.header-toggle');
  const swipeArea = document.querySelector('.swipe-area');
  const swipeHint = document.querySelector('.swipe-hint');

  if (!header || !headerToggleBtn) return;

  let headerWidth = header.offsetWidth;
  window.addEventListener('resize', () => { headerWidth = header.offsetWidth; updateSwipeArea(); });

  /* ===============================
     Swipe hint (móvil)
  =============================== */
  let hintTimeout;
  function showSwipeHint() {
    if (window.innerWidth > 1199 || header.classList.contains('header-show')) return;
    swipeHint?.classList.add('active');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => swipeHint?.classList.remove('active'), 4500);
  }

  function addSwipeHint() { header.classList.add('header-closed'); }
  function removeSwipeHint() { header.classList.remove('header-closed'); }

  function updateSwipeArea() {
    if (window.innerWidth >= 1200) {
      header.classList.remove('header-closed');
      if (swipeArea) swipeArea.style.pointerEvents = 'none';
      return;
    }
    if (swipeArea) swipeArea.style.pointerEvents = header.classList.contains('header-show') ? 'none' : 'auto';
  }

  updateSwipeArea();
  if (!header.classList.contains('header-show')) showSwipeHint();

  /* ===============================
     Abrir/Cerrar header
  =============================== */
  function openHeader() {
    header.classList.add('header-show');
    headerToggleBtn.classList.replace('bi-list', 'bi-x');
    header.classList.remove('header-closed');
    swipeHint?.classList.remove('active');
    removeSwipeHint();
    updateSwipeArea();
  }

  function closeHeader() {
    header.classList.remove('header-show');
    headerToggleBtn.classList.replace('bi-x', 'bi-list');
    addSwipeHint();
    showSwipeHint();
    updateSwipeArea();
  }

  function headerToggle(forceClose = false) {
    if (forceClose || header.classList.contains('header-show')) closeHeader();
    else openHeader();
  }

  headerToggleBtn.addEventListener('click', e => { e.stopPropagation(); headerToggle(); });
  header.addEventListener('click', e => e.stopPropagation());

  document.addEventListener('click', e => {
    if (window.innerWidth >= 1200) return;
    if (header.classList.contains('header-show') &&
        !header.contains(e.target) &&
        !headerToggleBtn.contains(e.target)) {
      headerToggle(true);
    }
  });

  /* ===============================
     Swipe progresivo (móvil)
  =============================== */
  let startX = 0, currentX = 0, isDragging = false;

  function onTouchStart(e) {
    if (window.innerWidth >= 1200) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    if ((!header.classList.contains('header-show') && e.target.closest('.swipe-area')) || header.classList.contains('header-show')) {
      isDragging = true;
      header.style.transition = 'none';
    }
  }

  function onTouchMove(e) {
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
  }

  function onTouchEnd() {
    if (!isDragging) return;
    isDragging = false;
    header.style.transition = '';
    header.style.transform = '';
    const deltaX = currentX - startX;
    const threshold = headerWidth / 4;
    if (header.classList.contains('header-show')) deltaX < -threshold ? closeHeader() : openHeader();
    else deltaX > threshold ? openHeader() : closeHeader();
  }

  document.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);

  /* ===============================
     Cerrar nav móvil al hacer click en link
  =============================== */
  document.querySelectorAll('#navmenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1200 && header.classList.contains('header-show')) closeHeader();
    });
  });

  /* ===============================
     Dropdowns multinivel
  =============================== */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(toggle => {
    toggle.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const li = toggle.closest('li.dropdown');
      if (!li) return;
      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;
      li.parentNode.querySelectorAll(':scope > li.dropdown.active')
        .forEach(sibling => { if (sibling !== li) closeDropdown(sibling); });
      li.classList.contains('active') ? closeDropdown(li) : openDropdown(li, submenu, toggle);
    });
  });

  function openDropdown(li, menu, arrow) {
    li.classList.add('active');
    menu.style.display = 'block';
    const height = menu.scrollHeight + 'px';
    menu.style.height = '0px';
    menu.style.opacity = 0;
    menu.offsetHeight;
    menu.style.transition = 'height 0.3s ease, opacity 0.3s ease';
    menu.style.height = height;
    menu.style.opacity = 1;
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    menu.addEventListener('transitionend', function cleanup() {
      menu.style.height = ''; menu.style.transition = ''; menu.removeEventListener('transitionend', cleanup);
    });
  }

  function closeDropdown(li) {
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
  }

  /* ===============================
     Preloader
  =============================== */
  const preloader = document.querySelector('#preloader');
  if (preloader) window.addEventListener('load', () => preloader.remove());

  /* ===============================
     Scroll top button
  =============================== */
  const scrollTop = document.querySelector('.scroll-top');
  function toggleScrollTop() { scrollTop?.classList.toggle('active', window.scrollY > 100); }
  scrollTop?.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /* ===============================
     AOS
  =============================== */
  window.addEventListener('load', () => {
    if (window.AOS) AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
  });

  /* ===============================
     Typed.js
  =============================== */
  const typedEl = document.querySelector('.typed');
  if (typedEl && window.Typed) {
    new Typed('.typed', {
      strings: typedEl.getAttribute('data-typed-items').split(','),
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

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
      handler: function () {
        item.querySelectorAll('.progress-bar').forEach(el => el.style.width = el.getAttribute('aria-valuenow') + '%');
      }
    });
  });

  /* ===============================
     GLightbox
  =============================== */
  if (window.GLightbox) GLightbox({ selector: '.glightbox' });

  /* ===============================
     Auto-open dropdowns by URL
  =============================== */
  function normalizePath(path) { return path.replace(window.location.origin, '').replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, ''); }

  function openMenuByCurrentURL() {
    const currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll('#navmenu a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      if (currentPath.includes(normalizePath(href))) {
        link.classList.add('active');
        let parent = link.closest('li.dropdown');
        while (parent) {
          parent.classList.add('active');
          parent.querySelector(':scope > ul')?.classList.add('dropdown-active');
          const arrow = parent.querySelector(':scope > a > .toggle-dropdown');
          if (arrow) arrow.style.transform = 'rotate(180deg)';
          parent = parent.parentElement.closest('li.dropdown');
        }
      }
    });
  }
  window.addEventListener('load', openMenuByCurrentURL);

/* ===============================
   Dark / Light Theme con sincronización entre pestañas
=============================== */
const toggleThemeBtn = document.getElementById('toggle-theme');

function applyTheme(mode) {
  if (mode === 'light') document.body.classList.add('light-mode');
  else document.body.classList.remove('light-mode');
  updateThemeButton();
}

function updateThemeButton() {
  if (!toggleThemeBtn) return;
  toggleThemeBtn.innerHTML = document.body.classList.contains('light-mode')
    ? '<i class="bi bi-moon-fill"></i>'
    : '<i class="bi bi-sun-fill"></i>';
}

// Aplicar tema guardado al cargar la página
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

// Cambiar tema al hacer click
if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener('click', () => {
    const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', newMode);
    applyTheme(newMode);
  });
}

// Escuchar cambios en otras pestañas y aplicarlos automáticamente
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    applyTheme(e.newValue);
  }
});


})();
