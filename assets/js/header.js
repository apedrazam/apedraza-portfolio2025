(function() {
  const THEME_KEY = 'theme';
  const getTheme = () => localStorage.getItem(THEME_KEY) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateOpacity(theme);
  }

  function updateOpacity(theme) {
    const opacity = theme === 'dark' ? '0.65' : '1'; // Fixed - Always use 1 for light theme (default)
    document.querySelectorAll('.top-bg-block, .bottom-bg-block, .top-bg-block-mobile, .bottom-bg-block-mobile')
      .forEach(bg => bg.style.opacity = opacity);

    const heroSvg = document.getElementById('hero-bg-svg');
    if (heroSvg) {
      const applyOpacity = () => heroSvg.contentDocument?.querySelector('g[filter]')?.style.setProperty('fill-opacity', opacity);
      heroSvg.contentDocument ? applyOpacity() : heroSvg.addEventListener('load', applyOpacity);
    }
  }

  function initHeader() {
    const header = document.getElementById('sticky-header');
    if (!header || !['/', '/index.html'].includes(location.pathname) && !document.body.classList.contains('home')) 
      return header.style.transform = 'translateY(0)';
    const update = () => header.style.transform = scrollY > 300 ? 'translateY(0)' : 'translateY(-160%)';
    header.style.transform = 'translateY(-150%)'; update();
    addEventListener('scroll', update);
  }

  function init() {
    document.getElementById('theme-toggle')?.addEventListener('click', () => setTheme(getTheme() === 'light' ? 'dark' : 'light'));
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateOpacity(theme);
    initHeader();
  }

  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', init) : init();
})();
