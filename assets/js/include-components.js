// Function to include HTML components
async function includeComponent(elementId, componentPath) {
  // Check if element exists
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found in the document!`);
    return;
  }
  
  try {
    // Use XMLHttpRequest for component loading
    const xhr = new XMLHttpRequest();
    xhr.open('GET', componentPath, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          element.innerHTML = xhr.responseText;
          
          // Execute any script tags from the loaded HTML
          const scripts = element.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            const script = document.createElement('script');
            script.text = scripts[i].text;
            
            // Copy attributes (if any)
            for (let j = 0; j < scripts[i].attributes.length; j++) {
              const attr = scripts[i].attributes[j];
              script.setAttribute(attr.name, attr.value);
            }
            
            // Replace the original script tag with our new one
            scripts[i].parentNode.replaceChild(script, scripts[i]);
          }
        } else {
          console.error(`Error loading component: ${componentPath}`, xhr.status);
          element.innerHTML = `<div class="error-message">Error loading component: HTTP ${xhr.status}</div>`;
        }
      }
    };
    xhr.send(null);
  } catch (error) {
    console.error(`Error loading component: ${componentPath}`, error);
    element.innerHTML = `<div class="error-message">Error loading component: ${error.message}</div>`;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Include header component if it exists in the document
  if (document.getElementById('header-component')) {
    includeComponent('header-component', '/assets/components/header.html');
  } else {
    console.error('Header component element NOT FOUND in document!');
  }
  
  // Include footer component if it exists in the document
  if (document.getElementById('footer-component')) {
    includeComponent('footer-component', '/assets/components/footer.html');
  } else {
    console.error('Footer component element NOT FOUND in document!');
  }
  
  // Include scroll-to-top component if it exists in the document
  if (document.getElementById('scroll-to-top-component')) {
    includeComponent('scroll-to-top-component', '/assets/components/scroll-to-top.html');
  } else {
    console.error('Scroll-to-top component element NOT FOUND in document!');
  }

  // Include case study navigation component if it exists in the document
  if (document.getElementById('case-study-nav-component')) {
    includeComponent('case-study-nav-component', '/assets/components/case-study-nav.html');
  }
});

// Initialize components immediately and on DOMContentLoaded
function initializeComponents() {
  // Load header component
  if (document.getElementById('header-component')) {
    includeComponent('header-component', '/assets/components/header.html');
  } else {
    console.error('Header component element NOT FOUND in document!');
  }
  
  // Load footer component
  if (document.getElementById('footer-component')) {
    includeComponent('footer-component', '/assets/components/footer.html');
  } else {
    console.error('Footer component element NOT FOUND in document!');
  }
  
  // Load scroll-to-top component
  if (document.getElementById('scroll-to-top-component')) {
    includeComponent('scroll-to-top-component', '/assets/components/scroll-to-top.html');
  } else {
    console.error('Scroll-to-top component element NOT FOUND in document!');
  }

  // Load case study navigation component
  if (document.getElementById('case-study-nav-component')) {
    includeComponent('case-study-nav-component', '/assets/components/case-study-nav.html');
  }
}

// Try to run immediately if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  initializeComponents();
} 