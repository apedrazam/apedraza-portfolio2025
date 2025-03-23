/**
 * Falling Hexagons Background Animation
 * Creates a continuous background of slowly falling hexagons
 * Optimized for performance
 */

document.addEventListener('DOMContentLoaded', function() {
  // Find the hero section
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;
  
  // Create or find the hero-bg element
  let heroBg = heroSection.querySelector('.hero-bg');
  if (!heroBg) {
    heroBg = document.createElement('div');
    heroBg.className = 'hero-bg';
    heroSection.insertBefore(heroBg, heroSection.firstChild);
  }
  
  // Remove any existing container
  const existingContainer = document.getElementById('falling-hex-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create container for falling hexagons
  const fallingHexContainer = document.createElement('div');
  fallingHexContainer.className = 'falling-hex-container';
  fallingHexContainer.id = 'falling-hex-container';
  heroBg.appendChild(fallingHexContainer);
  
  // Get hero section dimensions
  const heroWidth = heroSection.offsetWidth;
  
  // Fixed number of hexagons for better performance
  const hexCount = 18;
  
  // Divide the horizontal space into zones to prevent clustering
  const zoneWidth = heroWidth / hexCount;
  
  // SVG template - create once and clone for better performance
  const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgTemplate.setAttribute('viewBox', '0 0 50 56');
  svgTemplate.setAttribute('fill', 'none');
  
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', 'M2.75129 15.1547L25 2.3094L47.2487 15.1547V40.8453L25 53.6906L2.75129 40.8453V15.1547Z');
  pathElement.setAttribute('stroke', '#25385C');
  pathElement.setAttribute('stroke-width', '4');
  svgTemplate.appendChild(pathElement);
  
  // Create all hexagons but keep them hidden initially
  const hexagons = [];
  const fragment = document.createDocumentFragment(); // Use fragment for better performance
  
  for (let i = 0; i < hexCount; i++) {
    // Calculate horizontal position based on zone with slight randomness
    const zoneStart = i * zoneWidth;
    const horizontalOffset = Math.random() * (zoneWidth * 0.7);
    const horizontalPosition = zoneStart + horizontalOffset + (zoneWidth * 0.15);
    
    // Random starting point above viewport
    const verticalPosition = -180 - (Math.random() * 100);
    
    // Create a hexagon element
    const hex = document.createElement('div');
    hex.className = 'falling-hex hidden-hex';
    
    // Clone the SVG template instead of creating new markup
    const svgClone = svgTemplate.cloneNode(true);
    hex.appendChild(svgClone);
    
    // Position the hexagon
    hex.style.left = `${horizontalPosition}px`;
    hex.style.top = `${verticalPosition}px`;
    
    // Store the hexagon
    hexagons.push(hex);
    fragment.appendChild(hex);
  }
  
  // Add all hexagons to DOM at once (better for performance)
  fallingHexContainer.appendChild(fragment);
  
  // Staggered activation with broader time distribution
  // Create a single array of timings to avoid setTimeout overhead
  const activationTimes = [];
  
  // Generate random activation times (2-25 seconds)
  for (let i = 0; i < hexCount; i++) {
    const delay = 2000 + Math.random() * 23000; // 2-25 second range
    activationTimes.push({ index: i, delay: delay });
  }
  
  // Sort by delay time for more efficient processing
  activationTimes.sort((a, b) => a.delay - b.delay);
  
  // Use a single timeout and track elapsed time for better performance
  let startTime = null;
  let animationFrameId = null;
  
  // Animation loop - handles all hexagon activations in a single loop
  function animateHexagons(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    
    // Process any hexagons that should be activated by now
    while (activationTimes.length > 0 && activationTimes[0].delay <= elapsed) {
      const hexData = activationTimes.shift();
      const hex = hexagons[hexData.index];
      
      // Add animation with varied durations (15-30 seconds)
      const duration = 15 + Math.random() * 15;
      hex.style.animationDuration = `${duration}s`;
      
      // Varied delay creates natural non-looping appearance
      hex.style.animationDelay = `${Math.random() * -15}s`;
      
      // Make visible and start animation
      hex.classList.remove('hidden-hex');
      hex.classList.add('animated-hex');
    }
    
    // Continue the loop if we have more hexagons to activate
    if (activationTimes.length > 0) {
      animationFrameId = requestAnimationFrame(animateHexagons);
    }
  }
  
  // Start the animation loop after a short delay
  setTimeout(() => {
    animationFrameId = requestAnimationFrame(animateHexagons);
  }, 300);
  
  // Clean up on page leave/hide to prevent memory leaks
  document.addEventListener('visibilitychange', function() {
    if (document.hidden && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    } else if (!document.hidden && !animationFrameId && activationTimes.length > 0) {
      startTime = null;
      animationFrameId = requestAnimationFrame(animateHexagons);
    }
  });
  
  // Improved resize handler - repositions hexagons without restarting animation
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Get new width
      const newWidth = heroSection.offsetWidth;
      
      // Only take action if width changed significantly (>10%)
      if (Math.abs(newWidth - heroWidth) / heroWidth > 0.1) {
        // Calculate ideal number of hexagons for new width
        // Use same density formula as initial setup
        const idealHexCount = Math.ceil(newWidth / (heroWidth / hexCount));
        
        // If screen got wider, we need to add more hexagons
        if (newWidth > heroWidth && idealHexCount > hexCount) {
          const additionalHexagons = idealHexCount - hexCount;
          
          // Create document fragment for batch insertion
          const newFragment = document.createDocumentFragment();
          
          // Calculate new zone width based on ideal count
          const newZoneWidth = newWidth / idealHexCount;
          
          // Create new hexagons to fill the expanded space
          for (let i = 0; i < additionalHexagons; i++) {
            // Position in new zones (starting from where existing hexagons end)
            const zoneIndex = hexCount + i;
            const zoneStart = zoneIndex * newZoneWidth;
            const horizontalOffset = Math.random() * (newZoneWidth * 0.7);
            const horizontalPosition = zoneStart + horizontalOffset + (newZoneWidth * 0.15);
            
            // Random starting point above viewport
            const verticalPosition = -180 - (Math.random() * 100);
            
            // Create a hexagon element
            const hex = document.createElement('div');
            
            // Start it in animated state since others are already animated
            hex.className = 'falling-hex animated-hex';
            
            // Clone the SVG template
            const svgClone = svgTemplate.cloneNode(true);
            hex.appendChild(svgClone);
            
            // Position the hexagon
            hex.style.left = `${horizontalPosition}px`;
            hex.style.top = `${verticalPosition}px`;
            
            // Add animation with varied durations (15-30 seconds)
            const duration = 15 + Math.random() * 15;
            hex.style.animationDuration = `${duration}s`;
            
            // Set random animation progress to blend with existing hexagons
            hex.style.animationDelay = `${Math.random() * -15}s`;
            
            // Add to fragment and track
            newFragment.appendChild(hex);
            hexagons.push(hex);
          }
          
          // Add all new hexagons at once
          fallingHexContainer.appendChild(newFragment);
          
          // Update hexagon count
          hexCount = idealHexCount;
        }
        
        // Reposition ALL hexagons horizontally based on new zone width
        const repositionZoneWidth = newWidth / hexCount;
        
        hexagons.forEach((hex, index) => {
          // Calculate new horizontal position
          const zoneStart = index * repositionZoneWidth;
          const horizontalOffset = Math.random() * (repositionZoneWidth * 0.7);
          const horizontalPosition = zoneStart + horizontalOffset + (repositionZoneWidth * 0.15);
          
          // Update only the left position, preserving animation state
          hex.style.left = `${horizontalPosition}px`;
        });
      }
    }, 200);
  });
}); 