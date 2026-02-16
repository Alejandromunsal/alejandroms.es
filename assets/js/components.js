/**
 * HTML Component Loader
 * Alejandro Muñoz Salas - Modular System v1
 */

(async function () {
    "use strict";
  
    async function loadComponent(el) {
      const path = el.dataset.component;
      if (!path) return;
  
      try {
        const res = await fetch(path, { cache: "no-cache" });
  
        if (!res.ok) throw new Error(`Error loading ${path}`);
  
        const html = await res.text();
  
        el.innerHTML = html;
  
        // Ejecutar scripts dentro del componente
        executeScripts(el);
  
      } catch (err) {
        console.error(err);
        el.innerHTML = `<!-- component error: ${path} -->`;
      }
    }
  
    function executeScripts(container) {
      const scripts = container.querySelectorAll("script");
  
      scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
  
        [...oldScript.attributes].forEach(attr =>
          newScript.setAttribute(attr.name, attr.value)
        );
  
        newScript.textContent = oldScript.textContent;
  
        oldScript.replaceWith(newScript);
      });
    }
  
    async function initComponents() {
      const components = document.querySelectorAll("[data-component]");
  
      // carga secuencial (importante para header → main.js)
      for (const el of components) {
        await loadComponent(el);
      }
  
      // 🔥 evento global cuando todo está cargado
      document.dispatchEvent(new Event("componentsLoaded"));
      if (window.initDynamicFeatures) {
        window.initDynamicFeatures();
      }
    }
  
    document.addEventListener("DOMContentLoaded", initComponents);
  
  })();
  