  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('lang-menu');

  langBtn.addEventListener('click', () => {
    const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
    langBtn.setAttribute('aria-expanded', String(!isExpanded));
    langMenu.classList.toggle('show');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.classList.remove('show');
      langBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Update button text on selection but allow navigation
  langMenu.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', (e) => {
      langBtn.textContent = item.textContent + " ▼";
      langMenu.classList.remove('show');
      langBtn.setAttribute('aria-expanded', 'false');
      // Navigation will happen naturally by link click
    });
  });