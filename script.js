document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.toggle('hidden');
  });

  // Submenu toggle for mobile
  window.toggleSubmenu = function(id) {
    const submenu = document.getElementById(id);
    submenu.classList.toggle('hidden');
  };

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

  // =============== PRODUCTS SECTION ===============

  // Global variables
  let allProducts = [];
  let cartCount = 0;
  let currentPage = 1;
  const productsPerPage = 8;
  const productsGrid = document.getElementById('products-grid');
  const cartCountElement = document.getElementById('cart-count');
  const quickViewModal = document.getElementById('quick-view-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModal = document.getElementById('close-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const cartNotification = document.getElementById('cart-notification');
  const seeMoreBtn = document.getElementById('see-more-btn');
  const seeLessBtn = document.getElementById('see-less-btn');

  // Fetch products from API
  async function fetchProducts() {
      try {
          const response = await fetch('https://raw.githubusercontent.com/miraz23/Groot-Nurseries/refs/heads/main/data.json');
          if (!response.ok) {
              throw new Error('Failed to fetch products');
          }
          const data = await response.json();
          allProducts = data;
          renderProducts(allProducts.slice(0, productsPerPage));
          setupFilterButtons();
          updateButtonVisibility();
      } catch (error) {
          console.error('Error fetching products:', error);
          productsGrid.innerHTML = `
              <div class="col-span-full text-center py-10">
                  <p class="text-red-600">Failed to load products. Please try again later.</p>
              </div>
          `;
      }
  }

  // Render products to the grid
  function renderProducts(products, append = false) {
      if (products.length === 0) {
          productsGrid.innerHTML = `
              <div class="col-span-full text-center py-10">
                  <p class="text-gray-600">No products found in this category.</p>
              </div>
          `;
          return;
      }

      if (!append) {
          productsGrid.innerHTML = '';
      }
      
      products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl fade-in';
          
          // Generate stars based on rating
          const stars = generateStarRating(product.rating);
          
          // Format price
          const formattedPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
          }).format(product.price);
          
          // Calculate discount if available
          let discountHtml = '';
          if (product.discount) {
              const originalPrice = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
              }).format(product.price / (1 - product.discount / 100));
              
              discountHtml = `
                  <span class="text-gray-500 line-through text-sm mr-2">${originalPrice}</span>
                  <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">${product.discount}% OFF</span>
              `;
          }
          
          productCard.innerHTML = `
              <div class="relative overflow-hidden">
                  <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover product-image">
                  <div class="quick-view absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <button class="quick-view-btn bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-green-700 hover:text-white transition-colors" data-id="${product.id}">
                          Quick View
                      </button>
                  </div>
                  ${product.isNew ? '<span class="absolute top-2 left-2 bg-green-700 text-white text-xs px-2 py-1 rounded-full">NEW</span>' : ''}
                  ${product.isBestSeller ? '<span class="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">BEST SELLER</span>' : ''}
              </div>
              <div class="p-4">
                  <h3 class="font-semibold text-lg mb-1 text-gray-900">${product.name}</h3>
                  <p class="text-gray-600 text-sm mb-3">${product.shortDescription || ''}</p>
                  <div class="flex justify-between items-center mb-3">
                      <span class="font-bold text-gray-900">${formattedPrice}</span>
                      ${discountHtml}
                      <div class="text-yellow-400 mb-2">${stars}</div>
                  </div>
                  <button class="add-to-cart-btn w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors" data-id="${product.id}">
                      Add to Cart
                  </button>
              </div>
          `;
          
          productsGrid.appendChild(productCard);
      });
      
      // Add event listeners to the quick view buttons
      document.querySelectorAll('.quick-view-btn').forEach(button => {
          button.addEventListener('click', (e) => {
              const productId = parseInt(e.target.getAttribute('data-id'));
              openQuickView(productId);
          });
      });
      
      // Add event listeners to the add to cart buttons
      document.querySelectorAll('.add-to-cart-btn').forEach(button => {
          button.addEventListener('click', (e) => {
              const productId = parseInt(e.target.getAttribute('data-id'));
              addToCart(productId);
          });
      });
  }

  // Generate star rating HTML
  function generateStarRating(rating) {
      let stars = '';
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
      
      for (let i = 0; i < fullStars; i++) {
          stars += '<i class="fas fa-star"></i>';
      }
      
      if (halfStar) {
          stars += '<i class="fas fa-star-half-alt"></i>';
      }
      
      for (let i = 0; i < emptyStars; i++) {
          stars += '<i class="far fa-star"></i>';
      }
      
      return stars;
  }

  // Setup filter buttons
  function setupFilterButtons() {
      const filterButtons = document.querySelectorAll('.filter-btn');
      
      filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              // Remove active class from all buttons
              filterButtons.forEach(btn => {
                  btn.classList.remove('active', 'bg-green-700', 'text-white');
                  btn.classList.add('bg-gray-200', 'text-gray-700');
              });
              
              // Add active class to clicked button
              button.classList.add('active', 'bg-green-700', 'text-white');
              button.classList.remove('bg-gray-200', 'text-gray-700');
              
              // Filter products
              const category = button.getAttribute('data-category');
              filterProducts(category);
          });
      });
  }

  // Filter products by category
  function filterProducts(category) {
      let filteredProducts;
      
      if (category === 'all') {
          filteredProducts = allProducts;
      } else {
          filteredProducts = allProducts.filter(product => product.category.toLowerCase() === category);
      }
      
      currentPage = 1;
      renderProducts(filteredProducts.slice(0, productsPerPage));
      updateButtonVisibility(filteredProducts);
  }

  // Update button visibility
  function updateButtonVisibility(filteredProducts = allProducts) {
      const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      
      if (currentPage >= totalPages) {
          seeMoreBtn.style.display = 'none';
      } else {
          seeMoreBtn.style.display = 'inline-flex';
      }

      if (currentPage > 1) {
          seeLessBtn.style.display = 'inline-flex';
      } else {
          seeLessBtn.style.display = 'none';
      }
  }

  // Load more products
  function loadMoreProducts() {
      const start = currentPage * productsPerPage;
      const end = start + productsPerPage;
      const moreProducts = allProducts.slice(start, end);
      
      if (moreProducts.length > 0) {
          currentPage++;
          renderProducts(moreProducts, true);
          updateButtonVisibility();
      }
  }

  // Load less products
  function loadLessProducts() {
      if (currentPage > 1) {
          currentPage--;
          const start = 0;
          const end = currentPage * productsPerPage;
          const products = allProducts.slice(start, end);
          renderProducts(products);
          updateButtonVisibility();
      }
  }

  // Event listeners for buttons
  seeMoreBtn.addEventListener('click', loadMoreProducts);
  seeLessBtn.addEventListener('click', loadLessProducts);

  // Open quick view modal
  function openQuickView(productId) {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return;
      
      // Generate stars based on rating
      const stars = generateStarRating(product.rating);
      
      // Format price
      const formattedPrice = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
      }).format(product.price);
      
      // Calculate discount if available
      let discountHtml = '';
      if (product.discount) {
          const originalPrice = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
          }).format(product.price / (1 - product.discount / 100));
          
          discountHtml = `
              <span class="text-gray-500 line-through text-sm mr-2">${originalPrice}</span>
              <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">${product.discount}% OFF</span>
          `;
      }
      
      // Create features list if available
      let featuresHtml = '';
      if (product.features && product.features.length > 0) {
          featuresHtml = '<div class="mt-4"><h4 class="font-medium text-gray-900 mb-2">Features:</h4><ul class="list-disc pl-5 text-gray-600">';
          product.features.forEach(feature => {
              featuresHtml += `<li>${feature}</li>`;
          });
          featuresHtml += '</ul></div>';
      }
      
      // Create care instructions if available
      let careHtml = '';
      if (product.careInstructions) {
          careHtml = `
              <div class="mt-4">
                  <h4 class="font-medium text-gray-900 mb-2">Care Instructions:</h4>
                  <p class="text-gray-600">${product.careInstructions}</p>
              </div>
          `;
      }
      
      modalContent.innerHTML = `
          <div class="h-full">
              <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover rounded-lg">
          </div>
          <div>
              <div class="text-yellow-400 mb-2">${stars}</div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
              <p class="text-gray-600 mb-2">${product.description || product.shortDescription}</p>
              <p class="text-green-700 font-medium mb-4">Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
              
              <div class="flex items-center mb-4">
                  <span class="font-bold text-2xl text-gray-900">${formattedPrice}</span>
                  ${discountHtml}
              </div>
              
              ${featuresHtml}
              ${careHtml}
              
              <div class="mt-6">
                  <div class="flex items-center gap-4 mb-4">
                      <div class="flex border rounded-md">
                          <button class="px-3 py-1 border-r" id="decrease-quantity">-</button>
                          <input type="number" value="1" min="1" class="w-12 text-center" id="product-quantity">
                          <button class="px-3 py-1 border-l" id="increase-quantity">+</button>
                      </div>
                      <span class="text-gray-600">Available: ${product.stock || 'In Stock'}</span>
                  </div>
                  
                  <button class="w-full bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition-colors modal-add-to-cart" data-id="${product.id}">
                      Add to Cart
                  </button>
              </div>
          </div>
      `;
      
      // Show modal
      quickViewModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      
      // Setup quantity buttons
      const quantityInput = document.getElementById('product-quantity');
      const decreaseBtn = document.getElementById('decrease-quantity');
      const increaseBtn = document.getElementById('increase-quantity');
      
      decreaseBtn.addEventListener('click', () => {
          const currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
              quantityInput.value = currentValue - 1;
          }
      });
      
      increaseBtn.addEventListener('click', () => {
          const currentValue = parseInt(quantityInput.value);
          quantityInput.value = currentValue + 1;
      });
      
      // Setup add to cart button
      const addToCartBtn = document.querySelector('.modal-add-to-cart');
      addToCartBtn.addEventListener('click', () => {
          const productId = parseInt(addToCartBtn.getAttribute('data-id'));
          const quantity = parseInt(quantityInput.value);
          addToCart(productId, quantity);
          closeQuickViewModal();
      });
  }

  // Close quick view modal
  function closeQuickViewModal() {
      quickViewModal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
  }

  // Add to cart functionality
  function addToCart(productId, quantity = 1) {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return;
      
      // In a real application, you would store the cart items in localStorage or send to a server
      // For this demo, we'll just update the cart count
      cartCount += quantity;
      cartCountElement.textContent = cartCount;
      
      // Show notification
      cartNotification.textContent = `${product.name} added to cart!`;
      cartNotification.classList.remove('translate-y-20', 'opacity-0');
      
      // Hide notification after 3 seconds
      setTimeout(() => {
          cartNotification.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
  }

  // Event listeners for modal
  closeModal.addEventListener('click', closeQuickViewModal);
  modalOverlay.addEventListener('click', closeQuickViewModal);

  // Close modal when pressing Escape key
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !quickViewModal.classList.contains('hidden')) {
          closeQuickViewModal();
      }
  });

  // Fetch products when the page loads
  fetchProducts();
});