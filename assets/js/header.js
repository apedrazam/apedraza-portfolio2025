(function() {
  const THEME_KEY = 'theme';

  function updateHeroOpacity(theme) {
    const heroSvg = document.getElementById('hero-bg-svg');
    if (!heroSvg) return;
    const applyOpacity = () => {
      const mainGroup = heroSvg.contentDocument?.querySelector('g[filter]');
      if (mainGroup) mainGroup.style.fillOpacity = theme === 'dark' ? '0.65' : '1';
    };
    heroSvg.contentDocument ? applyOpacity() : heroSvg.addEventListener('load', applyOpacity);
  }

  function updateBackgroundOpacity(theme) {
    document.querySelector('.top-bg-block')?.style.setProperty('opacity', theme === 'dark' ? '0.65' : '1');
    document.querySelectorAll('.bottom-bg-block').forEach(bg => bg.style.opacity = theme === 'dark' ? '0.65' : '1');
  }

  function setThemePreference(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateHeroOpacity(theme);
    updateBackgroundOpacity(theme);
  }

  function getThemePreference() {
    return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function initHeaderVisibility() {
    const header = document.getElementById('sticky-header');
    if (!header) return;
    const isHomePage = ['/', '/index.html'].includes(window.location.pathname) || document.body.classList.contains('home');
    if (!isHomePage) return header.style.transform = 'translateY(0)';
    header.style.transform = 'translateY(-150%)';
    const updateHeaderVisibility = () => header.style.transform = window.scrollY > 300 ? 'translateY(0)' : 'translateY(-160%)';
    updateHeaderVisibility();
    window.addEventListener('scroll', updateHeaderVisibility);
  }

  function init() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      setThemePreference(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
    const savedTheme = getThemePreference();
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTimeout(() => {
      updateHeroOpacity(savedTheme);
      updateBackgroundOpacity(savedTheme);
    }, 100);
    initHeaderVisibility();
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
