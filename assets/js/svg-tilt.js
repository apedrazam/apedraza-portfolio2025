/**
 * SVG Tilt Animation - Case Study Hexagons
 * Animated effect for hexagon SVG elements in case studies
 */

// Store SVG data globally
let allSvgData = [];
let isInitialized = false;
let retryCount = 0;
const MAX_RETRIES = 5;

function initializeSvgTilt() {
  console.log('Initializing SVG tilt...');
  
  // Find the work section
  const workSection = document.querySelector('.work-section');
  if (!workSection) {
    console.warn('Work section not found, will retry when available');
    scheduleRetry();
    return;
  }
  console.log('Found work section');
  
  // Target object elements with the case-study-bg class
  const caseStudyBgs = document.querySelectorAll('.case-study-bg');
  console.log(`Found ${caseStudyBgs.length} case study backgrounds`);
  
  if (caseStudyBgs.length === 0) {
    console.warn('No case study backgrounds found, will retry when available');
    scheduleRetry();
    return;
  }
  
  // Process any existing SVGs
  caseStudyBgs.forEach((objElement, containerIndex) => {
    console.log(`Processing SVG ${containerIndex + 1} of ${caseStudyBgs.length}`);
    processSvgObject(objElement, containerIndex);
  });
  
  // Set up observer for dynamically added SVGs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.classList && node.classList.contains('case-study-bg')) {
          console.log('New case-study-bg element detected');
          processSvgObject(node, allSvgData.length);
        }
      });
    });
  });
  
  // Start observing the work section for new SVGs
  observer.observe(workSection, {
    childList: true,
    subtree: true
  });
  console.log('Set up MutationObserver for new SVGs');
  
  // Set up work section tracking
  setupWorkSectionTracking(workSection);
  
  isInitialized = true;
  console.log('SVG tilt initialization complete');
}

function scheduleRetry() {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    console.log(`Scheduling retry ${retryCount} of ${MAX_RETRIES} in 500ms`);
    setTimeout(initializeSvgTilt, 500);
  }
}

function processSvgObject(objElement, containerIndex) {
  console.log(`Processing SVG object ${containerIndex}`);
  
  // Skip if already processed
  if (allSvgData.some(data => data.object === objElement)) {
    console.log('SVG already processed, skipping');
    return;
  }
  
  try {
    // For object elements, we need to wait for them to load
    if (objElement.contentDocument && 
        objElement.contentDocument.readyState === 'complete' && 
        objElement.contentDocument.querySelector('svg')) {
      console.log('SVG already loaded, processing immediately');
      processLoadedSvg(objElement, containerIndex);
    } else {
      console.log('Waiting for SVG to load...');
      
      // Safari and some browsers may not trigger load properly
      // Add multiple ways to detect when the SVG is ready
      
      // 1. Traditional load event listener
      objElement.addEventListener('load', function() {
        console.log('SVG load event fired');
        processLoadedSvg(objElement, containerIndex);
      });
      
      // 2. Also check with a timeout (for Safari)
      setTimeout(function() {
        try {
          if (!allSvgData.some(data => data.object === objElement) && 
              objElement.contentDocument && 
              objElement.contentDocument.querySelector('svg')) {
            console.log('SVG found after timeout');
            processLoadedSvg(objElement, containerIndex);
          }
        } catch (e) {
          console.error('Error checking SVG on timeout:', e);
        }
      }, 1000);
    }
  } catch (e) {
    console.error('Error in processSvgObject:', e);
  }
}

function processLoadedSvg(objElement, containerIndex) {
  console.log(`Processing loaded SVG ${containerIndex}`);
  
  try {
    // Skip if already processed
    if (allSvgData.some(data => data.object === objElement)) {
      console.log('SVG already processed in another call, skipping');
      return;
    }
    
    // Access the SVG document inside the object
    const svgDoc = objElement.contentDocument;
    if (!svgDoc) {
      console.error('SVG document not found for object element');
      return;
    }
    
    const svg = svgDoc.querySelector('svg');
    if (!svg) {
      console.error('SVG element not found in document');
      return;
    }
    
    // Find all .hex elements within this SVG
    const hexElements = svg.querySelectorAll('.hex');
    console.log(`Found ${hexElements.length} hex elements`);
    
    if (hexElements.length === 0) {
      console.error('No hex elements found in SVG');
      return;
    }
    
    // Store each hexagon with its properties
    const hexagons = [...hexElements].map((hex, i) => {
      return {
        element: hex,
        isGroup: hex.tagName.toLowerCase() === 'g',
        index: i,
        originalTransform: hex.getAttribute('transform') || '',
        depth: i / (hexElements.length - 1)
      };
    });
    
    // Find the parent card element
    let cardElement = objElement.closest('.case-study-card');
    if (!cardElement) {
      console.error('Parent card element not found for SVG');
      return;
    }
    
    // Add smooth transition style to all hex elements
    hexagons.forEach(hex => {
      hex.element.style.transition = 'transform 0.3s ease-out';
    });
    
    // Store this SVG's data
    allSvgData.push({
      svg: svg,
      hexagons: hexagons,
      card: cardElement,
      object: objElement
    });
    
    console.log(`Successfully processed SVG ${containerIndex}`);
  } catch (error) {
    console.error(`Error processing SVG ${containerIndex}:`, error);
  }
}

