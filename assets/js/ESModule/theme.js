// ESModule/theme.js
export function initTheme() {
    const toggleThemeBtn = document.getElementById('toggle-theme');
  
    const applyTheme = mode => {
      document.body.classList.toggle('light-mode', mode === 'light');
      updateThemeButton();
    };
  
    const updateThemeButton = () => {
      if (!toggleThemeBtn) return;
      toggleThemeBtn.innerHTML = document.body.classList.contains('light-mode')
        ? '<i class="bi bi-moon-fill"></i>'
        : '<i class="bi bi-sun-fill"></i>';
    };
  
    applyTheme(localStorage.getItem('theme') || 'dark');
  
    toggleThemeBtn?.addEventListener('click', () => {
      const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', newMode);
      applyTheme(newMode);
    });
  
    window.addEventListener('storage', e => { if (e.key === 'theme') applyTheme(e.newValue); });
  }
  