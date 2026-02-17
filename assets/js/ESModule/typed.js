// ESModule/typed.js
export function initTyped() {
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
  }
  