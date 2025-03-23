(async function() {
  async function includeComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return console.error(`Element #${elementId} not found!`);

    try {
      const response = await fetch(componentPath);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      element.innerHTML = await response.text();
      
      element.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.text = oldScript.text;
        [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
        oldScript.replaceWith(newScript);
      });
    } catch (error) {
      console.error(`Error loading ${componentPath}:`, error);
      element.innerHTML = `<div class="error-message">Error loading component: ${error.message}</div>`;
    }
  }

  function initializeComponents() {
    const components = [
      { id: 'header-component', path: '/assets/components/header.html' },
      { id: 'footer-component', path: '/assets/components/footer.html' },
      { id: 'scroll-to-top-component', path: '/assets/components/scroll-to-top.html' },
      { id: 'case-study-nav-component', path: '/assets/components/case-study-nav.html' }
    ];
    components.forEach(({ id, path }) => document.getElementById(id) && includeComponent(id, path));
  }

  document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', initializeComponents) 
    : initializeComponents();
})();
