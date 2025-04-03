document.addEventListener('DOMContentLoaded', () => {
    const imageWrapper = document.querySelector('.about-intro__image-wrapper');
    const image = document.querySelector('.about-intro__image-me');
    const figcaption = document.querySelector('.about-intro__image-caption');
    const spinningTrigger = document.querySelector('.spinning-animation-trigger');
    if (!imageWrapper || !image || !figcaption) return;
  
    const images = [
      'fearless_researcher.webp',
      'meticulous_architect.webp',
      'pragmatic_designer.webp',
      'visionary_strategist.webp',
      'well-round_generalist.webp'
    ];
    const basePath = '/assets/img/about/';
    
    // Set initial states
    let isSpinning = false;
    let spinningEnabled = false;
    const transitionSpeed = 0.3;
    imageWrapper.style.transition = `transform ${transitionSpeed}s ease-out`;
    
    // Show loading state
    if (spinningTrigger) spinningTrigger.classList.add('loading');
    
    // Use preloaded images from head or load them now
    const preloadedImages = window.preloadedAboutImages || [];
    if (preloadedImages.length === images.length) {
      enableSpinning();
    } else {
      let imagesLoaded = 0;
      images.forEach((imageSrc, index) => {
        const img = new Image();
        img.onload = () => {
          if (++imagesLoaded === images.length) enableSpinning();
        };
        img.src = basePath + imageSrc;
        preloadedImages[index] = img;
      });
    }
  
    function enableSpinning() {
      spinningEnabled = true;
      if (spinningTrigger) {
        spinningTrigger.classList.remove('loading');
        spinningTrigger.classList.add('ready');
      }
    }
  
    // Mouse tilt effect
    imageWrapper.addEventListener('mousemove', (e) => {
      if (isSpinning) return;
      const rect = imageWrapper.getBoundingClientRect();
      const tiltX = (0.5 - (e.clientY - rect.top) / rect.height) * 20;
      const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      imageWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
  
    imageWrapper.addEventListener('mouseleave', () => {
      if (isSpinning) return;
      imageWrapper.style.transition = `transform ${transitionSpeed}s ease-out`;
      imageWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  
    // Click handlers
    imageWrapper.addEventListener('click', () => {
      if (spinningEnabled) startSpinAnimation();
    });
    
    if (spinningTrigger) {
      spinningTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (!spinningEnabled) return;
        
        const rect = imageWrapper.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isInViewport) {
          imageWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(startSpinAnimation, 300);
        } else {
          startSpinAnimation();
        }
      });
    }
  
    function startSpinAnimation() {
      if (isSpinning || !spinningEnabled) return;
      isSpinning = true;
      imageWrapper.style.transition = '';
      image.classList.add('spinning');
  
      let totalRotation = 0, lastImageChangeAt = 0, currentImageIndex = 0;
      const finalImageIndex = Math.floor(Math.random() * images.length);
  
      function animate(timestamp, startTime = timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 2500, 1);
        const speed = progress < 0.2 ? 35 * (progress / 0.2) : progress > 0.7 ? 35 * (1 - Math.pow((progress - 0.7) / 0.3, 2)) : 35;
        totalRotation += speed;
        
        if (totalRotation - lastImageChangeAt >= 180) {
          lastImageChangeAt = totalRotation;
          setImage(++currentImageIndex % images.length);
        }
        
        imageWrapper.style.transform = `perspective(1000px) rotateY(${totalRotation % 360}deg)`;
        
        if (progress < 1) requestAnimationFrame((t) => animate(t, startTime));
        else finishAnimation(finalImageIndex);
      }
  
      requestAnimationFrame(animate);
    }
  
    function finishAnimation(finalIndex) {
      setImage(finalIndex);
      isSpinning = false;
      image.classList.remove('spinning');
      imageWrapper.style.transition = `transform ${transitionSpeed}s ease-out`;
      imageWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  
    function setImage(index) {
      image.src = preloadedImages[index].src;
      figcaption.textContent = images[index].replace('.webp', '').replace(/_/g, ' ');
    }
  });
  