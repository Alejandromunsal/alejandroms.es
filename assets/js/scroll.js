// scroll.js
(function() {
    const scrollTopBtn = document.querySelector('.scroll-top');
    const navLinks = document.querySelectorAll('.navmenu a');
  
    function toggleScrollTop() {
      if (!scrollTopBtn) return;
      window.scrollY > 100 ? scrollTopBtn.classList.add('active') : scrollTopBtn.classList.remove('active');
    }
  
    scrollTopBtn?.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  
    function navmenuScrollspy() {
      navLinks.forEach(link => {
        if (!link.hash) return;
        const section = document.querySelector(link.hash);
        if (!section) return;
        const position = window.scrollY + 200;
        if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
          document.querySelectorAll('.navmenu a.active').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  
    window.addEventListener('load', toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
  
    window.addEventListener('load', navmenuScrollspy);
    document.addEventListener('scroll', navmenuScrollspy);
  })();
  