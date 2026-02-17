// ESModule/loader.js

let componentsLoadedOnce = false;

export async function initComponents() {

  if (componentsLoadedOnce) return;
  componentsLoadedOnce = true;

  const components = document.querySelectorAll("[data-component]");

  for (const el of components) {
    const path = el.dataset.component;
    if (!path) continue;

    try {
      const res = await fetch(path, { cache: "no-cache" });
      const html = await res.text();
      el.innerHTML = html;

      executeScripts(el);

    } catch (err) {
      console.error(err);
    }
  }

  document.dispatchEvent(new Event("componentsLoaded"));
}

function executeScripts(container) {
  container.querySelectorAll("script").forEach(oldScript => {
    const newScript = document.createElement("script");

    [...oldScript.attributes].forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    );

    newScript.textContent = oldScript.textContent;
    oldScript.replaceWith(newScript);
  });
}

document.addEventListener("DOMContentLoaded", initComponents);
