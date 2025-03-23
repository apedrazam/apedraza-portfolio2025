/**
 * Page Template System
 * Provides a consistent layout for pages
 */

(function() {
  // Global registry for page templates
  window.PageTemplateRegistry = window.PageTemplateRegistry || {
    templates: {},
    
    // Register a page template
    register: function(id, getTemplateContentFn) {
      this.templates[id] = { 
        getContent: getTemplateContentFn
      };
    },
    
    // Get content for a specific template
    getTemplate: function(id) {
      if (!this.templates[id]) {
        console.error(`Template not found: ${id}`);
        return null;
      }
      return this.templates[id].getContent();
    }
  };
  
  // Common page structure that will be used across all pages
  function createPageStructure(content, title) {
    return `
      <!-- Top background SVG -->
      <figure>
        <img src="/assets/images/top-bg-block2.svg" class="top-bg-block" alt=""/>
      </figure>
      
      <!-- Page header -->
      <section class="page-header">
        <div class="container">
          <h1 class="page-title">${title}</h1>
        </div>
      </section>
      
      <!-- Main content -->
      <section class="page-content-section">
        <div class="container">
          ${content}
        </div>
      </section>
      <figure>
        <img src="/assets/images/bottom-bg-block2.svg" class="bottom-bg-block" alt=""/>
      </figure>
    `;
  }
  
  // Register the common template for basic pages
  window.PageTemplateRegistry.register('basic', function(content, title) {
    return createPageStructure(content, title);
  });
  
  // Initialize function - call this when the DOM is ready
  function initPageTemplates() {
    // Get the main element
    const mainElement = document.querySelector('main');
    if (!mainElement) return;

    // Get the page content wrapper
    const pageContentWrapper = document.querySelector('.page-content-wrapper');
    if (!pageContentWrapper) return;

    // Get the existing content and title
    const content = pageContentWrapper.innerHTML;
    const title = document.querySelector('h1')?.textContent || 'Page';
    
    // Wrap the content in the page structure
    const template = window.PageTemplateRegistry.getTemplate('basic')(content, title);
    mainElement.innerHTML = template;
  }
  
  // Start when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTemplates);
  } else {
    initPageTemplates();
  }
})(); 