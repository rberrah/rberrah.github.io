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
  const menus = [...document.querySelectorAll('.nav-links > details.ecosystem-menu')];
  menus.forEach(menu => {
    menu.addEventListener('toggle', () => {
      if (menu.open) menus.forEach(other => { if (other !== menu) other.open = false; });
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  });
  document.addEventListener('click', event => {
    menus.forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const opened = menus.find(menu => menu.open && menu.contains(document.activeElement)) || menus.find(menu => menu.open);
    if (!opened) return;
    menus.forEach(menu => { menu.open = false; });
    opened.querySelector('summary')?.focus();
  });
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
