// Share the application's theme preference; no network calls or visit storage.
try {
  const theme = localStorage.getItem('pk-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
document.addEventListener('DOMContentLoaded', () => {
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
