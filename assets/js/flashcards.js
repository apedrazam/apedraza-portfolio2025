(function() {
  // Only initialize the modal functionality when needed
  // Don't preload anything until the user interacts
  const caseStudies = [
    'devex-design-process', 'devex-job-posting', 'devex-design-system', 'adamo-wholesale-billing'
  ];
  let currentIndex = 0, modalOpen = false;
  let modalInitialized = false;

  function createModal() {
    if (modalInitialized) return;
    
    document.body.insertAdjacentHTML('beforeend', `
      <div id="flashcard-wrapper">
        <div class="flashcard-container">
          <button id="flashcard-prev" class="flashcard-prev-btn" disabled>&lsaquo;</button>
          <div class="flashcard-content"></div>
          <button id="flashcard-next" class="flashcard-next-btn" disabled>&rsaquo;</button>
        </div>
      </div>`);
    document.getElementById('flashcard-wrapper').addEventListener('click', (e) => e.target === e.currentTarget && closeModal());
    ['flashcard-prev', 'flashcard-next'].forEach(id => document.getElementById(id).addEventListener('click', navigate));
    document.addEventListener('keydown', handleKeyboardNavigation);
    modalInitialized = true;
  }

  function handleKeyboardNavigation(e) {
    if (!modalOpen) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') navigate(-1);
    else if (e.key === 'ArrowRight') navigate(1);
    else if (e.key === 'Enter') {
      e.preventDefault();
      // Use the link in the current flashcard content
      const readMoreLink = document.querySelector('.flashcard-content a.read-more-link');
      if (readMoreLink) {
        window.location.href = readMoreLink.href;
      }
    }
    else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      document.querySelector('.flashcard-content')?.scrollBy({ top: e.key === 'ArrowUp' ? -100 : 100, behavior: 'smooth' });
    }
  }

  // Cache the loaded flashcard content
  const flashcardCache = {};

  function loadFlashcardContent(caseStudyId) {
    // Return from cache if already loaded
    if (flashcardCache[caseStudyId]) {
      return Promise.resolve(flashcardCache[caseStudyId]);
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/flashcards/flashcard-${caseStudyId}.html`, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          // Cache the result
          flashcardCache[caseStudyId] = xhr.responseText;
          resolve(xhr.responseText);
        } else {
          resolve('<div class="error">Failed to load flashcard content</div>');
        }
      };
      xhr.onerror = function() {
        resolve('<div class="error">Failed to load flashcard content</div>');
      };
      xhr.send();
    });
  }

  function updateNavigationButtons() {
    document.getElementById('flashcard-prev').disabled = currentIndex === 0;
    document.getElementById('flashcard-next').disabled = currentIndex === caseStudies.length - 1;
  }

  function navigate(direction) {
    if (typeof direction === 'object') direction = this.id === 'flashcard-prev' ? -1 : 1;
    if ((direction === -1 && currentIndex > 0) || (direction === 1 && currentIndex < caseStudies.length - 1)) {
      currentIndex += direction;
      showFlashcard(caseStudies[currentIndex]);
    }
  }

  function showFlashcard(caseStudyId) {
    const content = document.querySelector('.flashcard-content');
    if (!content) return;
    content.scrollTop = 0;
    content.innerHTML = '<div class="loading">Loading...</div>';
    
    loadFlashcardContent(caseStudyId).then(html => {
      content.innerHTML = html;
      
      // Add click handler for close button
      const closeBtn = content.querySelector('#flashcard-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
      }
      
      updateNavigationButtons();
    });
  }

  function openModal(caseStudyId) {
    createModal(); // Only creates if not already initialized
    currentIndex = caseStudies.indexOf(caseStudyId);
    if (currentIndex === -1) return;
    document.getElementById('flashcard-wrapper').classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalOpen = true;
    showFlashcard(caseStudyId);
  }

  function closeModal() {
    document.getElementById('flashcard-wrapper')?.classList.remove('is-open');
    document.body.style.overflow = '';
    modalOpen = false;
  }

  // Lazily add event listeners to flashcard buttons
  // This way we don't block initial page load with unnecessary event binding
  function initFlashcardButtons() {
    // Wait for idle time to add event listeners
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        addFlashcardButtonListeners();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(addFlashcardButtonListeners, 500);
    }
  }

  function addFlashcardButtonListeners() {
    document.querySelectorAll('.flashcard-btn').forEach(button =>
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(button.getAttribute('data-case-study'));
      })
    );
  }

  // Start initializing only after page content has loaded
  if (document.readyState === 'complete') {
    initFlashcardButtons();
  } else {
    window.addEventListener('load', initFlashcardButtons);
  }
})();