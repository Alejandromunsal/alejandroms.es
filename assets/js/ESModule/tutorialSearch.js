/* =========================
   INIT LIVE SEARCH MULTI-PALABRA
========================= */
export function initTutorialSearch() {
    const input = document.getElementById("tutorial-search-input");
    const container = document.getElementById("tutorial-cards");
    if (!input || !container) return;
  
    const cards = [...container.querySelectorAll(".service-card")];
    if (!cards.length) return;
  
    // Guardar texto plano original sin modificar <a>
    cards.forEach(card => {
      card.querySelectorAll("[data-searchable]").forEach(el => {
        el.dataset.text = el.textContent;
      });
    });
  
    const normalize = str => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
    const highlight = (el, words = []) => {
      let html = el.dataset.text;
      if (words.length) {
        const regex = new RegExp(words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
        html = html.replace(regex, match => `<span class="search-highlight">${match}</span>`);
      }
      el.innerHTML = html;
    };
  
    const filter = () => {
      const query = input.value.trim();
      const words = query.split(/\s+/).map(normalize).filter(Boolean);
  
      cards.forEach(card => {
        const col = card.closest(".tutorial-col");
        const text = normalize(card.dataset.search || "");
        const match = words.length === 0 || words.some(w => text.includes(w));
  
        if (match) {
          col.classList.remove("search-hidden");
          col.style.pointerEvents = "auto";
          card.querySelectorAll("[data-searchable]").forEach(el => highlight(el, words));
        } else {
          col.classList.add("search-hidden");
          col.style.pointerEvents = "none";
          card.querySelectorAll("[data-searchable]").forEach(el => highlight(el, []));
        }
      });
    };
  
    // Debounce para no recalcular en cada letra
    let t;
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(filter, 150);
    });
  }
  