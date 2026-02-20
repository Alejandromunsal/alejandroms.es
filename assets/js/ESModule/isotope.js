// ESModule/isotope.js
export function initIsotope() {
  document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
      filters.addEventListener('click', function () {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
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

