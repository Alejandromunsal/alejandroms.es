/**
 * Updated: Feb 10 2026 with Bootstrap v5.3.7
 * Author: Alejandro Muñoz Salas
 */

(function () {
  "use strict";

  const header = document.getElementById('header');
  const headerToggleBtn = document.querySelector('.header-toggle');
  const swipeArea = document.querySelector('.swipe-area');

  if (!header || !headerToggleBtn || !swipeArea) return;

  const headerWidth = header.offsetWidth;
  let startX = 0, currentX = 0, isDragging = false;

  /* ===============================
     Swipe hint (móvil)
  =============================== */
  const hint = document.querySelector('.swipe-hint');
  let hintTimeout;

  function showSwipeHint() {
    if (window.innerWidth > 1199) return;
    if (header.classList.contains('header-show')) return;
    hint?.classList.add('active');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => hint?.classList.remove('active'), 4500);
  }

  function hideSwipeHint() {
    header.classList.remove('header-closed');
  }

  function addSwipeHint() {
    header.classList.add('header-closed');
  }

  /* ===============================
     Actualizar swipe-area según header
  =============================== */
  function updateSwipeArea() {
    if (window.innerWidth >= 1200) return;
    swipeArea.style.pointerEvents = header.classList.contains('header-show') ? 'none' : 'auto';
  }

  updateSwipeArea();

  /* ===============================
     Abrir/Cerrar header
  =============================== */
  function openHeaderSmooth() {
    header.style.transition = 'transform 0.3s ease';
    header.style.transform = 'translateX(0)';
    header.classList.add('header-show');
    headerToggleBtn.classList.remove('bi-list');
    headerToggleBtn.classList.add('bi-x');
    hideSwipeHint();
    updateSwipeArea();
    header.addEventListener('transitionend', () => {
      header.style.transition = '';
      header.style.transform = '';
    }, { once: true });
  }

  function closeHeaderSmooth() {
    header.style.transition = 'transform 0.3s ease';
    header.style.transform = 'translateX(-100%)';
    header.classList.remove('header-show');
    headerToggleBtn.classList.add('bi-list');
    headerToggleBtn.classList.remove('bi-x');
    addSwipeHint();
    showSwipeHint();
    updateSwipeArea();
    header.addEventListener('transitionend', () => {
      header.style.transition = '';
      header.style.transform = '';
    }, { once: true });
  }

  function headerToggle(forceClose = false) {
    if (forceClose || header.classList.contains('header-show')) closeHeaderSmooth();
    else openHeaderSmooth();
  }

  headerToggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    headerToggle();
  });

  header.addEventListener('click', e => e.stopPropagation());

  /* ===============================
     Click fuera para cerrar header
  =============================== */
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
  function onTouchStart(e) {
    if (window.innerWidth >= 1200) return;
    startX = e.touches[0].clientX;
    currentX = startX;

    if ((!header.classList.contains('header-show') && e.target.closest('.swipe-area')) ||
      header.classList.contains('header-show')) {
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

    const deltaX = currentX - startX;
    const threshold = headerWidth / 4;

    if (header.classList.contains('header-show')) {
      deltaX < -threshold ? closeHeaderSmooth() : openHeaderSmooth();
    } else {
      deltaX > threshold ? openHeaderSmooth() : closeHeaderSmooth();
    }
  }

  document.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);

  // Mostrar hint al cargar si está cerrado
  if (!header.classList.contains('header-show')) showSwipeHint();

  /* ===============================
     Cerrar nav móvil al hacer click en link
  =============================== */
  document.querySelectorAll('#navmenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1200 && header.classList.contains('header-show')) {
        closeHeaderSmooth();
      }
    });
  });

  /* ===============================
     Dropdowns multinivel (transición suave)
  =============================== */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const li = this.closest('li.dropdown');
      if (!li) return;

      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;

      // Cerrar otros menús hermanos
      li.parentNode.querySelectorAll(':scope > li.dropdown.active')
        .forEach(sibling => { if (sibling !== li) closeDropdown(sibling); });

      // Alternar este menú
      li.classList.contains('active') ? closeDropdown(li) : openDropdown(li, submenu, this);
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
      menu.style.height = '';
      menu.style.transition = '';
      menu.removeEventListener('transitionend', cleanup);
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
  function toggleScrollTop() {
    if (!scrollTop) return;
    scrollTop.classList.toggle('active', window.scrollY > 100);
  }
  scrollTop?.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /* ===============================
     AOS
  =============================== */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  });

  /* ===============================
     Typed.js
  =============================== */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    new Typed('.typed', {
      strings: selectTyped.getAttribute('data-typed-items').split(','),
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /* ===============================
     PureCounter
  =============================== */
  new PureCounter();

  /* ===============================
     Skills animation
  =============================== */
  document.querySelectorAll('.skills-animation').forEach(item => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function () {
        item.querySelectorAll('.progress-bar').forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /* ===============================
     GLightbox
  =============================== */
  GLightbox({ selector: '.glightbox' });

  /* ===============================
     Auto-open dropdowns by URL
  =============================== */
  function normalizePath(path) {
    return path.replace(window.location.origin, '')
      .replace(/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
  }

  function openMenuByCurrentURL() {
    const currentPath = normalizePath(window.location.pathname);
    const links = document.querySelectorAll('#navmenu a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const linkPath = normalizePath(href);
      if (currentPath.includes(linkPath)) {
        link.classList.add('active');
        let parent = link.closest('li.dropdown');
        while (parent) {
          parent.classList.add('active');
          const submenu = parent.querySelector(':scope > .dropdown-menu');
          submenu?.classList.add('dropdown-active');
          const arrow = parent.querySelector(':scope > a > .toggle-dropdown');
          if (arrow) arrow.style.transform = 'rotate(180deg)';
          parent = parent.parentElement.closest('li.dropdown');
        }
      }
    });
  }

  window.addEventListener('load', openMenuByCurrentURL);

  /* ===============================
   Dark / Light
=============================== */
  document.addEventListener('DOMContentLoaded', () => {
    const toggleThemeBtn = document.getElementById('toggle-theme');
    if (!toggleThemeBtn) return;

    // Aplicar tema guardado al cargar
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-mode');
    }

    // Alternar tema al hacer clic
    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const mode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('theme', mode);
    });
  });



})();
