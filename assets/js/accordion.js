/**
 * Independent expandable blocks functionality
 * 
 * This script is completely independent and attaches event handlers directly to 
 * case study expandable blocks regardless of load order
 */

(function() {
  console.log('[Expandable] Script loaded');
  
  function initializeExpandableBlocks() {
    console.log('[Expandable] Initializing expandable blocks');
    const blocks = document.querySelectorAll('.case-study__highlight-section');
    
    if (!blocks || blocks.length === 0) {
      console.log('[Expandable] No expandable blocks found on page');
      return;
    }
    
    console.log(`[Expandable] Found ${blocks.length} expandable blocks to initialize`);
    
    // For each expandable block header, attach click listener directly
    blocks.forEach((block, blockIndex) => {
      const header = block.querySelector('.case-study__highlight-section-header');
      const content = block.querySelector('.case-study__highlight-section-content');
      
      if (!header || !content) {
        console.log(`[Expandable] Incomplete block at index ${blockIndex}`);
        return;
      }
      
      // Ensure we remove any existing listeners (in case this runs multiple times)
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);
      
      // Add click event to the new header
      newHeader.addEventListener('click', function(e) {
        console.log(`[Expandable] Header clicked for block ${blockIndex}`);
        e.preventDefault();
        
        const section = this.parentElement;
        const isOpen = section.classList.contains('isOpen');
        
        // Toggle current section independently
        if (isOpen) {
          // Close this section
          section.classList.remove('active');
          section.classList.remove('isOpen'); // Remove isOpen class too
          content.style.opacity = '0';
          content.style.maxHeight = '0';
          
          // Set display:none after transition completes
          setTimeout(() => {
            content.style.display = 'none';
          }, 300);
          
          // Change the expand button as needed
          const expandBtn = section.querySelector('.cs-highlight-expand');
          if (expandBtn) {
            expandBtn.querySelector('i').classList.remove('fa-minus');
            expandBtn.querySelector('i').classList.add('fa-plus');
          }
        } else {
          // Open this section
          section.classList.add('active');
          section.classList.add('isOpen'); // Add isOpen class
          content.style.display = 'block';
          
          // Force a reflow before transitioning
          void content.offsetWidth;
          
          content.style.opacity = '1';
          content.style.maxHeight = content.scrollHeight + 'px';
          
          // Change the expand button as needed
          const expandBtn = section.querySelector('.cs-highlight-expand');
          if (expandBtn) {
            expandBtn.querySelector('i').classList.remove('fa-plus');
            expandBtn.querySelector('i').classList.add('fa-minus');
          }
        }
      });
      
      // All sections start closed (no default opening)
    });
  }
  
  // Run initialization in multiple ways to ensure it happens
  
  // Method 1: Immediate execution if DOM is ready
  if (document.readyState !== 'loading') {
    console.log('[Expandable] Document already loaded, initializing immediately');
    initializeExpandableBlocks();
  } else {
    // Method 2: DOMContentLoaded event
    console.log('[Expandable] Waiting for DOMContentLoaded event');
    document.addEventListener('DOMContentLoaded', initializeExpandableBlocks);
  }
  
  // Method 3: Window load event as fallback
  window.addEventListener('load', function() {
    console.log('[Expandable] Window load event fired, re-initializing');
    initializeExpandableBlocks();
  });
  
  // Method 4: Direct setTimeout as another fallback
  setTimeout(initializeExpandableBlocks, 1000);
})();

/**
 * INLINE SCRIPT VERSION
 * 
 * This is a standalone version that can be copied directly into HTML files
 * as an inline script if needed
 */

/* 
<script>
// Case Study Expandable blocks initialization
(function() {
  function initExpandableBlocks() {
    const blocks = document.querySelectorAll('.case-study__highlight-section');
    if (!blocks || blocks.length === 0) return;
    
    // For each block, attach click listener
    blocks.forEach((block, i) => {
      const header = block.querySelector('.case-study__highlight-section-header');
      const content = block.querySelector('.case-study__highlight-section-content');
      if (!header || !content) return;
      
      // Add click event
      header.addEventListener('click', function() {
        const section = this.parentElement;
        const isOpen = section.classList.contains('isOpen');
        
        // Toggle current section independently
        if (isOpen) {
          // Close this section
          section.classList.remove('active');
          section.classList.remove('isOpen');
          content.style.opacity = '0';
          content.style.maxHeight = '0';
          
          // Set display:none after transition completes
          setTimeout(() => {
            content.style.display = 'none';
          }, 300);
          
          // Change the expand button
          const expandBtn = section.querySelector('.cs-highlight-expand');
          if (expandBtn) {
            expandBtn.querySelector('i').classList.remove('fa-minus');
            expandBtn.querySelector('i').classList.add('fa-plus');
          }
        } else {
          // Open this section
          section.classList.add('active');
          section.classList.add('isOpen');
          content.style.display = 'block';
          void content.offsetWidth;
          content.style.opacity = '1';
          content.style.maxHeight = content.scrollHeight + 'px';
          
          // Change the expand button
          const expandBtn = section.querySelector('.cs-highlight-expand');
          if (expandBtn) {
            expandBtn.querySelector('i').classList.remove('fa-plus');
            expandBtn.querySelector('i').classList.add('fa-minus');
          }
        }
      });
    });
  }
  
  // Run in multiple ways to ensure it happens
  if (document.readyState !== 'loading') {
    initExpandableBlocks();
  } else {
    document.addEventListener('DOMContentLoaded', initExpandableBlocks);
  }
  window.addEventListener('load', initExpandableBlocks);
  setTimeout(initExpandableBlocks, 500);
})();
</script>
*/ 