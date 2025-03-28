(function() {
  // Cookie consent key
  const CONSENT_KEY = 'cookie_consent';
  
  function initCookieConsent() {
    console.log('Initializing cookie consent');
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
    
    // Check if consent has been given
    const consentGiven = getCookie(CONSENT_KEY);
    console.log('Consent status:', consentGiven);
    
    // Show banner if no consent has been given yet
    if (consentGiven === null) {
      console.log('No consent found, showing banner');
      cookieBanner.style.display = 'block';
      adjustBannerPosition();
    } else {
      console.log('Consent already given:', consentGiven);
      cookieBanner.style.display = 'none';
      if (consentGiven === 'accepted') {
        // Load analytics if already accepted
        loadAnalytics();
      }
    }
    
    // Handle accept button click
    acceptButton.addEventListener('click', function() {
      console.log('Accept button clicked');
      setCookie(CONSENT_KEY, 'accepted', 180); // 6 months
      cookieBanner.style.display = 'none';
      loadAnalytics();
    });
    
    // Handle reject button click
    rejectButton.addEventListener('click', function() {
      console.log('Reject button clicked');
      setCookie(CONSENT_KEY, 'rejected', 180); // 6 months
      cookieBanner.style.display = 'none';
    });
    
    // Cookie functions
    function setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "; expires=" + date.toUTCString();
      document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
      console.log('Cookie saved:', name, '=', value);
      
      // Verify cookie was set
      setTimeout(() => {
        const savedValue = getCookie(name);
        console.log('Verified cookie saved:', name, '=', savedValue);
      }, 100);
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
    
    // Function to load analytics scripts
    function loadAnalytics() {
      console.log('Loading analytics scripts');
      const analyticsContainer = document.getElementById('analytics-scripts');
      if (!analyticsContainer) {
        console.error('Analytics container not found');
        return;
      }
      
      // Clear any existing analytics scripts
      const existingScripts = document.querySelectorAll('script[src*="heap-api.com"], script[src*="clarity.ms"]');
      existingScripts.forEach(script => script.remove());
      
      // Clear any existing analytics data
      if (window.heap) {
        window.heap.stopTracking();
        window.heap = undefined;
      }
      if (window.clarity) {
        window.clarity.stop();
        window.clarity = undefined;
      }
      
      // Clone and append each script from the container
      analyticsContainer.querySelectorAll('script').forEach(script => {
        const newScript = script.cloneNode(true);
        document.head.appendChild(newScript);
        console.log('Added analytics script to head');
      });
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
  }
  
  // Initialize component when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    // If document is already loaded (for fast loading scenarios)
    console.log('Document already loaded, initializing cookie consent with delay');
    setTimeout(initCookieConsent, 100); // Small delay to ensure footer is loaded
  }
})(); 