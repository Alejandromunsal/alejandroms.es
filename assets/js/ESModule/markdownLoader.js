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

  loadMarkdown(baseDir, mdFile, containerSelector, dateSelector, titleSelector);
}

/* =========================
   EXPORTABLE loadMarkdown
========================= */
export function loadMarkdown(baseDir, mdFile, containerSelector = '.md-content', dateSelector = '.md-date', titleSelector = '.md-title') {

  fetch(`${baseDir}/${mdFile}?v=${Date.now()}`)
    .then(res => res.text())
    .then(md => {

      const containers = document.querySelectorAll(containerSelector);
      if (!containers.length) return;

      /* ===== EXTRAER H1 ===== */
      const lines = md.split('\n');
      let title = '';
      let titleLineIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('# ')) {
          title = line.replace(/^#\s+/, '').trim();
          titleLineIndex = i;
          break;
        }
      }

      if (titleLineIndex >= 0) {
        lines.splice(titleLineIndex, 1);
        md = lines.join('\n');
      }

      if (titleSelector && title) {
        document.querySelectorAll(titleSelector).forEach(el => el.innerText = title);
        document.title = `${title} | Alejandro Muñoz Salas`;
      }

      /* ===== PARSE MARKDOWN ===== */
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

      /* ===== FECHA ===== */
      if (dateSelector) {
        fetch(`/forms/get-md-date.php?file=${baseDir}/${mdFile}`)
          .then(res => res.json())
          .then(data => {
            if (!data.lastModified) return;

            const date = new Date(data.lastModified * 1000);

            document.querySelectorAll(dateSelector).forEach(el => {
              el.innerText =
                `Última actualización: ${date.toLocaleDateString('es-ES')} | Alejandro Muñoz Salas`;
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
  } else {
    fallbackCopy(text, btn);
  }
}

function fallbackCopy(text, btn) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    document.execCommand('copy');
    copiedFeedback(btn);
  } catch {
    errorFeedback(btn);
  }

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
