// ESModule/scrollTop.js
export function initScrollTop() {
    const scrollTop = document.querySelector('.scroll-top');
    if (!scrollTop) return;
    const toggleScrollTop = () => scrollTop.classList.toggle('active', window.scrollY > 100);
    scrollTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    const onReady = (fn) => document.readyState === "complete" ? fn() : window.addEventListener("load", fn);
    onReady(toggleScrollTop);
    document.addEventListener('scroll', toggleScrollTop);
  }
  