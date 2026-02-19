// ESModule/dynamicCards.js
export function initDynamicCards(section = 'tutorials', containerId = 'tutorial-cards') {

  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  /* =========================
     ICONOS
  ========================= */
  const categoryIcons = {
    proxmox: 'si si-proxmox',
    docker: 'si si-docker',
    linux: 'si si-linux',
    web: 'si si-html5',
    arduino: 'si si-arduino',
    esp32: 'bi bi-cpu',
    default: 'bi bi-hdd-stack'
  };
  const getIconClass = cat =>
    categoryIcons[(cat || "").toLowerCase()] || categoryIcons.default;

  /* =========================
     NORMALIZE
  ========================= */
  const normalize = str => str?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() || "";

  /* =========================
     CLEAN MARKDOWN
  ========================= */
  const cleanMarkdown = md => {
    let lines = md.replace(/\r\n/g, '\n').split('\n').map(l => l.trimEnd());
    lines = lines.filter(l => !l.match(/!\[.*?\]\(.*?\)/));
    const removeBlock = keyword => {
      const start = lines.findIndex(l => l.trim().toLowerCase() === keyword);
      if (start >= 0) {
        let count = 1;
        for (let i = start + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          if (line.startsWith('- ')) count++; else break;
        }
        lines.splice(start, count);
      }
    };
    ['md-info:', 'related:', 'md-details:'].forEach(removeBlock);
    return lines;
  };

  /* =========================
     DESCRIPTION
  ========================= */
  const extractDescription = lines => {
    const titleIndex = lines.findIndex(l => l.startsWith("# "));
    if (titleIndex === -1) return "";
    const paragraph = [];
    for (let i = titleIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === "---") continue;
      if (line.startsWith("#") || line.startsWith("- ") || line.startsWith("```")) {
        if (paragraph.length) break;
        continue;
      }
      paragraph.push(line);
      if (lines[i + 1]?.trim() === "") break;
    }
    let description = paragraph.join(" ");
    if (description.length > 200) description = description.slice(0, 200) + "…";
    return description;
  };

  /* =========================
     MD INFO
  ========================= */
  const extractMdInfo = md => {
    const lines = md.split('\n');
    const start = lines.findIndex(l => l.trim().toLowerCase() === "md-info:");
    if (start === -1) return "";
    const items = [];
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || !line.startsWith("- ")) break;
      items.push(line.replace(/^- /, "").trim());
    }
    return items.join(" ");
  };

  /* =========================
     CREATE CARD (con AOS)
  ========================= */
  const createCard = ({ title, description, mdInfo, url, iconClass, delay }) => {
    const col = document.createElement('div');
    col.className = "tutorial-col col-lg-4 col-md-6";
    col.dataset.searchTitle = normalize(title);
    col.dataset.searchInfo = normalize(mdInfo);

    col.innerHTML = `
      <div class="service-card position-relative z-1" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="service-icon"><i class="${iconClass}"></i></div>
        <a href="${url}" class="card-action d-flex align-items-center justify-content-center rounded-circle">
          <i class="bi bi-arrow-up-right"></i>
        </a>
        <h3><a href="${url}">${title}</a></h3>
        <p>${description}</p>
      </div>
    `;

    const titleEl = col.querySelector("h3 a");
    if (titleEl) titleEl.dataset.original = titleEl.innerHTML;

    return col;
  };

  /* =========================
     TRAVERSE DIRECTORIOS
  ========================= */
  const traverse = async (obj, pathPrefix = "") => {
    const cols = [];
    let delayCounter = 0;

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        for (const fileName of value) {
          const filePath = `${pathPrefix}${key}/${fileName}`.replace(/\/+/g, '/');
          try {
            const res = await fetch(`/content/tutorials/${filePath}.md`);
            if (!res.ok) continue;
            const md = await res.text();
            const lines = cleanMarkdown(md);
            const title = lines.find(l => l.startsWith("# "))?.replace(/^#\s+/, "") || "Tutorial";
            const description = extractDescription(lines);
            const mdInfo = extractMdInfo(md);
            const url = `/tutoriales/${filePath.replace(/\.md$/, '')}`;
            const iconClass = getIconClass(key);
            cols.push(createCard({ title, description, mdInfo, url, iconClass, delay: delayCounter }));
            delayCounter += 100; // cada card 50ms más
          } catch (err) {
            console.warn("Error cargando MD:", filePath, err);
          }
        }
      } else if (typeof value === "object") {
        const childCols = await traverse(value, `${pathPrefix}${key}/`);
        cols.push(...childCols);
        delayCounter += childCols.length * 50;
      }
    }
    return cols;
  };

  /* =========================
     BUSCADOR CON FUSE.JS
  ========================= */
  const initSearch = async (iso, cards) => {
    // import Fuse desde CDN
    const { default: Fuse } = await import('https://cdn.jsdelivr.net/npm/fuse.js@6.6.2/dist/fuse.esm.js');

    const data = cards.map(c => ({
      element: c,
      title: c.dataset.searchTitle,
      info: c.dataset.searchInfo
    }));

    const fuse = new Fuse(data, {
      keys: ['title', 'info'],
      threshold: 0.3,   // ajusta sensibilidad
      ignoreLocation: true
    });

    const input = document.getElementById("tutorial-search-input");
    input?.addEventListener("input", () => {
      const query = normalize(input.value);
      const results = query ? fuse.search(query).map(r => r.item) : data.map(d => d);

      iso.arrange({
        filter: itemElem => results.some(r => r.element === itemElem)
      });

      // Resalta coincidencias en títulos
      //results.forEach(r => {
      //  const titleEl = r.element.querySelector("h3 a");
      //  if (titleEl && titleEl.dataset.original) {
      //    const escaped = query.split(/\s+/).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      //    const regex = new RegExp(`(${escaped.join("|")})`, "gi");
      //    titleEl.innerHTML = titleEl.dataset.original.replace(
      //      regex,
      //      `<span class="search-highlight">$1</span>`
      //    );
      //  }
      //});

      // refresca AOS para animaciones de filtrado
      window.AOS?.refresh();
    });
  };

  /* =========================
     RENDER FINAL
  ========================= */
  const renderCards = async () => {
    try {
      const res = await fetch(`/forms/get-md-dir-tree.php?section=${section}`);
      const data = await res.json();
      const cards = await traverse(data);
      container.append(...cards);

      // Inicializa Isotope
      const iso = new Isotope(container, {
        itemSelector: '.tutorial-col',
        layoutMode: 'fitRows',
        percentPosition: true,
        transitionDuration: '0.55s'
      });

      // Inicializa AOS
      window.AOS?.refresh();

      // Inicializa buscador Fuse
      initSearch(iso, cards);

      document.dispatchEvent(new Event('dynamicCardsLoaded'));
    } catch (err) {
      console.error("Error renderizando cards:", err);
    }
  };

  renderCards();
}
