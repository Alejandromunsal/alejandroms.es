// ESModule/dynamicCards.js
export function initDynamicCards(section = 'tutorials', containerId = 'tutorial-cards') {
    const container = document.getElementById(containerId);
    if (!container) return;
  
    container.innerHTML = ""; // limpiar contenedor
  
    const categoryIcons = {
      proxmox: 'bi bi-server',
      docker: 'bi bi-box',
      linux: 'bi bi-terminal',
      web: 'bi bi-wifi',
      default: 'bi bi-palette'
    };
    const getIconClass = cat => categoryIcons[cat.toLowerCase()] || categoryIcons.default;
  
    // Crear card idéntica a la estática
    const createCard = ({ title, description, url, iconClass, delay }) => {
      const col = document.createElement('div');
      col.className = "col-lg-4 col-md-6";
      col.setAttribute("data-aos", "fade-up");
      col.setAttribute("data-aos-delay", delay);
  
      // Separar última palabra para <span> si hay más de una
      let displayTitle = title;
      let spanPart = "";
      const words = title.trim().split(" ");
      if (words.length > 1) {
        displayTitle = words.slice(0, -1).join(" ");
        spanPart = words[words.length - 1];
      }
  
      col.innerHTML = `
        <div class="service-card position-relative z-1">
          <div class="service-icon">
            <i class="${iconClass}"></i>
          </div>
          <a href="${url}" class="card-action d-flex align-items-center justify-content-center rounded-circle">
            <i class="bi bi-arrow-up-right"></i>
          </a>
          <h3>
            <a href="${url}">
              ${displayTitle}${spanPart ? ` <span>${spanPart}</span>` : ''}
            </a>
          </h3>
          <p>${description}</p>
        </div>
      `;
      return col;
    };
  
    // Recorrer árbol de MD
    const traverse = async (obj, pathPrefix = "", delay = 100) => {
      const cols = [];
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          for (const fileName of value) {
            const filePath = `${pathPrefix}${key}/${fileName}`.replace(/\/+/g, '/');
            try {
              const res = await fetch(`/content/tutorials/${filePath}.md?v=${Date.now()}`);
              if (!res.ok) continue;
              const md = await res.text();
              const lines = md.split("\n");
  
              const title = lines.find(l => l.startsWith("# "))?.replace(/^#\s+/, "").trim() || "Tutorial";
  
              // Primer párrafo útil ignorando ---
              let description = "";
              for (let line of lines) {
                const clean = line.replace(/---/g, '').trim();
                if (clean && !clean.startsWith("#")) {
                  description = clean;
                  break;
                }
              }
              if (description.length > 200) description = description.slice(0, 200) + '…';
  
              const url = `/tutoriales/${filePath.replace(/\.md$/, '')}`;
              const iconClass = getIconClass(key);
  
              cols.push(createCard({ title, description, url, iconClass, delay }));
              delay += 100;
              if (delay > 300) delay = 100;
  
            } catch (err) {
              console.error("Error cargando MD:", filePath, err);
            }
          }
        } else if (typeof value === "object") {
          const nestedCols = await traverse(value, `${pathPrefix}${key}/`, delay);
          cols.push(...nestedCols);
        }
      }
      return cols;
    };
  
    // Igualar altura de todas las cards
    const equalizeHeights = () => {
      const allCards = Array.from(container.querySelectorAll('.service-card'));
      let maxHeight = 0;
      allCards.forEach(card => {
        card.style.height = 'auto';
        if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight;
      });
      allCards.forEach(card => card.style.height = maxHeight + 'px');
    };
  
    // Render principal
    const renderCards = async () => {
      try {
        const res = await fetch(`/forms/get-md-dir-tree.php?section=${section}`);
        const data = await res.json();
        const cards = await traverse(data);
        cards.forEach(c => container.appendChild(c));
  
        // Igualar alturas después de render
        setTimeout(() => {
          equalizeHeights();
          if (window.AOS) AOS.refresh();
        }, 50);
  
        // Igualar alturas al redimensionar
        window.addEventListener('resize', equalizeHeights);
  
        document.dispatchEvent(new Event('dynamicCardsLoaded'));
      } catch (err) {
        console.error("Error cargando lista de MDs:", err);
      }
    };
  
    renderCards();
  }
  