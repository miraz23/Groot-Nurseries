document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });

    // Submenu toggle for mobile
    function toggleSubmenu(id) {
      const submenu = document.getElementById(id);
      submenu.classList.toggle('hidden');
    }

    // Carousel functionality
    const carouselContainer = document.getElementById('carousel-container');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentSlide = 0;
    const totalSlides = carouselContainer.children.length;
    let autoplayInterval;
    let isAutoPlaying = true;

    // Create indicator dots
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.classList.add('h-2', 'w-2', 'rounded-full', 'transition-all');
      
      if (i === currentSlide) {
        dot.classList.add('w-6', 'bg-green-700');
      } else {
        dot.classList.add('bg-white/60');
      }
      
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        handleInteraction();
      });
      
      indicatorsContainer.appendChild(dot);
    }

    // Function to update the carousel position
    function updateCarousel() {
      carouselContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update indicators
      const indicators = indicatorsContainer.children;
      for (let i = 0; i < indicators.length; i++) {
        if (i === currentSlide) {
          indicators[i].classList.add('w-6', 'bg-green-700');
          indicators[i].classList.remove('bg-white/60');
        } else {
          indicators[i].classList.remove('w-6', 'bg-green-700');
          indicators[i].classList.add('bg-white/60');
        }
      }
    }

    // Function to go to a specific slide
    function goToSlide(index) {
      currentSlide = index;
      updateCarousel();
    }

    // Function to go to the next slide
    function nextSlide() {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateCarousel();
    }

    // Function to go to the previous slide
    function prevSlide() {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateCarousel();
    }

    // Handle user interaction
    function handleInteraction() {
      isAutoPlaying = false;
      clearInterval(autoplayInterval);
      
      // Resume autoplay after 10 seconds of inactivity
      setTimeout(() => {
        startAutoplay();
      }, 10000);
    }

    // Start autoplay
    function startAutoplay() {
      isAutoPlaying = true;
      autoplayInterval = setInterval(() => {
        if (isAutoPlaying) {
          nextSlide();
        }
      }, 5000);
    }

    // Event listeners for navigation
    prevButton.addEventListener('click', () => {
      prevSlide();
      handleInteraction();
    });

    nextButton.addEventListener('click', () => {
      nextSlide();
      handleInteraction();
    });

    // Pause autoplay on hover
    const carousel = document.getElementById('banner-carousel');
    carousel.addEventListener('mouseenter', () => {
      isAutoPlaying = false;
      clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
      startAutoplay();
    });

    // Start the autoplay
    startAutoplay();
});

