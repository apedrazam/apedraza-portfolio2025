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
    const basePath = '/assets/images/about/';
    const transitionSpeed = 0.3;
    let isSpinning = false;
  
    imageWrapper.style.transition = `transform ${transitionSpeed}s ease-out`;
  
    imageWrapper.addEventListener('mousemove', (e) => {
      if (isSpinning) return;
      const rect = imageWrapper.getBoundingClientRect();
      const tiltX = (0.5 - (e.clientY - rect.top) / rect.height) * 10;
      const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      imageWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
  
    imageWrapper.addEventListener('mouseleave', () => {
      if (isSpinning) return;
      imageWrapper.style.transition = `transform ${transitionSpeed}s ease-out`;
      imageWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  
    // Handle direct image wrapper clicks
    imageWrapper.addEventListener('click', startSpinAnimation);
    
    // Handle trigger text clicks with scroll check
    if (spinningTrigger) {
      spinningTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if image is in viewport
        const rect = imageWrapper.getBoundingClientRect();
        const isInViewport = (
          rect.top >= 0 &&
          rect.bottom <= window.innerHeight
        );
        
        if (!isInViewport) {
          // First scroll, then trigger animation after a short delay
          imageWrapper.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Use a direct timeout instead of scroll events
          // The timeout is long enough for the smooth scroll to complete
          // but not so long that it feels delayed
          setTimeout(startSpinAnimation, 300);
        } else {
          // Already in viewport, just start animation
          startSpinAnimation();
        }
      });
    }
  
    function startSpinAnimation() {
      if (isSpinning) return;
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
      image.src = basePath + images[index];
      figcaption.textContent = images[index].replace('.webp', '').replace(/_/g, ' ');
    }
  });
  