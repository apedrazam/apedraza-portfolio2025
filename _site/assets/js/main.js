document.addEventListener('DOMContentLoaded', function() {
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
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update icon
    if (theme === 'dark') {
      themeToggleIcon.classList.remove('fa-moon');
      themeToggleIcon.classList.add('fa-sun');
    } else {
      themeToggleIcon.classList.remove('fa-sun');
      themeToggleIcon.classList.add('fa-moon');
    }
  }
  
  // Initialize theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  // Theme toggle click handler
  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  });
  
  // Scroll handler for sticky header and back to top button
  window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    
    // Show/hide header after hero section
    if (currentScrollY > heroHeight) {
      header.classList.add('header--visible');
      
      // Show back to top with delay
      setTimeout(() => {
        backToTop.classList.add('back-to-top--visible');
      }, 500);
    } else {
      header.classList.remove('header--visible');
      backToTop.classList.remove('back-to-top--visible');
    }
    
    lastScrollY = currentScrollY;
  });
  
  // Back to top button click handler
  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Flashcard handlers
  flashcardBtns.forEach((btn, index) => {
    btn.addEventListener('click', function() {
      const flashcard = flashcards[index];
      if (flashcard) {
        flashcard.classList.add('flashcard--open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when flashcard is open
      }
    });
  });
  
  flashcardCloseBtns.forEach((btn) => {
    btn.addEventListener('click', function() {
      const flashcard = btn.closest('.flashcard');
      if (flashcard) {
        flashcard.classList.remove('flashcard--open');
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    });
  });
  
  // Close flashcard when clicking outside content
  flashcards.forEach((flashcard) => {
    flashcard.addEventListener('click', function(e) {
      if (e.target === flashcard) {
        flashcard.classList.remove('flashcard--open');
        document.body.style.overflow = '';
      }
    });
  });
  
  // Hero animation
  function animateHero() {
    const heroContent = document.querySelector('.hero__intro');
    const heroBgHexagons = document.querySelector('.hero__bg-hexagons');
    
    if (heroContent && heroBgHexagons) {
      // Animate background hexagons falling into place
      heroBgHexagons.classList.add('animate-fade-in');
      
      // Animate hero content with delay
      setTimeout(() => {
        const heroElements = heroContent.children;
        Array.from(heroElements).forEach((element, index) => {
          setTimeout(() => {
            element.classList.add('animate-slide-in-up');
          }, index * 200); // Stagger animation for each element
        });
      }, 500);
      
      // Start falling hexagons animation
      createFallingHexagons();
    }
  }
  
  // Create falling hexagons
  function createFallingHexagons() {
    const fallingHexagonsContainer = document.querySelector('.hero__falling-hexagons');
    
    if (fallingHexagonsContainer) {
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
        
        hexagon.style.width = `${size}px`;
        hexagon.style.height = `${size}px`;
        hexagon.style.left = `${left}px`;
        hexagon.style.animationDelay = `${delay}s`;
        hexagon.style.animationDuration = `${duration}s`;
        
        fallingHexagonsContainer.appendChild(hexagon);
      }
    }
  }
  
  // Initialize hero animation
  animateHero();
  
  // Handle window resize
  window.addEventListener('resize', function() {
    heroHeight = heroSection ? heroSection.offsetHeight : 0;
  });
  
  // Hex object tilt effect
  const workCards = document.querySelectorAll('.work-card');
  
  workCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
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
    
    card.addEventListener('mouseleave', function() {
      const cardMedia = card.querySelector('.work-card__media');
      if (cardMedia) {
        // Reset tilt
        cardMedia.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      }
    });
  });
}); 