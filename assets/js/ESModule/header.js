// ESModule/header.js
export function initHeader() {

  const header = document.getElementById('header');
  const headerToggleBtn = document.querySelector('.header-toggle');
  const swipeArea = document.querySelector('.swipe-area');
  const swipeHint = document.querySelector('.swipe-hint');

  if (!header || !headerToggleBtn) return;

  let headerWidth = header.offsetWidth;
  window.addEventListener('resize', () => { headerWidth = header.offsetWidth; updateSwipeArea(); });

  // =======================
  // SWIPE & HINT
  // =======================
  let hintTimeout, startX = 0, currentX = 0, isDragging = false;

  const showSwipeHint = () => {
    if (window.innerWidth > 1199 || header.classList.contains('header-show')) return;
    swipeHint?.classList.add('active');
    clearTimeout(hintTimeout);
    hintTimeout = setTimeout(() => swipeHint?.classList.remove('active'), 4500);
  };

  const updateSwipeArea = () => {
    if (window.innerWidth >= 1200) {
      header.classList.remove('header-closed');
      if (swipeArea) swipeArea.style.pointerEvents = 'none';
      return;
    }
    if (swipeArea) swipeArea.style.pointerEvents = header.classList.contains('header-show') ? 'none' : 'auto';
  };

  const openHeader = () => {
    header.classList.add('header-show');
    headerToggleBtn.classList.replace('bi-list', 'bi-x');
    header.classList.remove('header-closed');
    swipeHint?.classList.remove('active');
    updateSwipeArea();
  };

  const closeHeader = () => {
    header.classList.remove('header-show');
    headerToggleBtn.classList.replace('bi-x', 'bi-list');
    header.classList.add('header-closed');
    showSwipeHint();
    updateSwipeArea();
  };

  const headerToggle = (forceClose = false) => forceClose || header.classList.contains('header-show') ? closeHeader() : openHeader();

  headerToggleBtn.addEventListener('click', e => { e.stopPropagation(); headerToggle(); });
  header.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', e => {
    if (window.innerWidth < 1200 && header.classList.contains('header-show') && !header.contains(e.target) && !headerToggleBtn.contains(e.target)) headerToggle(true);
  });

  // =======================
  // SWIPE MOBILE
  // =======================
  document.addEventListener('touchstart', e => {
    if (window.innerWidth >= 1200) return;
    startX = currentX = e.touches[0].clientX;
    if ((!header.classList.contains('header-show') && e.target.closest('.swipe-area')) || header.classList.contains('header-show')) {
      isDragging = true; header.style.transition = 'none';
    }
  });
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    let deltaX = currentX - startX;
    if (header.classList.contains('header-show')) deltaX = Math.min(0, deltaX);
    else { deltaX = Math.max(0, deltaX); deltaX = Math.min(deltaX, headerWidth); deltaX -= headerWidth; }
    header.style.transform = `translateX(${deltaX}px)`;
  });
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false; header.style.transition = ''; header.style.transform = '';
    const deltaX = currentX - startX, threshold = headerWidth / 4;
    header.classList.contains('header-show') ? (deltaX < -threshold ? closeHeader() : openHeader()) : (deltaX > threshold ? openHeader() : closeHeader());
  });

  // =======================
  // DROPDOWNS MULTINIVEL
  // =======================
  const saveMenuState = () => {
    // Guardamos todos los li.dropdown que estén abiertos
    const openDropdowns = Array.from(document.querySelectorAll('#navmenu li.dropdown.active'))
      .map(li => li.dataset.path || li.querySelector('a')?.getAttribute('href'))
      .filter(Boolean);
    localStorage.setItem('menuState', JSON.stringify(openDropdowns));
  };

  const restoreMenuState = () => {
    const data = localStorage.getItem('menuState');
    if (!data) return;
    const openDropdowns = JSON.parse(data);
    openDropdowns.forEach(path => {
      const li = Array.from(document.querySelectorAll('#navmenu li.dropdown'))
        .find(li => li.dataset.path === path || li.querySelector('a')?.getAttribute('href') === path);
      if (!li) return;
      li.classList.add('active');
      const submenu = li.querySelector(':scope>ul');
      if (submenu) submenu.style.display = 'block';
    });
  };

  const toggleDropdown = (li, menu, arrow) => {
    li.classList.contains('active') ? closeDropdown(li) : openDropdown(li, menu, arrow);
    saveMenuState();
  };

  const openDropdown = (li, menu, arrow) => {
    li.classList.add('active');
    menu.style.display = 'block';
    menu.style.height = '0px';
    menu.style.opacity = '0';
    menu.style.overflow = 'hidden';
    const height = menu.scrollHeight;
    requestAnimationFrame(() => {
      menu.style.transition = 'height 0.3s ease, opacity 0.3s ease';
      menu.style.height = height + 'px';
      menu.style.opacity = '1';
    });
    menu.addEventListener('transitionend', () => {
      menu.style.height = '';
      menu.style.overflow = '';
      menu.style.transition = '';
    }, { once: true });
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  };

  const closeDropdown = (li) => {
    li.classList.remove('active');
    const menu = li.querySelector(':scope>ul');
    const arrow = li.querySelector(':scope>a>.toggle-dropdown');
    if (!menu) return;
    const height = menu.scrollHeight;
    menu.style.height = height + 'px';
    menu.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      menu.style.transition = 'height 0.3s ease, opacity 0.3s ease';
      menu.style.height = '0px';
      menu.style.opacity = '0';
    });
    menu.addEventListener('transitionend', () => {
      menu.style.display = 'none';
      menu.style.height = '';
      menu.style.opacity = '';
      menu.style.transition = '';
      menu.style.overflow = '';
    }, { once: true });
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  };

  const initDropdownToggles = () => {
    document.querySelectorAll('#navmenu .toggle-dropdown').forEach(toggle => {
      toggle.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const li = toggle.closest('li.dropdown');
        const menu = li?.querySelector(':scope>ul');
        if (!li || !menu) return;
        li.parentNode.querySelectorAll(':scope>li.dropdown.active').forEach(s => { if (s !== li) closeDropdown(s); });
        toggleDropdown(li, menu, toggle);
      });
    });
  };

  // =======================
  // Cerrar header al clicar enlaces finales
  // =======================
  document.querySelectorAll('#navmenu a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.closest('li.dropdown')?.querySelector('ul')) return; // tiene submenú
      saveMenuState(); // guardar la estructura actual de menús abiertos
      if (window.innerWidth < 1200 && header.classList.contains('header-show')) closeHeader();
    });
  });

  // =======================
  // Inicialización final
  // =======================
  document.addEventListener('dynamicMenuLoaded', () => {
    initDropdownToggles();
    restoreMenuState();   // restaurar menú abierto desde localStorage
  });

  showSwipeHint();
  updateSwipeArea();
}
