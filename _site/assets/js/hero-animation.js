/**
 * Hero Section Hexagon Animation
 * Animates hexagons falling into place when the page loads
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the hero SVG object
  const heroSvg = document.getElementById('hero-bg-svg');
  
  // Function to animate hero text elements
  function animateHeroText() {
    const heroTitle = document.querySelector('.hero-title');
    const heroParagraph = document.querySelector('.hero-paragraph');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta-container');
    
    // Add animation classes with cascading delays
    if (heroTitle) {
      heroTitle.classList.add('animate', 'delay-1');
    }
    
    if (heroParagraph) {
      heroParagraph.classList.add('animate', 'delay-2');
    }
    
    if (heroSubtitle) {
      heroSubtitle.classList.add('animate', 'delay-3');
    }
    
    if (heroCta) {
      heroCta.classList.add('animate', 'delay-4');
    }
  }

  // If no SVG is found, animate text immediately
  if (!heroSvg) {
    console.warn('Hero SVG not found, animating text elements immediately');
    animateHeroText();
    return;
  }
  
  // Wait for the SVG to load
  heroSvg.addEventListener('load', function() {
    const svgDoc = heroSvg.contentDocument;
    if (!svgDoc) {
      console.warn('SVG document not found, animating text elements immediately');
      animateHeroText();
      return;
    }
    
    const svg = svgDoc.querySelector('svg');
    if (!svg) {
      console.warn('SVG element not found, animating text elements immediately');
      animateHeroText();
      return;
    }
    
    // Find all .hex elements within the SVG
    const hexElements = svg.querySelectorAll('.hex');
    
    if (hexElements.length === 0) {
      console.warn('No hex elements found, animating text elements immediately');
      animateHeroText();
      return;
    }
    
    // Convert NodeList to Array for easier manipulation
    const hexArray = Array.from(hexElements);
    
    // Get hex numbers and prepare hexes for animation
    hexArray.forEach(hex => {
      // Store original transform if any
      hex.originalTransform = hex.getAttribute('transform') || '';
      
      // Get hex number from class
      const classNames = hex.getAttribute('class').split(' ');
      const hexNumClass = classNames.find(cls => cls.startsWith('hex-'));
      hex.hexNum = hexNumClass ? parseInt(hexNumClass.replace('hex-', '')) : 0;
      
      // Calculate the vertical position of this hex (higher numbers are typically lower in the SVG)
      // Increased fall distances for first 7 and first row
      let fallDistance;
      if (hex.hexNum <= 7) {
        fallDistance = 1800; // Increased from 500 for first 7 hexagons
      } else if (hex.hexNum >= 8 && hex.hexNum <= 14) {
        fallDistance = 800; // Increased from 500 for first row (8-14)
      } else {
        fallDistance = 500 + (Math.floor((hex.hexNum - 8) / 15) * 200);
      }
      
      // Store the fall distance for use in animation speed calculation
      hex.fallDistance = fallDistance;
      
      // Move hexes outside viewport (up) - add to existing transform if any
      hex.setAttribute('transform', `${hex.originalTransform} translate(0, -${fallDistance})`);
    });
    
    // Create a map for quick access by hex number
    const hexMap = {};
    hexArray.forEach(hex => {
      hexMap[hex.hexNum] = hex;
    });
    
    // Split hexagons into main sequence and delayed finale
    // These three will appear at the end - after everything else
    const delayedFinaleOrder = [1, 2, 4];
    const delayedFinaleHexes = delayedFinaleOrder.map(num => hexMap[num]).filter(Boolean);
    
    // The rest of the first seven, excluding the delayed ones 
    const firstSevenOrder = [3, 5, 6, 7];
    const firstSevenHexes = firstSevenOrder.map(num => hexMap[num]).filter(Boolean);
    
    // Define the five row groups as specified
    const row1 = Array.from({length: 7}, (_, i) => i + 8); // 8-14
    const row2 = Array.from({length: 8}, (_, i) => i + 15); // 15-22
    const row3 = Array.from({length: 16}, (_, i) => i + 23); // 23-38
    const row4 = Array.from({length: 19}, (_, i) => i + 39); // 39-57
    const row5 = Array.from({length: 20}, (_, i) => i + 58); // 58-77
    
    // Shuffle each pool thoroughly
    function shuffle(array) {
      return [...array].sort(() => Math.random() - 0.5);
    }
    
    // Create randomized row groups 
    const row1Elements = shuffle(row1).filter(num => hexMap[num]);
    const row2Elements = shuffle(row2).filter(num => hexMap[num]);
    const row3Elements = shuffle(row3).filter(num => hexMap[num]);
    const row4Elements = shuffle(row4).filter(num => hexMap[num]);
    const row5Elements = shuffle(row5).filter(num => hexMap[num]);
    
    // Animation sequence
    const baseDelay = 100; // Initial delay
    const totalAnimationDuration = 2200; // Fixed the space in the number
    
    // Animate the main sequence first (excluding 1, 2, 4)
    // First animate the specified 7 hexes in order - with long pauses between the first 3 "raindrops"
    firstSevenHexes.forEach((hex, index) => {
      let staggeredDelay;
      
      // Create pauses between hexagons
      if (index === 0) { // First hex (3)
        staggeredDelay = baseDelay;
      } else if (index === 1) { // Second hex (5)
        staggeredDelay = baseDelay + 100; // Long pause after first
      } else {
        // Remaining hexagons follow with regular timing
        staggeredDelay = baseDelay + 100 + ((index - 1) * 100);
      }
      
      setTimeout(() => animateHex(hex, 0, 1.3), staggeredDelay);
    });
    
    // Animate rows with accelerating timing
    function animateRowsSequentially() {
      // Calculate timing for the row groups
      const firstSevenDuration = 400; // Increased to account for longer pauses in first 7
      const remainingDuration = totalAnimationDuration - firstSevenDuration;
      
      // Row 1 takes up 25% of remaining time, starting after first seven
      const row1StartTime = firstSevenDuration + 100; // Small pause after first 7
      const row1Duration = remainingDuration * 0.25;
      
      // Row 2 takes up 20% of remaining time, starting at 60% through row 1
      const row2StartTime = row1StartTime + (row1Duration * 0.4);
      const row2Duration = remainingDuration * 0.20;
      
      // Row 3 takes up 20% of remaining time, starting at 60% through row 2
      const row3StartTime = row2StartTime + (row2Duration * 0.5);
      const row3Duration = remainingDuration * 0.20;
      
      // Row 4 takes up 20% of remaining time, starting at 60% through row 3
      const row4StartTime = row3StartTime + (row3Duration * 0.6);
      const row4Duration = remainingDuration * 0.20;
      
      // Row 5 takes up 15% of remaining time (accelerated), starting at 60% through row 4
      const row5StartTime = row4StartTime + (row4Duration * 0.7);
      const row5Duration = remainingDuration * 0.15;
      
      // Calculate when the entire animation should be complete
      const animationEndTime = row5StartTime + row5Duration;
      
      // Animate hero text elements between row animation and finale hexes
      setTimeout(() => {
        animateHeroText();
      }, animationEndTime - 1000); // Start slightly before the row animation ends
      
      // Animate the delayed finale hexagons (1, 2, 4) in sequence
      // Each hex will only start falling after the previous one has completed its animation
      
      // Calculate duration for each finale hex to determine timing
      function getAnimationDuration(hex) {
        // This needs to match the duration calculation in animateHex function
        const baseSpeed = 0.25;
        const hexSpeedFactor = Math.max(0.7, 1 - (hex.hexNum / 20));
        const standardFall = 1800;
        const distanceFactor = hex.fallDistance ? Math.sqrt(hex.fallDistance / standardFall) : 1;
        // Calculate animation duration (in milliseconds)
        return Math.max(0.15, (baseSpeed * hexSpeedFactor * 1.3) / distanceFactor) * 1000;
      }
      
      // Start the first hexagon 1 second after the main animation completes
      const hex1 = hexMap[1];
      const hex2 = hexMap[2];
      const hex4 = hexMap[4];
      
      // No need to check if these exist as they're important elements
      if (hex1 && hex2 && hex4) {
        // Calculate durations for each hexagon
        const duration1 = getAnimationDuration(hex1);
        const duration2 = getAnimationDuration(hex2);
        
        // Schedule the animations sequentially
        const hex1StartTime = animationEndTime + 200; // Start 1 second after main animation
        const hex2StartTime = hex1StartTime + duration1 + 200; // Start after hex1 finishes + 200ms pause
        const hex4StartTime = hex2StartTime + duration2 + 300; // Start after hex2 finishes + 200ms pause
        
        // Trigger each animation at the calculated time
        setTimeout(() => animateHex(hex1, 0, 1.3), hex1StartTime);
        setTimeout(() => animateHex(hex2, 0, 1.3), hex2StartTime);
        setTimeout(() => animateHex(hex4, 0, 1.3), hex4StartTime);
      }
      
      // Animate row 1
      row1Elements.forEach((hexNum, index) => {
        const hex = hexMap[hexNum];
        if (hex) {
          // Distribute animations with easing curve
          const progress = index / (row1Elements.length - 1); // 0 to 1
          const easedProgress = Math.pow(progress, 1.4); // Increased from 1.2 to 1.4 for steeper acceleration
          const hexDelay = row1StartTime + (easedProgress * row1Duration);
          setTimeout(() => animateHex(hex, 1), hexDelay);
        }
      });
      
      // Animate row 2
      row2Elements.forEach((hexNum, index) => {
        const hex = hexMap[hexNum];
        if (hex) {
          // Distribute animations with easing curve
          const progress = index / (row2Elements.length - 1); // 0 to 1
          const easedProgress = Math.pow(progress, 1.5); // Increased from 1.2 to 1.5
          const hexDelay = row2StartTime + (easedProgress * row2Duration);
          setTimeout(() => animateHex(hex, 2), hexDelay);
        }
      });
      
      // Animate row 3
      row3Elements.forEach((hexNum, index) => {
        const hex = hexMap[hexNum];
        if (hex) {
          // Distribute animations with easing curve
          const progress = index / (row3Elements.length - 1); // 0 to 1
          const easedProgress = Math.pow(progress, 1.7); // Increased from 1.3 to 1.7
          const hexDelay = row3StartTime + (easedProgress * row3Duration);
          setTimeout(() => animateHex(hex, 3), hexDelay);
        }
      });
      
      // Animate row 4
      row4Elements.forEach((hexNum, index) => {
        const hex = hexMap[hexNum];
        if (hex) {
          // Distribute animations with easing curve
          const progress = index / (row4Elements.length - 1); // 0 to 1
          const easedProgress = Math.pow(progress, 1.9); // Increased from 1.4 to 1.9
          const hexDelay = row4StartTime + (easedProgress * row4Duration);
          setTimeout(() => animateHex(hex, 4), hexDelay);
        }
      });
      
      // Animate row 5 with acceleration
      row5Elements.forEach((hexNum, index) => {
        const hex = hexMap[hexNum];
        if (hex) {
          // Use accelerating curve for row 5 (ease-in)
          const progress = index / (row5Elements.length - 1); // 0 to 1
          // Apply easing curve to progress (ease-in: accelerate toward the end)
          const easedProgress = Math.pow(progress, 2.2); // Increased from 1.5 to 2.2 for much steeper acceleration
          const hexDelay = row5StartTime + (easedProgress * row5Duration);
          setTimeout(() => animateHex(hex, 5), hexDelay);
        }
      });
    }
    
    // Start the sequential animation
    animateRowsSequentially();
  });
  
  // Add a timeout to ensure text elements appear even if SVG fails to load
  setTimeout(() => {
    if (!heroSvg.contentDocument) {
      console.warn('SVG failed to load, animating text elements');
      animateHeroText();
    }
  }, 2000);
  
  function animateHex(hex, rowNum = 0, slowdownFactor = 1) {
    // Calculate animation speed based on hex number and row
    // Higher numbers and later rows get faster animation
    const baseSpeed = 0.25; // Base duration
    
    // Apply row-based speed adjustment (accelerate as we go to later rows)
    let rowSpeedFactor = 1;
    if (rowNum === 2) rowSpeedFactor = 0.85; // Row 2 is 15% faster (changed from 10%)
    if (rowNum === 3) rowSpeedFactor = 0.75; // Row 3 is 25% faster (changed from 15%)
    if (rowNum === 4) rowSpeedFactor = 0.7; // Row 4 is 35% faster (changed from 20%)
    if (rowNum === 5) rowSpeedFactor = 0.65;  // Row 5 is 40% faster (changed from 30%)
    
    // Apply hex number-based speed adjustment (higher numbers = faster)
    const hexSpeedFactor = Math.max(0.7, 1 - (hex.hexNum / 20));
    
    // Apply distance-based speed adjustment - longer distances need faster animations
    // Base the normalization on a standard fall of 500px
    const standardFall = 1800;
    const distanceFactor = hex.fallDistance ? Math.sqrt(hex.fallDistance / standardFall) : 1;
    
    // Calculate final duration with a minimum and apply any slowdown factor
    // We divide by distanceFactor because larger distances need faster speeds (smaller durations)
    const duration = Math.max(0.15, (baseSpeed * hexSpeedFactor * rowSpeedFactor * slowdownFactor) / distanceFactor);
    
    // Use a physics-based easing curve that better simulates gravitational falling
    // This curve starts slow, accelerates naturally, and has a subtle bounce at the end
    // cubic-bezier(0.175, 0.885, 0.32, 1.075) - Enhanced gravity simulation with subtle settling
    hex.style.transition = `transform ${duration}s cubic-bezier(0.175, 0.885, 0.32, 1.075)`;
    
    // Animate to original position
    hex.setAttribute('transform', hex.originalTransform);
  }
}); 