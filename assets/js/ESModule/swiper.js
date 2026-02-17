// ESModule/swiper.js
export function initSwiper() {
    const onReady = (fn) => document.readyState === "complete" ? fn() : window.addEventListener("load", fn);
    onReady(() => {
      document.querySelectorAll(".init-swiper").forEach(el => {
        const configEl = el.querySelector(".swiper-config");
        if (!configEl) return;
        const config = JSON.parse(configEl.innerHTML.trim());
        new Swiper(el, config);
      });
    });
  }
  