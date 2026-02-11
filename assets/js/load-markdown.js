// Iconos Bootstrap
const ICON_COPY = `<i class="bi bi-clipboard"></i>`;
const ICON_OK = `<i class="bi bi-check2"></i>`;
const ICON_ERROR = `<i class="bi bi-exclamation-triangle"></i>`;

function loadMarkdown(mdFile, containerId, dateContainerId = null) {
  fetch(mdFile)
    .then(res => res.text())
    .then(md => {
      const container = document.getElementById(containerId);
      container.innerHTML = marked.parse(md);

      container.querySelectorAll('pre code').forEach(codeBlock => {
        hljs.highlightElement(codeBlock);

        const pre = codeBlock.parentElement;
        pre.classList.add('markdown-code');

        // Detectar lenguaje y setear data
        const langClass = [...codeBlock.classList].find(c => c.startsWith('language-'));
        const language = langClass ? langClass.replace('language-', '') : 'text';
        pre.setAttribute('data-lang', language);

        // Botón copiar
        if (!pre.querySelector('.copy-btn')) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'copy-btn btn btn-sm btn-light';
          btn.innerHTML = ICON_COPY;

          // Tooltip Bootstrap
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

      // Fecha de modificación
      if (dateContainerId) {
        fetch('/forms/get-md-date.php?file=' + mdFile)
          .then(res => res.json())
          .then(data => {
            if (data.lastModified) {
              const date = new Date(data.lastModified * 1000);
              document.getElementById(dateContainerId).innerText =
                `Última actualización: ${date.toLocaleDateString('es-ES')} · Alejandro Muñoz Salas`;
            }
          });
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById(containerId).innerHTML =
        '<p>No se pudo cargar el contenido.</p>';
    });
}

/* =========================
   Copiar + feedback
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
  btn.innerHTML = ICON_ERROR;
  btn.classList.add('text-danger');
  tooltip.setContent({ '.tooltip-inner': 'Error' });

  setTimeout(() => {
    btn.innerHTML = ICON_COPY;
    btn.classList.remove('text-danger');
    tooltip.setContent({ '.tooltip-inner': 'Copiar' });
  }, 1500);
}
