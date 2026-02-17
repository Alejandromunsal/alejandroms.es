// ESModule/isotope.js
export function initIsotope() {
    window.initDynamicFeatures = () => {
      document.querySelectorAll('.isotope-layout').forEach(item => {
        const container = item.querySelector('.isotope-container');
        if (!container) return;
  
        const layout = item.getAttribute('data-layout') || 'masonry';
        const filter = item.getAttribute('data-default-filter') || '*';
        const sort = item.getAttribute('data-sort') || 'original-order';
        let iso;
  
        imagesLoaded(container, () => {
          iso = new Isotope(container, { itemSelector: '.isotope-item', layoutMode: layout, filter, sortBy: sort });
        });
  
        item.querySelectorAll('.isotope-filters li').forEach(f => {
          f.addEventListener('click', function () {
            item.querySelector('.filter-active')?.classList.remove('filter-active');
            this.classList.add('filter-active');
            iso?.arrange({ filter: this.getAttribute('data-filter') });
            AOS?.refresh();
          });
        });
      });
  
      // Skills animation
      document.querySelectorAll('.skills-animation').forEach(el => {
        if (!window.Waypoint) return;
        new Waypoint({
          element: el,
          offset: '80%',
          handler: () => el.querySelectorAll('.progress-bar').forEach(p => p.style.width = p.getAttribute('aria-valuenow') + '%')
        });
      });
  
      // Scroll to hash
      if (window.location.hash) {
        const section = document.querySelector(window.location.hash);
        if (section) setTimeout(() => {
          const m = parseInt(getComputedStyle(section).scrollMarginTop);
          window.scrollTo({ top: section.offsetTop - m, behavior: 'smooth' });
        }, 100);
      }
    };
  }
  