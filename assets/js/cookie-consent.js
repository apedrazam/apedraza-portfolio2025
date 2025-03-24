document.addEventListener('DOMContentLoaded', function() {
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const acceptButton = document.getElementById('accept-cookies');
  const rejectButton = document.getElementById('reject-analytics');
  const footer = document.getElementById('site-footer');
  
  // Early exit if elements don't exist
  if (!cookieBanner || !acceptButton || !rejectButton) {
    console.error('Cookie consent elements not found');
    return;
  }
  
  // Make sure the cookie banner is appended to the body, not in the flow
  // This eliminates any potential overflow issues
  if (cookieBanner.parentNode !== document.body) {
    document.body.appendChild(cookieBanner);
  }
  
  // Cookie functions
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
  }
  
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }
  
  // Check if consent has been given
  const consentGiven = getCookie('cookie_consent');
  
  // Show banner if no consent has been given yet
  if (consentGiven === null) {
    cookieBanner.style.display = 'block';
    adjustBannerPosition();
  }
  
  // Handle accept button click
  acceptButton.addEventListener('click', function() {
    setCookie('cookie_consent', 'accepted', 180); // 6 months
    cookieBanner.style.display = 'none';
    loadAnalytics();
  });
  
  // Handle reject button click
  rejectButton.addEventListener('click', function() {
    setCookie('cookie_consent', 'rejected', 180); // 6 months
    cookieBanner.style.display = 'none';
  });
  
  // Function to load analytics scripts
  function loadAnalytics() {
    const analyticsContainer = document.getElementById('analytics-scripts');
    if (!analyticsContainer) return;
    
    analyticsContainer.querySelectorAll('script-data').forEach(scriptData => {
      const script = document.createElement('script');
      
      if (scriptData.getAttribute('src')) {
        script.src = scriptData.getAttribute('src');
      }
      
      if (scriptData.textContent) {
        script.textContent = scriptData.textContent;
      }
      
      if (scriptData.getAttribute('async') !== null) {
        script.async = true;
      }
      
      document.head.appendChild(script);
    });
  }
  
  // Check if we should load analytics on page load
  if (consentGiven === 'accepted') {
    loadAnalytics();
  }
  
  // Function to adjust banner position relative to footer
  function adjustBannerPosition() {
    if (!cookieBanner || cookieBanner.style.display === 'none' || !footer) {
      return;
    }
    
    // Offset from the bottom of viewport in pixels (matches your CSS)
    let offset = 24; // default
    
    // Apply different offsets based on viewport width for responsive design
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 768) {
      offset = 12; // mobile
    } else if (viewportWidth <= 1024) {
      offset = 18; // tablet
    } else {
      offset = 18; // desktop
    }
    
    const footerRect = footer.getBoundingClientRect();
    const bannerHeight = cookieBanner.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // If footer is visible in viewport
    if (footerRect.top < windowHeight) {
      const absolutePosition = footerRect.top + scrollTop - bannerHeight - offset;
      
      cookieBanner.classList.add('above-footer');
      cookieBanner.style.position = 'absolute';
      cookieBanner.style.bottom = 'auto';
      cookieBanner.style.top = absolutePosition + 'px';
    } else {
      cookieBanner.classList.remove('above-footer');
      cookieBanner.style.position = 'fixed';
      cookieBanner.style.top = 'auto';
      cookieBanner.style.bottom = offset + 'px';
    }
  }
  
  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking && cookieBanner.style.display !== 'none') {
      window.requestAnimationFrame(function() {
        adjustBannerPosition();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  // Debounced resize handler
  let resizeTimer;
  window.addEventListener('resize', function() {
    if (cookieBanner.style.display !== 'none') {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(adjustBannerPosition, 100);
    }
  });
  
  // Initial check after a short delay to ensure all elements are properly loaded
  setTimeout(adjustBannerPosition, 100);
}); 