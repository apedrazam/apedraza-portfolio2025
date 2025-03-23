/**
 * Flashcards integration script for portfolio site
 * Simple modal system for displaying case study flashcards
 */

(function() {
  // Case study order and mapping
  const caseStudies = [
    'devex-design-process',
    'devex-job-posting',
    'devex-design-system',
    'adamo-wholesale-billing'
  ];

  // State management
  let currentIndex = 0;
  let modalOpen = false;

  // Create and initialize the modal
  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'flashcard-wrapper';
    modal.innerHTML = `
      <div class="flashcard-container">
        <button id="flashcard-prev" class="flashcard-prev-btn" disabled>&lsaquo;</button>
        <div class="flashcard-content"></div>
        <button id="flashcard-next" class="flashcard-next-btn" disabled>&rsaquo;</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Event listeners
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.getElementById('flashcard-prev').addEventListener('click', navigatePrevious);
    document.getElementById('flashcard-next').addEventListener('click', navigateNext);

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
  }

  // Handle keyboard navigation
  function handleKeyboardNavigation(e) {
    if (!modalOpen) return;

    switch(e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        navigatePrevious();
        break;
      case 'ArrowRight':
        navigateNext();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        e.preventDefault();
        const content = document.querySelector('.flashcard-content');
        if (content) {
          const scrollAmount = 100;
          const direction = e.key === 'ArrowUp' ? -scrollAmount : scrollAmount;
          content.scrollBy({ top: direction, behavior: 'smooth' });
        }
        break;
    }
  }

  // Load flashcard content
  function loadFlashcardContent(caseStudyId) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/case-study/${caseStudyId}/flashcard.html`, false);
    xhr.send();
    
    if (xhr.status === 200) {
      return xhr.responseText;
    } else {
      console.error('Error loading flashcard:', xhr.status);
      return '<div class="error">Failed to load flashcard content</div>';
    }
  }

  // Update navigation buttons state
  function updateNavigationButtons() {
    const prevBtn = document.getElementById('flashcard-prev');
    const nextBtn = document.getElementById('flashcard-next');
    
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === caseStudies.length - 1;
  }

  // Navigate to previous flashcard
  function navigatePrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      showFlashcard(caseStudies[currentIndex]);
    }
  }

  // Navigate to next flashcard
  function navigateNext() {
    if (currentIndex < caseStudies.length - 1) {
      currentIndex++;
      showFlashcard(caseStudies[currentIndex]);
    }
  }

  // Show flashcard content
  function showFlashcard(caseStudyId) {
    const content = document.querySelector('.flashcard-content');
    if (!content) return;

    // Reset scroll position
    content.scrollTop = 0;

    // Load and display content
    const html = loadFlashcardContent(caseStudyId);
    content.innerHTML = html;

    // Update navigation buttons
    updateNavigationButtons();
  }

  // Open modal
  function openModal(caseStudyId) {
    // Create modal if it doesn't exist
    if (!document.getElementById('flashcard-wrapper')) {
      createModal();
    }

    // Set current index
    currentIndex = caseStudies.indexOf(caseStudyId);
    if (currentIndex === -1) return;

    // Show modal and load content
    const modal = document.getElementById('flashcard-wrapper');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modalOpen = true;

    showFlashcard(caseStudyId);
  }

  // Close modal
  function closeModal() {
    const modal = document.getElementById('flashcard-wrapper');
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      modalOpen = false;
    }
  }

  // Initialize flashcard buttons
  function initFlashcardButtons() {
    document.querySelectorAll('.flashcard-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const caseStudyId = button.getAttribute('data-case-study');
        if (caseStudyId) {
          openModal(caseStudyId);
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlashcardButtons);
  } else {
    initFlashcardButtons();
  }
})(); 