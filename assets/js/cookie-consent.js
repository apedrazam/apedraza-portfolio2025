(function() {
  const CONSENT_KEY = 'cookie_consent';

  function initCookieConsent() {
    console.log('Initializing cookie consent');

    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-analytics');
    const footer = document.getElementById('site-footer');
    const analyticsContainer = document.getElementById('analytics-scripts');

    if (!cookieBanner || !acceptButton || !rejectButton || !analyticsContainer) {
      console.error('Cookie consent elements not found');
      return;
    }

    // Move banner to body for proper positioning
    if (cookieBanner.parentNode !== document.body) {
      document.body.appendChild(cookieBanner);
    }

    const consentStatus = getCookie(CONSENT_KEY);
    console.log('Consent status:', consentStatus);

    if (!consentStatus) {
      console.log('No consent found, showing banner');
      cookieBanner.style.display = 'block';
      setTimeout(adjustBannerPosition, 100);
    } else {
      console.log('Consent already given:', consentStatus);
      cookieBanner.style.display = 'none';
      if (consentStatus === 'accepted') loadAnalytics();
    }

    // Event Listeners
    acceptButton.addEventListener('click', () => handleConsent('accepted'), { once: true });
    rejectButton.addEventListener('click', () => handleConsent('rejected'), { once: true });

    // Handle user consent
    function handleConsent(choice) {
      console.log(`${choice} button clicked`);
      setCookie(CONSENT_KEY, choice, 180);
      cookieBanner.style.display = 'none';
      choice === 'accepted' ? loadAnalytics() : clearAnalytics();
    }

    // Cookie Helpers
    function setCookie(name, value, days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 86400000);
      document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax; Secure`;
      console.log('Cookie set:', name, '=', value);
    }

    function getCookie(name) {
      return document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='))
        ?.split('=')[1] || null;
    }

    // Analytics Management
    function loadAnalytics() {
      console.log('Loading analytics');
      
      // Remove any existing analytics scripts first
      clearAnalytics();
      
      // Run any analytics scripts that are in the analytics-scripts container
      const scripts = analyticsContainer.querySelectorAll('script[type="text/plain"]');
      scripts.forEach(script => {
        const analytics = script.getAttribute('data-analytics');
        console.log(`Loading: ${analytics}`);
        
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
          newScript.async = true;
        } else {
          newScript.textContent = script.textContent;
        }
        
        document.head.appendChild(newScript);
        console.log(`Activated: ${analytics}`);
      });
      
      console.log('Analytics loaded');
    }

    function clearAnalytics() {
      console.log('Clearing analytics');
      
      // Remove existing heap scripts
      document.querySelectorAll('script[src*="heap-api.com"]').forEach(script => script.remove());
      
      // Remove existing clarity scripts
      document.querySelectorAll('script[src*="clarity.ms"]').forEach(script => script.remove());

      // Stop tracking and clean up analytics data
      if (window.heap) {
        window.heap.stopTracking();
        window.heap = undefined;
      }
      
      // Clear Clarity if it exists
      if (window.clarity) {
        window.clarity = undefined;
      }

      // Clear analytics cookies
      ['_heap', '_clarity'].forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Clear Microsoft Clarity cookies
      const clarityCookiePattern = /^_clck|^_clsk|^MUID/;
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.split('=')[0].trim();
        if (clarityCookiePattern.test(cookieName)) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
    }

    // UI Adjustments
    function adjustBannerPosition() {
      if (!cookieBanner || cookieBanner.style.display === 'none' || !footer) return;

      let offset = window.innerWidth <= 768 ? 12 : 18; // Responsive offsets
      const footerRect = footer.getBoundingClientRect();
      const bannerHeight = cookieBanner.offsetHeight;
      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;

      if (footerRect.top < viewportHeight) {
        // Footer is in view - position banner above footer
        cookieBanner.classList.add('above-footer');
        cookieBanner.style.position = 'absolute';
        cookieBanner.style.bottom = '';
        
        // Calculate absolute position from top
        const absoluteTopPosition = footerRect.top + scrollTop - bannerHeight - offset;
        cookieBanner.style.top = `${absoluteTopPosition}px`;
      } else {
        // Footer is not in view - reset to fixed position
        cookieBanner.classList.remove('above-footer');
        cookieBanner.style.position = 'fixed';
        cookieBanner.style.top = '';
        cookieBanner.style.bottom = `${offset}px`;
      }
    }

    // Scroll & Resize Handlers
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (cookieBanner.style.display !== 'none') {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(adjustBannerPosition, 10);
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      if (cookieBanner.style.display !== 'none') {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustBannerPosition, 100);
      }
    });
    
    // Initial positioning
    setTimeout(adjustBannerPosition, 200);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    setTimeout(initCookieConsent, 100);
  }
})();