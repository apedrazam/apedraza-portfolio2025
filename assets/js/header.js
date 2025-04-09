(function() {
  const THEME_KEY = 'theme';
  
  // Get system preference but don't automatically apply it if the user already has a preference
  const getSystemPreference = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  // Initialize theme based on localStorage or default to light
  const getTheme = () => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (!savedTheme) {
      localStorage.setItem(THEME_KEY, 'light');
      return 'light';
    }
    return savedTheme;
  };

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateOpacity(theme);
  }

  function updateOpacity(theme) {
    const opacity = theme === 'light' ? '1' : '0.65';
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
    
    // Initialize theme if not already set
    if (!document.documentElement.hasAttribute('data-theme')) {
      const theme = getTheme();
      document.documentElement.setAttribute('data-theme', theme);
      updateOpacity(theme);
    }
    
    initHeader();
  }

  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', init) : init();
})();