function setupWorkSectionTracking(workSection) {
  if (!workSection) {
    workSection = document.querySelector('.work-section');
    if (!workSection) {
      console.error('Work section not found for tracking');
      return;
    }
  }
  
  console.log('Setting up mouse tracking for work section');
  
  // Add event listener to the work section for mouse movement
  workSection.addEventListener('mousemove', handleMouseMove);
  
  // Add event listener to the document to reset when mouse leaves work section
  document.addEventListener('mousemove', function(e) {
    const rect = workSection.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || 
        e.clientY < rect.top || e.clientY > rect.bottom) {
      resetAllHexagons();
    }
  });
}

function handleMouseMove(e) {
  // Don't do anything if we don't have SVGs
  if (allSvgData.length === 0) return;

  // Process each SVG
  allSvgData.forEach(data => {
    try {
      // Get the card's bounding rect
      const cardRect = data.card.getBoundingClientRect();
      
      // Get object rect for center calculation
      const objRect = data.object.getBoundingClientRect();
      const centerX = objRect.left + objRect.width / 2;
      const centerY = objRect.top + objRect.height / 2;
      
      // Calculate the mouse position relative to the center
      const mouseX = (e.clientX - centerX) / (cardRect.width / 2); // -1 to 1 range
      const mouseY = (e.clientY - centerY) / (cardRect.height / 2); // -1 to 1 range
      
      // Calculate influence based on distance from center
      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const maxInfluence = 3; // Maximum radius of influence (in normalized units)
      const influenceFactor = Math.max(0, 1 - (distance / maxInfluence));
      
      // Only apply effect if there's any influence
      if (influenceFactor > 0) {
        // Calculate effective tilt
        const tiltX = mouseX * influenceFactor;
        const tiltY = mouseY * influenceFactor;
        
        // Apply to all hexagons
        data.hexagons.forEach(hex => {
          // Remove transition for responsive movement
          hex.element.style.transition = 'none';
          
          // Calculate transform based on depth
          const groupFactor = hex.isGroup ? 0.6 : 1.0;
          const depthFactor = 0.5 + (1.5 * hex.depth * groupFactor);
          
          // Calculate pixel displacement (max 12px)
          const translateX = tiltX * depthFactor * 12;
          const translateY = tiltY * depthFactor * 12;
          
          // Apply transform
          const newTransform = `${hex.originalTransform} translate(${translateX}, ${translateY})`;
          hex.element.setAttribute('transform', newTransform);
        });
        
        // Scale up card when hovering directly over it
        if (e.clientX >= cardRect.left && e.clientX <= cardRect.right && 
            e.clientY >= cardRect.top && e.clientY <= cardRect.bottom) {
          const mockup = data.card.querySelector('.case-study-mockup');
          if (mockup) mockup.style.transform = 'scale(1.04)';
          
          // Also scale video if present
          const video = data.card.querySelector('.case-study-video');
          if (video) video.style.transform = 'scale(1.04)';
        } else {
          const mockup = data.card.querySelector('.case-study-mockup');
          if (mockup) mockup.style.transform = '';
          
          // Reset video scale if present
          const video = data.card.querySelector('.case-study-video');
          if (video) video.style.transform = '';
        }
      }
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  });
}

function resetAllHexagons() {
  allSvgData.forEach(data => {
    try {
      data.hexagons.forEach(hex => {
        // Add transition for smooth return
        hex.element.style.transition = 'transform 0.4s ease-out';
        
        // Reset to original transform
        hex.element.setAttribute('transform', hex.originalTransform);
      });
      
      // Reset card scale
      const mockup = data.card.querySelector('.case-study-mockup');
      if (mockup) mockup.style.transform = '';
      
      // Reset video scale if present
      const video = data.card.querySelector('.case-study-video');
      if (video) video.style.transform = '';
    } catch (error) {
      console.error('Error in resetAllHexagons:', error);
    }
  });
}

// Initialize when DOM is ready
console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
  initializeSvgTilt();
});

// Also try to initialize immediately in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('Document already loaded, initializing immediately');
  initializeSvgTilt();
}

// Add a final fallback to retry after a delay when all resources are loaded
window.addEventListener('load', () => {
  console.log('Window load event fired');
  if (allSvgData.length === 0) {
    console.log('No SVGs processed yet, retrying after window load');
    setTimeout(initializeSvgTilt, 1000);
  }
}); 