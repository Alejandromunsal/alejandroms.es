// ESModule/loader.js

let componentsLoadedOnce = false;

export async function initComponents() {

  // evitar doble inicialización
  if (componentsLoadedOnce) return;
  componentsLoadedOnce = true;

  // cargar TODOS los componentes (incluidos los anidados)
  await loadAllComponents();

  // pequeño delay para asegurar layout/render
  requestAnimationFrame(() => {
    document.dispatchEvent(new Event("componentsLoaded"));
  });
}


/**
 * Carga componentes de forma recursiva hasta que
 * no quede ningún [data-component] sin cargar.
 */
async function loadAllComponents() {

  while (true) {

    // seleccionar solo los que aún no se han cargado
    const components = document.querySelectorAll(
      "[data-component]:not([data-loaded])"
    );

    if (!components.length) break;

    for (const el of components) {

      const path = el.dataset.component;
      if (!path) continue;

      try {
        const res = await fetch(path, { cache: "no-cache" });

        if (!res.ok) {
          throw new Error(`Error loading component: ${path}`);
        }

        const html = await res.text();

        // insertar HTML
        el.innerHTML = html;

        // marcar como cargado (evita loops infinitos)
        el.setAttribute("data-loaded", "true");

        // ejecutar scripts incluidos en el componente
        executeScripts(el);

      } catch (err) {
        console.error("[Component Loader]", err);
      }
    }
  }
}


/**
 * Reejecuta scripts insertados dinámicamente
 * (el navegador no ejecuta scripts vía innerHTML)
 */
function executeScripts(container) {

  container.querySelectorAll("script").forEach(oldScript => {

    const newScript = document.createElement("script");

    // copiar atributos (type, src, defer, etc.)
    [...oldScript.attributes].forEach(attr => {
      newScript.setAttribute(attr.name, attr.value);
    });

    newScript.textContent = oldScript.textContent;

    oldScript.replaceWith(newScript);
  });
}
