// ESModule/router.js

import { initComponents } from './loader.js';

export function initRouter() {

  // interceptar clicks en enlaces
  document.addEventListener("click", async (e) => {

    const link = e.target.closest("a");
    if (!link) return;

    // ignorar si:
    if (link.target === "_blank") return;
    if (link.hasAttribute("download")) return;
    if (link.origin !== location.origin) return;
    if (link.hash && link.pathname === location.pathname) return;

    e.preventDefault();

    navigate(link.href);
  });

  // botón atrás / adelante
  window.addEventListener("popstate", () => {
    navigate(location.href, false);
  });
}


/**
 * Navegación interna sin recarga
 */
async function navigate(url, pushState = true) {

  try {

    document.body.classList.add("page-loading");

    const response = await fetch(url, {
      headers: { "X-Requested-With": "fetch" }
    });

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const newMain = doc.querySelector("main");
    const currentMain = document.querySelector("main");

    if (!newMain || !currentMain) {
      window.location.href = url;
      return;
    }

    // actualizar título
    document.title = doc.title;

    // transición suave (si el navegador soporta)
    if (document.startViewTransition) {

      await document.startViewTransition(() => {
        currentMain.replaceWith(newMain);
      }).finished;

    } else {
      currentMain.replaceWith(newMain);
    }

    // cargar componentes del nuevo contenido
    await initComponents();

    // reinicializar UI global
    document.dispatchEvent(new Event("componentsLoaded"));

    // scroll arriba
    window.scrollTo({ top: 0, behavior: "instant" });

    // historial navegador
    if (pushState) {
      history.pushState({}, "", url);
    }

  } catch (err) {
    console.error("[Router]", err);
    window.location.href = url;
  } finally {
    document.body.classList.remove("page-loading");
  }
}
