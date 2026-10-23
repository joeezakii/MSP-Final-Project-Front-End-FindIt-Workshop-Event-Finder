function initTheme() {
  const savedTheme = localStorage.getItem('eventhub_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}

function applyTheme(theme) {
  const html = document.documentElement;
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');

  if (theme === 'dark') {
    html.classList.add('dark');
    if (sunIcon && moonIcon) {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
    localStorage.setItem('eventhub_theme', 'dark');
  } else {
    html.classList.remove('dark');
    if (sunIcon && moonIcon) {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
    localStorage.setItem('eventhub_theme', 'light');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark ? 'light' : 'dark');
}
initTheme();