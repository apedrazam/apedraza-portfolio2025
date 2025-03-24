/**
 * SVG Tilt Animation - Case Study Hexagons
 * Animated effect for hexagon SVG elements in case studies
 */

document.addEventListener('DOMContentLoaded', function() {
  // Find the work section
  const workSection = document.querySelector('.work-section');
  if (!workSection) {
    return;
  }
  
  // Target object elements with the case-study-bg class
  const caseStudyBgs = document.querySelectorAll('.case-study-bg');
  
  // Collect data for all SVGs
  const allSvgData = [];
  
  // Wait for all SVG objects to load
  caseStudyBgs.forEach((objElement, containerIndex) => {
    // For object elements, we need to wait for them to load
    if (objElement.contentDocument && objElement.contentDocument.readyState === 'complete') {
      // SVG is already loaded, process it immediately
      processSvgObject(objElement, containerIndex);
    } else {
      // SVG isn't loaded yet, add a load listener
      objElement.addEventListener('load', function() {
        processSvgObject(objElement, containerIndex);
      });
    }
  });
  
  function processSvgObject(objElement, containerIndex) {
    // Access the SVG document inside the object
    const svgDoc = objElement.contentDocument;
    if (!svgDoc) {
      return;
    }
    
    const svg = svgDoc.querySelector('svg');
    if (!svg) {
      return;
    }
    
    // Find all .hex elements within this SVG
    const hexElements = svg.querySelectorAll('.hex');
    
    if (hexElements.length === 0) return;
    
    // Store each hexagon with its properties
    const hexagons = [...hexElements].map((hex, i) => {
      return {
        element: hex,
        isGroup: hex.tagName.toLowerCase() === 'g',
        index: i,
        // Store original transform if any
        originalTransform: hex.getAttribute('transform') || '',
        // Depth based on position in DOM - later elements are visually on top
        depth: i / (hexElements.length - 1)
      };
    });
    
    // Find the parent card element that contains both image and content
    let cardElement = objElement.closest('.case-study-card');
    if (!cardElement) {
      return;
    }
    
    // Add smooth transition style to all hex elements for animations
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
    
    // If all SVGs are loaded, set up the work section tracking
    if (allSvgData.length === caseStudyBgs.length) {
      setupWorkSectionTracking();
    }
  }
  
  function setupWorkSectionTracking() {
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
    // Process each SVG
    allSvgData.forEach(data => {
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
          data.card.querySelector('.case-study-mockup').style.transform = 'scale(1.04)';
          // Also scale video if present
          const video = data.card.querySelector('.case-study-video');
          if (video) {
            video.style.transform = 'scale(1.04)';
          }
        } else {
          data.card.querySelector('.case-study-mockup').style.transform = '';
          // Reset video scale if present
          const video = data.card.querySelector('.case-study-video');
          if (video) {
            video.style.transform = '';
          }
        }
      }
    });
  }
  
  function resetAllHexagons() {
    allSvgData.forEach(data => {
      data.hexagons.forEach(hex => {
        // Add transition for smooth return
        hex.element.style.transition = 'transform 0.4s ease-out';
        
        // Reset to original transform
        hex.element.setAttribute('transform', hex.originalTransform);
      });
      
      // Reset card scale
      data.card.querySelector('.case-study-mockup').style.transform = '';
      
      // Reset video scale if present
      const video = data.card.querySelector('.case-study-video');
      if (video) {
        video.style.transform = '';
      }
    });
  }
}); 