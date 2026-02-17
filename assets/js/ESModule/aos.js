// ESModule/aos.js
export function initAOS() {
    const onReady = (fn) => document.readyState === "complete" ? fn() : window.addEventListener("load", fn);
    onReady(() => {
      if (window.AOS) AOS.init({ duration: 600, easing: 'ease-in-out', once: true, mirror: false });
    });
  }
  