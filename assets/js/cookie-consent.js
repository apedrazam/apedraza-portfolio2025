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
      adjustBannerPosition();
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
      console.log('✅ Loading analytics scripts...');
  
      // Get the analytics container
      const analyticsContainer = document.getElementById('analytics-scripts');
      if (!analyticsContainer) {
          console.error('❌ Analytics container not found');
          return;
      }
  
      // Process all analytics scripts (from hidden div)
      analyticsContainer.querySelectorAll('script[type="text/plain"]').forEach(scriptData => {
          const analytics = scriptData.getAttribute('data-analytics');
          console.log(`Loading: ${analytics}`);
          
          // Standard handling for analytics
          const newScript = document.createElement('script');
          newScript.setAttribute('data-analytics', analytics);
  
          // Handle external vs inline scripts
          if (scriptData.src) {
              newScript.src = scriptData.src;
              newScript.async = true;
          } else {
              newScript.innerHTML = scriptData.innerHTML;
          }
  
          // Append to document
          document.head.appendChild(newScript);
          console.log(`✅ Activated: ${analytics}`);
      });
      
      // Load Clarity when consent is accepted (will be implemented with NPM)
      if (window.loadClarity && typeof window.loadClarity === 'function') {
          window.loadClarity();
      }
    }

    function clearAnalytics() {
      console.log('Clearing analytics');
      
      // Remove existing heap scripts
      document.querySelectorAll('script[src*="heap-api.com"]').forEach(script => script.remove());

      // Stop tracking and clean up analytics data
      if (window.heap) {
        window.heap.stopTracking();
        window.heap = undefined;
      }

      // Clear analytics cookies
      ['_heap'].forEach(cookie => {
        document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Clear Clarity if it exists (will be implemented with NPM)
      if (window.clearClarity && typeof window.clearClarity === 'function') {
          window.clearClarity();
      }
    }

    // UI Adjustments
    function adjustBannerPosition() {
      if (!cookieBanner || cookieBanner.style.display === 'none' || !footer) return;

      let offset = window.innerWidth <= 768 ? 12 : 18; // Responsive offsets
      const footerRect = footer.getBoundingClientRect();
      const bannerHeight = cookieBanner.offsetHeight;
      const scrollTop = window.scrollY;

      if (footerRect.top < window.innerHeight) {
        cookieBanner.classList.add('above-footer');
        cookieBanner.style.position = 'absolute';
        cookieBanner.style.top = `${footerRect.top + scrollTop - bannerHeight - offset}px`;
      } else {
        cookieBanner.classList.remove('above-footer');
        cookieBanner.style.position = 'fixed';
        cookieBanner.style.bottom = `${offset}px`;
      }
    }

    // Scroll & Resize Handlers
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking && cookieBanner.style.display !== 'none') {
        requestAnimationFrame(() => {
          adjustBannerPosition();
          ticking = false;
        });
        ticking = true;
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
    setTimeout(adjustBannerPosition, 100);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent);
  } else {
    setTimeout(initCookieConsent, 100);
  }
})();