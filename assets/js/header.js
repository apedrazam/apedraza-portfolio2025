// Header functionality
(function() {
  // Theme management
  const THEME_KEY = 'theme';

  function updateHeroOpacity(theme) {
    const heroSvg = document.getElementById('hero-bg-svg');
    if (heroSvg) {
      if (heroSvg.contentDocument) {
        const mainGroup = heroSvg.contentDocument.querySelector('g[filter]');
        if (mainGroup) {
          mainGroup.style.fillOpacity = theme === 'dark' ? '0.65' : '1';
        }
      } else {
        heroSvg.addEventListener('load', function() {
          const mainGroup = heroSvg.contentDocument.querySelector('g[filter]');
          if (mainGroup) {
            mainGroup.style.fillOpacity = theme === 'dark' ? '0.65' : '1';
          }
        });
      }
    }
  }

  function updateBackgroundOpacity(theme) {
    const topBg = document.querySelector('.top-bg-block');
    if (topBg) {
      topBg.style.opacity = theme === 'dark' ? '0.65' : '1';
    }

    document.querySelectorAll('.bottom-bg-block').forEach(bg => {
      bg.style.opacity = theme === 'dark' ? '0.65' : '1';
    });
  }

  function setThemePreference(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateHeroOpacity(theme);
    updateBackgroundOpacity(theme);
  }

  function getThemePreference() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme;
    
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // Header visibility management
  function initHeaderVisibility() {
    const header = document.getElementById('sticky-header');
    if (!header) return;

    // Check if we're on the homepage
    const isHomePage = window.location.pathname === '/' || 
                      window.location.pathname === '/index.html' ||
                      document.body.classList.contains('home');
    
    if (isHomePage) {
      // On homepage, initially hide header and show on scroll
      header.style.transform = 'translateY(-150%)';
      
      // Check scroll position and update header visibility
      function updateHeaderVisibility() {
        if (window.scrollY > 300) {
          header.style.transform = 'translateY(0)';
        } else {
          header.style.transform = 'translateY(-160%)';
        }
      }
      
      // Set initial state based on current scroll
      updateHeaderVisibility();
      
      // Update on scroll
      window.addEventListener('scroll', updateHeaderVisibility);
    } else {
      // On all other pages, show header immediately
      header.style.transform = 'translateY(0)';
    }
  }

  // Initialize everything
  function init() {
    // Theme initialization
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setThemePreference(currentTheme === 'light' ? 'dark' : 'light');
      });
    }

    // Set initial theme
    const savedTheme = getThemePreference();
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTimeout(() => {
      updateHeroOpacity(savedTheme);
      updateBackgroundOpacity(savedTheme);
    }, 100);

    // Initialize header visibility
    initHeaderVisibility();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 