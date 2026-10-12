(() => {
  const browser = document.querySelector('[data-communications]');
  if (!browser) return;
  const buttons = [...browser.querySelectorAll('[data-filter]')];
  const year = browser.querySelector('[data-year]');
  const cards = [...browser.querySelectorAll('[data-communication]')];
  const empty = browser.querySelector('[data-empty]');
  let type = 'all';

  const update = () => {
    let visible = 0;
    for (const card of cards) {
      const show = (type === 'all' || card.dataset.type === type)
        && (year.value === 'all' || card.dataset.year === year.value);
      card.hidden = !show;
      if (show) visible++;
    }
    empty.hidden = visible !== 0;
  };

  for (const button of buttons) button.addEventListener('click', () => {
    type = button.dataset.filter;
    for (const candidate of buttons) candidate.setAttribute('aria-pressed', String(candidate === button));
    update();
  });
  year.addEventListener('change', update);
})();
