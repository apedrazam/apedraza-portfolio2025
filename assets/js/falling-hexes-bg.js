/**
 * Falling Hexagons Background Animation
 * Optimized for performance and cleaner code structure
 */

document.addEventListener('DOMContentLoaded', function () {
  // Find the hero section and create or find the hero-bg element
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  let heroBg = heroSection.querySelector('.hero-bg');
  if (!heroBg) {
    heroBg = document.createElement('div');
    heroBg.className = 'hero-bg';
    heroSection.insertBefore(heroBg, heroSection.firstChild);
  }

  // Remove any existing container for falling hexagons
  const existingContainer = document.getElementById('falling-hex-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create and append the container for falling hexagons
  const fallingHexContainer = document.createElement('div');
  fallingHexContainer.className = 'falling-hex-container';
  fallingHexContainer.id = 'falling-hex-container';
  heroBg.appendChild(fallingHexContainer);

  // Get the width of the hero section and define the number of hexagons
  const heroWidth = heroSection.offsetWidth;
  const hexCount = 18;
  const zoneWidth = heroWidth / hexCount;

  // SVG Template for hexagon - Reused to improve performance
  const svgTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgTemplate.setAttribute('viewBox', '0 0 50 56');
  svgTemplate.setAttribute('fill', 'none');
  
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', 'M2.75129 15.1547L25 2.3094L47.2487 15.1547V40.8453L25 53.6906L2.75129 40.8453V15.1547Z');
  pathElement.setAttribute('stroke', '#25385C');
  pathElement.setAttribute('stroke-width', '4');
  svgTemplate.appendChild(pathElement);

  // Create hexagons and store them for later use
  const hexagons = [];
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < hexCount; i++) {
    const zoneStart = i * zoneWidth;
    const horizontalOffset = Math.random() * (zoneWidth * 0.7);
    const horizontalPosition = zoneStart + horizontalOffset + (zoneWidth * 0.15);
    const verticalPosition = -180 - (Math.random() * 100);

    const hex = document.createElement('div');
    hex.className = 'falling-hex hidden-hex';
    const svgClone = svgTemplate.cloneNode(true);
    hex.appendChild(svgClone);

    hex.style.left = `${horizontalPosition}px`;
    hex.style.top = `${verticalPosition}px`;

    hexagons.push(hex);
    fragment.appendChild(hex);
  }

  fallingHexContainer.appendChild(fragment);

  // Generate random activation times (2-25 seconds) for staggered animation
  const activationTimes = Array.from({ length: hexCount }, (_, i) => ({
    index: i,
    delay: 2000 + Math.random() * 23000,
  })).sort((a, b) => a.delay - b.delay);

  // Animation loop - activate hexagons when their time has come
  let startTime = null;
  let animationFrameId = null;

  function animateHexagons(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    while (activationTimes.length > 0 && activationTimes[0].delay <= elapsed) {
      const hexData = activationTimes.shift();
      const hex = hexagons[hexData.index];

      const duration = 15 + Math.random() * 15; // Random animation duration (15-30 seconds)
      hex.style.animationDuration = `${duration}s`;
      hex.style.animationDelay = `${Math.random() * -15}s`;

      hex.classList.remove('hidden-hex');
      hex.classList.add('animated-hex');
    }

    // Continue the animation loop if there are still hexagons to activate
    if (activationTimes.length > 0) {
      animationFrameId = requestAnimationFrame(animateHexagons);
    }
  }

  setTimeout(() => {
    animationFrameId = requestAnimationFrame(animateHexagons);
  }, 300);

  // Clean up on visibility change (pause animation when the page is hidden)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    } else if (!document.hidden && !animationFrameId && activationTimes.length > 0) {
      startTime = null;
      animationFrameId = requestAnimationFrame(animateHexagons);
    }
  });

  // Handle resizing of the window
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const newWidth = heroSection.offsetWidth;

      if (Math.abs(newWidth - heroWidth) / heroWidth > 0.1) {
        const idealHexCount = Math.ceil(newWidth / (heroWidth / hexCount));

        // Add more hexagons if the screen width increases
        if (newWidth > heroWidth && idealHexCount > hexCount) {
          const additionalHexagons = idealHexCount - hexCount;
          const newFragment = document.createDocumentFragment();
          const newZoneWidth = newWidth / idealHexCount;

          for (let i = 0; i < additionalHexagons; i++) {
            const zoneIndex = hexCount + i;
            const zoneStart = zoneIndex * newZoneWidth;
            const horizontalOffset = Math.random() * (newZoneWidth * 0.7);
            const horizontalPosition = zoneStart + horizontalOffset + (newZoneWidth * 0.15);
            const verticalPosition = -180 - (Math.random() * 100);

            const hex = document.createElement('div');
            hex.className = 'falling-hex animated-hex';
            const svgClone = svgTemplate.cloneNode(true);
            hex.appendChild(svgClone);

            hex.style.left = `${horizontalPosition}px`;
            hex.style.top = `${verticalPosition}px`;

            const duration = 15 + Math.random() * 15;
            hex.style.animationDuration = `${duration}s`;
            hex.style.animationDelay = `${Math.random() * -15}s`;

            newFragment.appendChild(hex);
            hexagons.push(hex);
          }

          fallingHexContainer.appendChild(newFragment);
          hexCount = idealHexCount;
        }

        // Reposition existing hexagons based on the new width
        const repositionZoneWidth = newWidth / hexCount;
        hexagons.forEach((hex, index) => {
          const zoneStart = index * repositionZoneWidth;
          const horizontalOffset = Math.random() * (repositionZoneWidth * 0.7);
          const horizontalPosition = zoneStart + horizontalOffset + (repositionZoneWidth * 0.15);
          hex.style.left = `${horizontalPosition}px`;
        });
      }
    }, 200);
  });
});