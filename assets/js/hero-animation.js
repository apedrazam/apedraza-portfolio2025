/**
 * Hero Section Hexagon Animation
 * Animates hexagons falling into place when the page loads
 */

document.addEventListener('DOMContentLoaded', () => {
  const heroSvg = document.getElementById('hero-bg-svg');
  const elements = [
    { el: document.querySelector('.hero-title'), delay: 'delay-1' },
    { el: document.querySelector('.hero-paragraph'), delay: 'delay-2' },
    { el: document.querySelector('.hero-subtitle'), delay: 'delay-3' },
    { el: document.querySelector('.hero-cta-container'), delay: 'delay-4' }
  ];

  // Animate hero text elements
  function animateHeroText() {
    elements.forEach(({ el, delay }) => {
      if (el && !el.classList.contains('animate')) { // Only animate if not already done
        el.classList.add('animate', delay);
      }
    });
  }

  // Handle SVG load and initiate animation
  function initSvgAnimation() {
    const svgDoc = heroSvg.contentDocument;
    if (!svgDoc) return animateHeroText();

    const hexElements = svgDoc.querySelectorAll('.hex');
    if (!hexElements.length) return animateHeroText();

    const hexMap = Array.from(hexElements).reduce((map, hex) => {
      hex.style.transition = 'none';
      void hex.offsetWidth; // Force reflow without animation
      hex.originalTransform = hex.getAttribute('transform') || '';
      hex.hexNum = parseInt(hex.classList.value.match(/hex-(\d+)/)[1]);

      const fallDistance = hex.hexNum <= 7 ? 1800 :
                          hex.hexNum <= 14 ? 800 : 500 + Math.floor((hex.hexNum - 8) / 15) * 200;
      hex.fallDistance = fallDistance;
      hex.setAttribute('transform', `${hex.originalTransform} translate(0, -${fallDistance})`);
      map[hex.hexNum] = hex;
      return map;
    }, {});

    const groups = {
      finaleHexes: [1, 2, 4].map(num => hexMap[num]).filter(Boolean),
      firstHexes: [3, 5, 6, 7].map(num => hexMap[num]).filter(Boolean),
      rowGroups: [
        { nums: [...Array(7).keys()].map(i => i + 8), startDelay: 0.4, duration: 0.25 },
        { nums: [...Array(8).keys()].map(i => i + 15), startDelay: 0.5, duration: 0.2 },
        { nums: [...Array(16).keys()].map(i => i + 23), startDelay: 0.6, duration: 0.2 },
        { nums: [...Array(19).keys()].map(i => i + 39), startDelay: 0.7, duration: 0.2 },
        { nums: [...Array(20).keys()].map(i => i + 58), startDelay: 0.8, duration: 0.15 }
      ]
    };

    animateHexGroups(hexMap, groups);
  }

  // Animate hex group
  function animateHexGroups(hexMap, groups) {
    const baseDelay = 100;
    let animationEnd = baseDelay + 400;

    // Animate first hexes
    groups.firstHexes.forEach((hex, index) => {
      setTimeout(() => animateHex(hex, 0, 1.3), baseDelay + (index > 0 ? 100 + index * 100 : 0));
    });

    let currentOffset = animationEnd;
    groups.rowGroups.forEach((group, groupIndex) => {
      const rowDuration = 2200 * group.duration;
      const startTime = currentOffset + (groupIndex === 0 ? 100 : 0);
      currentOffset = startTime + (rowDuration * group.startDelay);

      const rowHexes = shuffle(group.nums).map(num => hexMap[num]).filter(Boolean);
      rowHexes.forEach((hex, index) => {
        const delay = startTime + Math.pow(index / (rowHexes.length - 1), 1.4) * rowDuration;
        setTimeout(() => animateHex(hex, groupIndex + 1), delay);
        if (groupIndex === 4 && index === rowHexes.length - 1) animationEnd = delay + 300;
      });
    });

    setTimeout(animateHeroText, animationEnd - 800);
    if (groups.finaleHexes.length) {
      const [hex1, hex2, hex4] = groups.finaleHexes;
      setTimeout(() => animateHex(hex1, 0, 1.3), animationEnd + 200);
      setTimeout(() => animateHex(hex2, 0, 1.3), animationEnd + 200 + getAnimationDuration(hex1) + 200);
      setTimeout(() => animateHex(hex4, 0, 1.3), animationEnd + 200 + getAnimationDuration(hex1) + 200 + getAnimationDuration(hex2) + 300);
    }
  }

  // Animate individual hex
  function animateHex(hex, rowNum = 0, slowdownFactor = 1) {
    const rowFactors = [1, 1, 0.85, 0.75, 0.7, 0.65];
    const rowSpeedFactor = rowFactors[Math.min(rowNum, 5)];
    const hexSpeedFactor = Math.max(0.7, 1 - (hex.hexNum / 20));
    const distanceFactor = Math.sqrt(hex.fallDistance / 1800);
    const duration = Math.max(0.15, (0.25 * hexSpeedFactor * rowSpeedFactor * slowdownFactor) / distanceFactor);

    hex.style.transition = `transform ${duration}s cubic-bezier(0.175, 0.885, 0.32, 1.075)`;
    hex.setAttribute('transform', hex.originalTransform);
  }

  // Get animation duration for hex
  function getAnimationDuration(hex) {
    const hexSpeedFactor = Math.max(0.7, 1 - (hex.hexNum / 20));
    const distanceFactor = Math.sqrt(hex.fallDistance / 1800);
    return Math.max(0.15, (0.25 * hexSpeedFactor) / distanceFactor) * 1000;
  }

  // Fisher-Yates shuffle
  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  // SVG load handling
  if (!heroSvg) {
    console.warn('Hero SVG not found, animating text immediately');
    animateHeroText();
    return;
  }

  heroSvg.addEventListener('load', initSvgAnimation);
  if (heroSvg.contentDocument?.readyState === 'complete') initSvgAnimation();

  // Fallbacks
  setTimeout(() => !heroSvg.contentDocument && animateHeroText(), 2000);
  setTimeout(() => !heroSvg.contentDocument && animateHeroText(), 3000);
});

// Fallback for cached page load
window.addEventListener('load', () => {
  if (!document.querySelector('.hero-title.animate')) {
    const delays = ['delay-1', 'delay-2', 'delay-3', 'delay-4'];
    document.querySelectorAll('.hero-title, .hero-paragraph, .hero-subtitle, .hero-cta-container').forEach((el, i) => {
      if (el && !el.classList.contains('animate')) el.classList.add('animate', delays[i]);
    });
  }
});
