// ESModule/markdownLoader.js

/* =========================
   ICONOS
========================= */
const ICON_COPY = `<i class="bi bi-clipboard"></i>`;
const ICON_OK = `<i class="bi bi-check2"></i>`;
const ICON_ERROR = `<i class="bi bi-exclamation-triangle"></i>`;

/* =========================
   INIT PUBLICO
========================= */
export function initMarkdownLoader() {
  const containerSelector = '.md-content';
  const dateSelector = '.md-date';
  const titleSelector = '.md-title';
  const imgSelector = '.md-img';
  const infoSelector = '.md-info'; // md-info
  const relatedSelector = '.md-related'; // related
  const serviceInfoSelector = '.md-details'; // md-details

  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  let path = window.location.pathname;

  let baseDir = '';
  let cleanPath = '';

  if (path.startsWith('/tutoriales/')) {
    baseDir = '/content/tutorials';
    cleanPath = path.replace(/^\/tutoriales\//, '');
  } else if (path.startsWith('/proyectos/')) {
    baseDir = '/content/proyectos';
    cleanPath = path.replace(/^\/proyectos\//, '');
  } else {
    return;
  }

  const mdFile = cleanPath.replace(/\/$/, '') + '.md';

  loadMarkdown(
    baseDir,
    mdFile,
    containerSelector,
    dateSelector,
    titleSelector,
    imgSelector,
    infoSelector,
    relatedSelector,
    serviceInfoSelector
  );
}

/* =========================
   EXPORTABLE loadMarkdown
========================= */
export function loadMarkdown(
  baseDir,
  mdFile,
  containerSelector = '.md-content',
  dateSelector = '.md-date',
  titleSelector = '.md-title',
  imgSelector = '.md-img',
  infoSelector = '.md-info',
  relatedSelector = '#md-related',
  serviceInfoSelector = '.md-details'
) {
  fetch(`${baseDir}/${mdFile}?v=${Date.now()}`)
    .then(res => res.text())
    .then(md => {

      const containers = document.querySelectorAll(containerSelector);
      if (!containers.length) return;

      const lines = md.split('\n');

      // ===== EXTRAER PRIMERA IMAGEN =====
      let image = '';
      for (let i = 0; i < lines.length; i++) {
        const imgMatch = lines[i].match(/!\[.*?\]\((.*?)\)/);
        if (imgMatch) {
          image = imgMatch[1];
          lines.splice(i, 1);
          break;
        }
      }

      // ===== EXTRAER H1 =====
      let title = '';
      let titleLineIndex = lines.findIndex(line => line.startsWith('# '));
      if (titleLineIndex >= 0) {
        title = lines[titleLineIndex].replace(/^#\s+/, '').trim();
        lines.splice(titleLineIndex, 1);
      }

      // ===== EXTRAER md-info =====
      let mdInfoItems = [];
      const mdInfoStart = lines.findIndex(line => line.trim().toLowerCase() === 'md-info:');
      if (mdInfoStart >= 0) {
        for (let i = mdInfoStart + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('- ')) mdInfoItems.push(line.replace(/^- /, '').trim());
          else break;
        }
        lines.splice(mdInfoStart, mdInfoItems.length + 1);
      }

      // ===== EXTRAER RELATED =====
      let relatedItems = [];
      const relatedStart = lines.findIndex(line => line.trim().toLowerCase() === 'related:');
      if (relatedStart >= 0) {
        for (let i = relatedStart + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line.startsWith('- ')) break;

          const parts = line.replace(/^- /, '').split('|').map(p => p.trim());
          relatedItems.push({
            title: parts[0] || '',
            url: parts[1] || '#',
            icon: parts[2] || 'bi-link',
            desc: parts[3] || ''
          });
        }
        lines.splice(relatedStart, relatedItems.length + 1);
      }

      // ===== EXTRAER md-details =====
      let serviceInfoItems = [];
      const serviceInfoStart = lines.findIndex(line => line.trim().toLowerCase() === 'md-details:');
      if (serviceInfoStart >= 0) {
        for (let i = serviceInfoStart + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line.startsWith('- ')) break;

          const parts = line.replace(/^- /, '').split('|').map(p => p.trim());
          serviceInfoItems.push({
            title: parts[0] || '',
            icon: parts[1] || 'bi-info-circle',
            desc: parts[2] || ''
          });
        }
        lines.splice(serviceInfoStart, serviceInfoItems.length + 1);
      }

      // Reconstruir markdown limpio
      md = lines.join('\n');

      // ===== INSERTAR TÍTULO =====
      if (titleSelector && title) {
        document.querySelectorAll(titleSelector).forEach(el => el.innerText = title);
        document.title = `${title} | Alejandro Muñoz Salas`;
      }

      // ===== INSERTAR IMAGEN PRINCIPAL =====
      if (imgSelector && image) {
        document.querySelectorAll(imgSelector).forEach(el => {
          el.innerHTML = `<img src="${image}" alt="${title}" class="img-fluid rounded mb-4">`;
        });
      }

      // ===== INSERTAR FEATURES (md-info) =====
      if (infoSelector && mdInfoItems.length > 0) {
        const infoContainer = document.querySelector(infoSelector);
        if (infoContainer) {
          infoContainer.innerHTML = `
            <div class="features mt-4">
              <div class="row gy-4">
                ${mdInfoItems.map((item, index) => `
                  <div class="col-md-6" data-aos="fade-up" data-aos-delay="${(index + 1) * 100}">
                    <div class="feature-box d-flex align-items-center">
                      <i class="bi bi-check"></i>
                      <h4>${item}</h4>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      // ===== INSERTAR md-details =====
      if (serviceInfoSelector && serviceInfoItems.length > 0) {
        const serviceContainer = document.querySelector(serviceInfoSelector);
        if (serviceContainer) {
          serviceContainer.innerHTML = `
            <h4>Detalles del Tutorial</h4>
            ${serviceInfoItems.map(item => `
              <div class="info-item">
                <i class="bi ${item.icon}"></i>
                <h5>${item.title}</h5>
                <p>${item.desc}</p>
              </div>
            `).join('')}
          `;
        }
      }

      // ===== INSERTAR RELATED =====
      if (relatedSelector && relatedItems.length > 0) {
        const relatedContainer = document.querySelector(relatedSelector);
        if (relatedContainer) {
          relatedContainer.innerHTML = `
            <div class="related-services mt-5">
              <h4>Tutoriales Relacionados</h4>
              ${relatedItems.map(item => `
                <div class="service-item">
                  <i class="bi ${item.icon}"></i>
                  <h5><a href="${item.url}">${item.title}</a></h5>
                  <p>${item.desc}</p>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

      // ===== PARSE MARKDOWN =====
      containers.forEach(container => {
        container.innerHTML = marked.parse(md);

        container.querySelectorAll('pre code').forEach(codeBlock => {
          hljs.highlightElement(codeBlock);

          const pre = codeBlock.parentElement;
          pre.classList.add('markdown-code');

          const langClass = [...codeBlock.classList].find(c => c.startsWith('language-'));
          const language = langClass ? langClass.replace('language-', '') : 'text';

          pre.setAttribute('data-lang', language);

          if (!pre.querySelector('.copy-btn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-btn btn btn-sm btn-light';
            btn.innerHTML = ICON_COPY;

            btn.setAttribute('data-bs-toggle', 'tooltip');
            btn.setAttribute('data-bs-placement', 'left');
            btn.setAttribute('title', 'Copiar');

            new bootstrap.Tooltip(btn);

            btn.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();
              copyCode(codeBlock.textContent, btn);
            });

            pre.appendChild(btn);
          }
        });
      });

      // ===== FECHA =====
      if (dateSelector) {
        fetch(`/forms/get-md-date.php?file=${baseDir}/${mdFile}`)
          .then(res => res.json())
          .then(data => {
            if (!data.lastModified) return;
            const date = new Date(data.lastModified * 1000);
            document.querySelectorAll(dateSelector).forEach(el => {
              el.innerText = `Última actualización: ${date.toLocaleDateString('es-ES')} | Alejandro Muñoz Salas`;
            });
          });
      }

    })
    .catch(err => {
      console.error(err);
      document.querySelectorAll(containerSelector).forEach(container => {
        container.innerHTML = '<p>No se pudo cargar el contenido.</p>';
      });
    });
}

/* =========================
   COPY SYSTEM
========================= */
function copyCode(text, btn) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => copiedFeedback(btn))
      .catch(() => fallbackCopy(text, btn));
  } else fallbackCopy(text, btn);
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand('copy'); copiedFeedback(btn); }
  catch { errorFeedback(btn); }
  document.body.removeChild(textarea);
}

function copiedFeedback(btn) {
  const tooltip = bootstrap.Tooltip.getInstance(btn);
  if (!tooltip) return;
  btn.innerHTML = ICON_OK;
  btn.classList.add('text-success');
  tooltip.setContent({ '.tooltip-inner': 'Copiado' });
  setTimeout(() => {
    btn.innerHTML = ICON_COPY;
    btn.classList.remove('text-success');
    tooltip.setContent({ '.tooltip-inner': 'Copiar' });
  }, 1200);
}

function errorFeedback(btn) {
  const tooltip = bootstrap.Tooltip.getInstance(btn);
  if (!tooltip) return;
  btn.innerHTML = ICON_ERROR;
  btn.classList.add('text-danger');
  tooltip.setContent({ '.tooltip-inner': 'Error' });
  setTimeout(() => {
    btn.innerHTML = ICON_COPY;
    btn.classList.remove('text-danger');
    tooltip.setContent({ '.tooltip-inner': 'Copiar' });
  }, 1500);
}
