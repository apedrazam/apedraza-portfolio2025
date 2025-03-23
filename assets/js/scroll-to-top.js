// Scroll to Top functionality
(function() {
  // Initialize on load
  function initScrollToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    const footer = document.getElementById('site-footer');
    
    if (!backToTopButton) {
      console.error('Scroll to top button not found');
      return;
    }
    
    // Define offset above footer (in pixels)
    const footerOffset = 3 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    
    // Track if button is above footer to prevent unnecessary style changes
    let isAboveFooter = false;
    
    // Function to handle scroll and position the button
    function handleScroll() {
      // Show button when scrolled down 300px
      if (window.scrollY > 300) {
        if (!backToTopButton.classList.contains('visible')) {
          backToTopButton.classList.add('visible');
        }
      } else {
        if (backToTopButton.classList.contains('visible')) {
          backToTopButton.classList.remove('visible');
        }
        if (backToTopButton.classList.contains('above-footer')) {
          backToTopButton.classList.remove('above-footer');
          backToTopButton.style.bottom = '';
          isAboveFooter = false;
        }
        return;
      }
      
      // Check footer position and adjust button
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // If the footer is approaching the bottom of the viewport
        if (footerRect.top < windowHeight) {
          // Calculate distance to keep button above footer
          const bottomPosition = windowHeight - footerRect.top + footerOffset;
          
          // Only update if position changed significantly to avoid layout thrashing
          if (!isAboveFooter || Math.abs(parseFloat(backToTopButton.style.bottom) - bottomPosition) > 1) {
            // Set flag before changing class to avoid transition issues
            isAboveFooter = true;
            
            // Apply position immediately, then add class
            backToTopButton.style.bottom = `${bottomPosition}px`;
            
            // Add class if not already there
            if (!backToTopButton.classList.contains('above-footer')) {
              backToTopButton.classList.add('above-footer');
            }
          }
        } else if (isAboveFooter) {
          // Reset to normal fixed position
          isAboveFooter = false;
          backToTopButton.classList.remove('above-footer');
          backToTopButton.style.bottom = '';
        }
      }
    }
    
    // Initialize scroll handler with throttling for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Handle on resize with debouncing
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleScroll, 100);
    });
    
    // Initial position check
    setTimeout(handleScroll, 100);
    
    // Add click event to scroll to top
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({top: 0, behavior: 'smooth'});
    });
    
    console.log('Scroll to top component initialized');
  }
  
  // Initialize component when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollToTop);
  } else {
    setTimeout(initScrollToTop, 100); // Small delay to ensure footer is loaded
  }
})(); 