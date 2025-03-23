(function() {
  const caseStudies = [
    'devex-design-process', 'devex-job-posting', 'devex-design-system', 'adamo-wholesale-billing'
  ];
  let currentIndex = 0, modalOpen = false;

  function createModal() {
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
  }

  function handleKeyboardNavigation(e) {
    if (!modalOpen) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') navigate(-1);
    else if (e.key === 'ArrowRight') navigate(1);
    else if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      document.querySelector('.flashcard-content')?.scrollBy({ top: e.key === 'ArrowUp' ? -100 : 100, behavior: 'smooth' });
    }
  }

  function loadFlashcardContent(caseStudyId) {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `/case-study/${caseStudyId}/flashcard.html`, false);
      xhr.send();
      return xhr.status === 200 ? xhr.responseText : '<div class="error">Failed to load flashcard content</div>';
    } catch {
      return '<div class="error">Failed to load flashcard content</div>';
    }
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
    content.innerHTML = loadFlashcardContent(caseStudyId);
    updateNavigationButtons();
  }

  function openModal(caseStudyId) {
    if (!document.getElementById('flashcard-wrapper')) createModal();
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

  function initFlashcardButtons() {
    document.querySelectorAll('.flashcard-btn').forEach(button =>
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(button.getAttribute('data-case-study'));
      })
    );
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initFlashcardButtons) : initFlashcardButtons();
})();