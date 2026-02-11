// header.js
(function() {
    const header = document.querySelector('#header');
    const headerToggleBtn = document.querySelector('.header-toggle');
  
    function toggleHeader() {
      header.classList.toggle('header-show');
      headerToggleBtn.classList.toggle('bi-list');
      headerToggleBtn.classList.toggle('bi-x');
    }
  
    headerToggleBtn.addEventListener('click', toggleHeader);
  
    // Ocultar mobile nav al hacer click en enlaces
    document.querySelectorAll('#navmenu a').forEach(link => {
      link.addEventListener('click', () => {
        if (header.classList.contains('header-show')) toggleHeader();
      });
    });
  
    // Toggle dropdowns mobile
    document.querySelectorAll('.navmenu .toggle-dropdown').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const parent = btn.parentNode;
        parent.classList.toggle('active');
        const submenu = parent.querySelector('.dropdown-menu');
        if (submenu) submenu.classList.toggle('dropdown-active');
        e.stopImmediatePropagation();
      });
    });
  })();
  