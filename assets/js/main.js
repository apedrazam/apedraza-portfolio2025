// Prevent layout shift for top background SVG
(() => {
  if (window.location.pathname !== '/') {
    // Method 1: Force immediate download with high priority
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = '/assets/img/top-bg-block2.svg';
    link.fetchpriority = 'high';
    document.head.appendChild(link);
    
    // Method 2: Apply inline dimensions to any container that has this as background
    window.addEventListener('load', () => {
      // Find elements with the background SVG
      const bgElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage.includes('top-bg-block2.svg');
      });
      
      // For each element with our SVG background, ensure dimensions are set
      bgElements.forEach(el => {
        if (!el.style.height) {
          // Get the natural dimensions of the SVG (2560x768 from the file)
          const aspectRatio = 768 / 2560;
          const width = el.offsetWidth;
          const height = width * aspectRatio;
          
          // Set min-height to reserve space
          el.style.minHeight = `${height}px`;
        }
      });
    });
  }
})();

// NOTE: Accordion functionality has been moved to a dedicated file: accordion.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Checking Font Awesome icons in footer...');
  
  // Get all Font Awesome icons in the footer
  const footerIcons = document.querySelectorAll('#site-footer i[class*="fa-"]');
  
  // For each icon, log its class and computed style
  footerIcons.forEach((icon, index) => {
    const computedStyle = window.getComputedStyle(icon, '::before');
    const content = computedStyle.getPropertyValue('content');
    console.log(`Footer icon #${index + 1}:`, {
      classList: icon.className,
      content: content,
      fontFamily: computedStyle.getPropertyValue('font-family'),
      fontWeight: computedStyle.getPropertyValue('font-weight')
    });
  });

  // Elements
  const header = document.getElementById('header');
  const backToTop = document.getElementById('back-to-top');
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleIcon = themeToggle.querySelector('.theme-toggle__icon');
  const flashcardBtns = document.querySelectorAll('.work-card__flashcard-btn');
  const flashcards = document.querySelectorAll('.flashcard');
  const flashcardCloseBtns = document.querySelectorAll('.flashcard__close');
  const heroSection = document.querySelector('.hero');
  
  // Variables
  let lastScrollY = window.scrollY;
  let heroHeight = heroSection ? heroSection.offsetHeight : 0;
  
  // Theme handling
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggleIcon.classList.toggle('fa-sun', theme === 'dark');
    themeToggleIcon.classList.toggle('fa-moon', theme === 'light');
  };
  
  // Initialize theme
  setTheme(localStorage.getItem('theme') || 'light');
  
  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });
  
  // Scroll handler for sticky header and back to top button
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Show/hide header after hero section
    header.classList.toggle('header--visible', currentScrollY > heroHeight);
    
    // Show back to top with delay
    setTimeout(() => {
      backToTop.classList.toggle('back-to-top--visible', currentScrollY > heroHeight);
    }, 500);
    
    lastScrollY = currentScrollY;
  });
  
  // Back to top button click handler
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Flashcard handlers
  flashcardBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      const flashcard = flashcards[index];
      if (flashcard) {
        flashcard.classList.add('flashcard--open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when flashcard is open
      }
    });
  });
  
  flashcardCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const flashcard = btn.closest('.flashcard');
      if (flashcard) {
        flashcard.classList.remove('flashcard--open');
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    });
  });
  
  // Close flashcard when clicking outside content
  flashcards.forEach(flashcard => {
    flashcard.addEventListener('click', e => {
      if (e.target === flashcard) {
        flashcard.classList.remove('flashcard--open');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Hero animation
  const animateHero = () => {
    const heroContent = document.querySelector('.hero__intro');
    const heroBgHexagons = document.querySelector('.hero__bg-hexagons');
    
    if (heroContent && heroBgHexagons) {
      // Animate background hexagons falling into place
      heroBgHexagons.classList.add('animate-fade-in');
      
      // Animate hero content with delay
      setTimeout(() => {
        Array.from(heroContent.children).forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('animate-slide-in-up');
          }, index * 200); // Stagger animation for each element
        });
      }, 500);
      
      // Start falling hexagons animation
      createFallingHexagons();
    }
  };
  
  // Create falling hexagons
  const createFallingHexagons = () => {
    const fallingHexagonsContainer = document.querySelector('.hero__falling-hexagons');
    
    if (fallingHexagonsContainer && heroSection) {
      const heroWidth = heroSection.offsetWidth;
      const numHexagons = Math.floor(heroWidth / 100); // Approximate number based on width
      
      for (let i = 0; i < numHexagons; i++) {
        const hexagon = document.createElement('div');
        hexagon.classList.add('falling-hexagon');
        
        // Random position, size, and animation duration
        const size = Math.floor(Math.random() * 30) + 20; // 20-50px
        const left = Math.floor(Math.random() * heroWidth);
        const delay = Math.floor(Math.random() * 10);
        const duration = Math.floor(Math.random() * 10) + 10; // 10-20s
        
        Object.assign(hexagon.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}px`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`
        });
        
        fallingHexagonsContainer.appendChild(hexagon);
      }
    }
  };
  
  // Initialize hero animation if on home page
  if (document.body.classList.contains('home')) {
    animateHero();
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    heroHeight = heroSection ? heroSection.offsetHeight : 0;
  });
  
  // Hex object tilt effect
  const workCards = document.querySelectorAll('.work-card');
  
  workCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const cardRect = card.getBoundingClientRect();
      const cardMedia = card.querySelector('.work-card__media');
      
      if (cardMedia) {
        // Calculate mouse position relative to card
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;
        
        // Calculate tilt values (max 10 degrees)
        const tiltX = (y / cardRect.height - 0.5) * 10;
        const tiltY = (0.5 - x / cardRect.width) * 10;
        
        // Apply tilt
        cardMedia.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      const cardMedia = card.querySelector('.work-card__media');
      if (cardMedia) {
        // Reset tilt
        cardMedia.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      }
    });
  });
}); 