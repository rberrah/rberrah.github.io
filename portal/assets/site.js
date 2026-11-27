// Share the application's theme preference; no network calls or visit storage.
try {
  const theme = localStorage.getItem('pk-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
document.addEventListener('DOMContentLoaded', () => {
  // Open a linked abstract without storing reading state or making requests.
  function openLinkedAbstract() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const detail = document.getElementById(id);
    if (!detail?.matches('details.research-detail')) return;
    detail.open = true;
  }
  openLinkedAbstract();
  window.addEventListener('hashchange', openLinkedAbstract);
  const ecosystem = document.querySelector('.ecosystem-menu');
  if (ecosystem) {
    document.addEventListener('click', event => {
      if (!ecosystem.contains(event.target)) ecosystem.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && ecosystem.open) {
        ecosystem.open = false;
        ecosystem.querySelector('summary')?.focus();
      }
    });
    ecosystem.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { ecosystem.open = false; }));
  }
  const select = document.querySelector('#theme');
  if (!select) return;
  select.value = document.documentElement.dataset.theme || 'system';
  select.closest('label').hidden = false;
  select.addEventListener('change', () => {
    if (select.value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = select.value;
    try {
      if (select.value === 'system') localStorage.removeItem('pk-theme');
      else localStorage.setItem('pk-theme', select.value);
    } catch {}
  });
});
