// ESModule/preloader.js
export function initPreloader() {
    const preloader = document.querySelector('#preloader');
    if (!preloader) return;
    const onReady = (fn) => document.readyState === "complete" ? fn() : window.addEventListener("load", fn);
    onReady(() => preloader.remove());
  }
  