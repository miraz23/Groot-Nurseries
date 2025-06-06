document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
  
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  
    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  
    // Close mobile menu when clicking on a menu item
    const mobileMenuItems = mobileMenu.querySelectorAll('a');
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
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
  
    // Creating indicator dots
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
      
      // Updating indicators
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
  
    // Starting autoplay
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
  
    // Pausing autoplay on hover
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
    let cartItems = [];
    const productsPerPage = 8;
    let currentPage = 1;
    const productsGrid = document.getElementById('products-grid');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsCountElement = document.getElementById('cart-items-count');
    const quickViewModal = document.getElementById('quick-view-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.getElementById('close-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const cartNotification = document.getElementById('cart-notification');
    const seeMoreBtn = document.getElementById('see-more-btn');
    const seeLessBtn = document.getElementById('see-less-btn');
    
    // Cart panel elements
    const cartPanel = document.getElementById('cart-panel');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const openCartBtn = document.getElementById('open-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const continueShoppingBtn = document.getElementById('continue-shopping');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDiscount = document.getElementById('cart-discount');
    const discountRow = document.getElementById('discount-row');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    
    // Coupon elements
    const couponInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon');
    
    // Shipping elements
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    
    // Available coupons
    const availableCoupons = {
      'WELCOME10': { discount: 0.10, minAmount: 0, message: '10% off your order' },
      'PLANT20': { discount: 0.20, minAmount: 50, message: '20% off orders over $50' },
      'FREESHIP': { discount: 0, minAmount: 0, message: 'Free shipping on your order', freeShipping: true }
    };
    
    // Current applied coupon
    let appliedCoupon = null;
    
    // Fixed shipping cost
    const shippingCost = 5.99;
  
    // Formatting price to currency
    function formatPrice(price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    }
  
    // Fetching products from JSON data
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
        
        // Load cart from localStorage if available
        loadCart();
      } catch (error) {
        console.error('Error fetching products:', error);
        productsGrid.innerHTML = `
          <div class="col-span-full text-center py-10">
            <p class="text-red-600">Failed to load products. Please try again later.</p>
          </div>
        `;
      }
    }
  
    // Rendering products to the grid
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
        
        // Generating stars based on rating
        const stars = generateStarRating(product.rating);
        
        // Formatting price
        const formattedPrice = formatPrice(product.price);
        
        // Calculating sale price if available
        let priceHtml = '';
        if (product.onSale && product.salePrice < product.price) {
          const formattedSalePrice = formatPrice(product.salePrice);
          priceHtml = `
            <div class="flex items-center">
              <span class="font-bold text-gray-900">${formattedSalePrice}</span>
              <span class="text-gray-500 line-through text-sm ml-2">${formattedPrice}</span>
            </div>
          `;
        } else {
          priceHtml = `<span class="font-bold text-gray-900">${formattedPrice}</span>`;
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
            ${product.onSale ? '<span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">SALE</span>' : ''}
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-lg mb-1 text-gray-900">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-3">${product.careLevel} Care</p>
            <div class="flex justify-between items-center mb-3">
              ${priceHtml}
              <div class="text-yellow-400">${stars}</div>
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
          addToCart(productId, 1);
        });
      });
    }
  
    // Generating star rating HTML
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
  
    // Filtering products by category
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
  
    // Updating button visibility
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
  
    // Loading more products
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
  
    // Loading less products
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
  
    // Opening quick view modal
    function openQuickView(productId) {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return;
      
      // Generating stars based on rating
      const stars = generateStarRating(product.rating);
      
      // Formatting price
      const formattedPrice = formatPrice(product.price);
      
      // Calculating sale price if available
      let priceHtml = '';
      if (product.onSale && product.salePrice < product.price) {
        const formattedSalePrice = formatPrice(product.salePrice);
        const discountPercent = Math.round((1 - product.salePrice / product.price) * 100);
        
        priceHtml = `
          <div class="flex items-center">
            <span class="font-bold text-2xl text-gray-900">${formattedSalePrice}</span>
            <span class="text-gray-500 line-through text-sm ml-2">${formattedPrice}</span>
            <span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full ml-2">${discountPercent}% OFF</span>
          </div>
        `;
      } else {
        priceHtml = `<span class="font-bold text-2xl text-gray-900">${formattedPrice}</span>`;
      }
      
      modalContent.innerHTML = `
        <div class="h-full">
          <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover rounded-lg">
        </div>
        <div>
          <div class="text-yellow-400 mb-2">${stars}</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
          <p class="text-gray-600 mb-2">${product.description}</p>
          <p class="text-green-700 font-medium mb-4">Category: ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
          <p class="text-gray-700 mb-4">Care Level: <span class="font-medium">${product.careLevel}</span></p>
          
          <div class="mb-4">
            ${priceHtml}
          </div>
          
          <div class="mt-6">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex border rounded-md">
                <button class="px-3 py-1 border-r" id="decrease-quantity">-</button>
                <input type="number" value="1" min="1" class="w-12 text-center" id="product-quantity">
                <button class="px-3 py-1 border-l" id="increase-quantity">+</button>
              </div>
              <span class="text-gray-600">Available: In Stock</span>
            </div>
            
            <button class="w-full bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition-colors modal-add-to-cart" data-id="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      `;
      
      // Showing modal
      quickViewModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      
      // Setting up quantity buttons
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
  
    // Closing quick view modal
    function closeQuickViewModal() {
      quickViewModal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore scrolling
    }
  

    //========================= Adding to cart functionality =========================

    function addToCart(productId, quantity = 1) {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return;
      
      // Check if product is already in cart
      const existingItemIndex = cartItems.findIndex(item => item.id === productId);
      
      if (existingItemIndex !== -1) {
        // Updating quantity if product already exists in cart
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // Adding new item to cart
        const price = product.onSale ? product.salePrice : product.price;
        cartItems.push({
          id: product.id,
          name: product.name,
          price: price,
          image: product.image,
          quantity: quantity
        });
      }
      
      // Updating cart UI
      updateCartUI();
      
      // Saving cart to localStorage
      saveCart();
      
      // Showing notification
      cartNotification.textContent = `${product.name} added to cart!`;
      cartNotification.classList.remove('translate-y-20', 'opacity-0');
      
      // Hiding notification after 3 seconds
      setTimeout(() => {
        cartNotification.classList.add('translate-y-20', 'opacity-0');
      }, 3000);
    }
  
    // Updating cart UI
    function updateCartUI() {
      // Updating cart count
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
      cartCountElement.textContent = totalItems;
      cartItemsCountElement.textContent = totalItems;
      
      // Showing/hiding empty cart message
      if (cartItems.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        checkoutBtn.disabled = true;
      } else {
        emptyCartMessage.classList.add('hidden');
        checkoutBtn.disabled = false;
      }
      
      // Rendering cart items
      renderCartItems();
      
      // Updating cart totals
      updateCartTotals();
    }
  
    // Rendering cart items
    function renderCartItems() {
      // Clearing existing items except the empty cart message
      const itemsToRemove = cartItemsContainer.querySelectorAll('.cart-item');
      itemsToRemove.forEach(item => item.remove());
      
      // Adding each cart item
      cartItems.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item flex border-b border-gray-200 py-4 cart-item-enter';
        
        const totalPrice = item.price * item.quantity;
        const formattedPrice = formatPrice(totalPrice);
        
        cartItem.innerHTML = `
          <div class="w-20 h-20 flex-shrink-0 mr-4">
            <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover rounded-md">
          </div>
          <div class="flex-grow">
            <h4 class="font-medium text-gray-900">${item.name}</h4>
            <p class="text-gray-600 text-sm">${formatPrice(item.price)} each</p>
            <div class="flex items-center mt-2">
              <button class="cart-item-decrease px-2 py-1 border rounded-l-md bg-gray-100 hover:bg-gray-200" data-id="${item.id}">-</button>
              <span class="px-3 py-1 border-t border-b">${item.quantity}</span>
              <button class="cart-item-increase px-2 py-1 border rounded-r-md bg-gray-100 hover:bg-gray-200" data-id="${item.id}">+</button>
            </div>
          </div>
          <div class="flex flex-col items-end ml-4">
            <span class="font-medium">${formattedPrice}</span>
            <button class="cart-item-remove text-red-500 text-sm mt-2 hover:text-red-700" data-id="${item.id}">
              <i class="fas fa-trash-alt"></i> Remove
            </button>
          </div>
        `;
        
        // Inserting before the empty cart message
        cartItemsContainer.insertBefore(cartItem, emptyCartMessage);
      });
      
      // Adding event listeners to cart item buttons
      document.querySelectorAll('.cart-item-decrease').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = parseInt(e.target.getAttribute('data-id'));
          decreaseCartItemQuantity(productId);
        });
      });
      
      document.querySelectorAll('.cart-item-increase').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = parseInt(e.target.getAttribute('data-id'));
          increaseCartItemQuantity(productId);
        });
      });
      
      document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = parseInt(e.target.getAttribute('data-id'));
          removeCartItem(productId);
        });
      });
    }
  
    // Decreasing cart item quantity
    function decreaseCartItemQuantity(productId) {
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      if (itemIndex === -1) return;
      
      if (cartItems[itemIndex].quantity > 1) {
        cartItems[itemIndex].quantity--;
      } else {
        // Removing item if quantity becomes 0
        cartItems.splice(itemIndex, 1);
      }
      
      updateCartUI();
      saveCart();
    }
  
    // Increasing cart item quantity
    function increaseCartItemQuantity(productId) {
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      if (itemIndex === -1) return;
      
      cartItems[itemIndex].quantity++;
      
      updateCartUI();
      saveCart();
    }
  
    // Removing cart item
    function removeCartItem(productId) {
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      if (itemIndex === -1) return;
      
      cartItems.splice(itemIndex, 1);
      
      updateCartUI();
      saveCart();
    }
  
    // Updating cart totals
    function updateCartTotals() {
      // Calculating subtotal
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      // Calculating discount
      let discount = 0;
      if (appliedCoupon && subtotal >= appliedCoupon.minAmount) {
        discount = appliedCoupon.discount * subtotal;
      }
      
      // Using fixed shipping cost
      let finalShippingCost = cartItems.length > 0 ? shippingCost : 0;
      
      // Applying free shipping if coupon provides it
      if (appliedCoupon && appliedCoupon.freeShipping) {
        finalShippingCost = 0;
      }
      
      // Calculating total
      const total = subtotal - discount + finalShippingCost;
      
      // Updating UI
      cartSubtotal.textContent = formatPrice(subtotal);
      cartDiscount.textContent = `-${formatPrice(discount)}`;
      cartShipping.textContent = formatPrice(finalShippingCost);
      cartTotal.textContent = formatPrice(total);
      
      // Showing/hiding discount row
      if (discount > 0) {
        discountRow.classList.remove('hidden');
      } else {
        discountRow.classList.add('hidden');
      }
    }
  
    // Saving cart to localStorage
    function saveCart() {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  
    // Loading cart from localStorage
    function loadCart() {
      const savedCart = localStorage.getItem('cartItems');
      
      if (savedCart) {
        cartItems = JSON.parse(savedCart);
      }
      
      // Resetting coupon state
      appliedCoupon = null;
      couponInput.value = '';
      
      updateCartUI();
    }
  
    // Opening cart panel
    function openCartPanel() {
      cartPanel.classList.add('open');
      cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
  
    // Closing cart panel
    function closeCartPanel() {
      cartPanel.classList.remove('open');
      cartOverlay.classList.remove('open');
      document.body.style.overflow = ''; // Restore scrolling
    }
  
    // Event listeners for cart panel
    openCartBtn.addEventListener('click', openCartPanel);
    closeCartBtn.addEventListener('click', closeCartPanel);
    cartOverlay.addEventListener('click', closeCartPanel);
    continueShoppingBtn.addEventListener('click', closeCartPanel);
  
    // Event listener for coupon code
    applyCouponBtn.addEventListener('click', applyCoupon);
    
    // Event listeners for modal
    closeModal.addEventListener('click', closeQuickViewModal);
    modalOverlay.addEventListener('click', closeQuickViewModal);
  
    // Closing modal when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!quickViewModal.classList.contains('hidden')) {
          closeQuickViewModal();
        }
        if (cartPanel.classList.contains('open')) {
          closeCartPanel();
        }
      }
    });
  
    // Checkout button
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        return;
      }
      showSuccessModal();
    });
  
    // Applying coupon code
    function applyCoupon() {
      const couponCode = couponInput.value.trim().toUpperCase();
      
      if (!couponCode) {
        return;
      }
      
      const coupon = availableCoupons[couponCode];
      
      if (!coupon) {
        return;
      }
      
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      if (coupon.minAmount > 0 && subtotal < coupon.minAmount) {
        return;
      }
      
      // Applying coupon
      appliedCoupon = {
        ...coupon,
        code: couponCode
      };
      
      // Clearing coupon input
      couponInput.value = '';
      
      // Updating cart totals
      updateCartTotals();
      
      // Saving to localStorage
      saveCart();
    }
  
    // Fetching products when the page loads
    fetchProducts();


    // ================================ Reviews carousel functionality ================================

    const reviewsContainer = document.getElementById("reviews-container");
    const prevReviewButton = document.getElementById("prev-review");
    const nextReviewButton = document.getElementById("next-review");
    const reviewIndicatorsContainer = document.getElementById("review-indicators");

    let currentReview = 0;
    const totalReviews = reviewsContainer.children.length;
    let visibleReviews = window.innerWidth < 768 ? 1 : 3;
    let maxReviewIndex = totalReviews - visibleReviews;
    let autoplayIntervalReview;
    let isAutoPlayingReview = true;

    // Function to update the carousel position
    function updateReviewCarousel() {
      const slidePercentage = 100 / visibleReviews;
      reviewsContainer.style.transform = `translateX(-${currentReview * slidePercentage}%)`;
    }

    // Function to go to the next review
    function nextReview() {
      currentReview = (currentReview + 1) % (maxReviewIndex + 1);
      updateReviewCarousel();
    }

    // Function to go to the previous review
    function prevReview() {
      currentReview = (currentReview - 1 + (maxReviewIndex + 1)) % (maxReviewIndex + 1);
      updateReviewCarousel();
    }

    // Starting autoplay
    function startReviewAutoplay() {
      isAutoPlayingReview = true;
      autoplayIntervalReview = setInterval(() => {
        if (isAutoPlayingReview) {
          nextReview();
        }
      }, 5000);
    }

    // Updating visible reviews on window resize
    function handleReviewResize() {
      const newVisibleReviews = window.innerWidth < 768 ? 1 : 3;

      if (visibleReviews !== newVisibleReviews) {
        visibleReviews = newVisibleReviews;
        maxReviewIndex = totalReviews - visibleReviews;

        // Adjusting current review if needed
        if (currentReview > maxReviewIndex) {
          currentReview = maxReviewIndex;
        }

        createReviewIndicators();
        updateReviewCarousel();
      }
    }

    // Event listeners for navigation
    prevReviewButton.addEventListener("click", () => {
      prevReview();
      // handleReviewInteraction();
    });

    nextReviewButton.addEventListener("click", () => {
      nextReview();
      // handleReviewInteraction();
    });

    // Pause autoplay on hover
    const reviewsCarousel = document.getElementById("reviews-carousel");
    reviewsCarousel.addEventListener("mouseenter", () => {
      isAutoPlayingReview = false;
      clearInterval(autoplayIntervalReview);
    });

    reviewsCarousel.addEventListener("mouseleave", () => {
      startReviewAutoplay();
    });

    // Handle window resize
    window.addEventListener("resize", handleReviewResize);

    // Initialize
    startReviewAutoplay();

    // ================================ FAQ functionality ================================

    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Get the answer element
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.faq-icon');
            
            // Toggle the answer visibility
            if (answer.classList.contains('hidden')) {
                // Close all other open FAQs
                document.querySelectorAll('.faq-answer').forEach(item => {
                    if (item !== answer && !item.classList.contains('hidden')) {
                        item.classList.add('hidden');
                        // Reset all other icons
                        item.previousElementSibling.querySelector('.faq-icon').classList.remove('rotate-180');
                    }
                });
                
                // Open this FAQ
                answer.classList.remove('hidden');
                // Rotate icon
                icon.classList.add('rotate-180');
            } else {
                // Close this FAQ
                answer.classList.add('hidden');
                // Reset icon
                icon.classList.remove('rotate-180');
            }
        });
    });

    // ================================ Search functionality ================================

    const searchInput = document.querySelector('input[type="text"][placeholder="Search..."]');
    const searchButton = searchInput.nextElementSibling;

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            renderProducts(allProducts.slice(0, productsPerPage));
            return;
        }

        const filteredProducts = allProducts.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        });

        renderProducts(filteredProducts);
        updateButtonVisibility(filteredProducts);
    }

    // Add event listeners for search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    searchButton.addEventListener('click', handleSearch);

    // Clear search when input is cleared
    searchInput.addEventListener('input', (e) => {
        if (e.target.value === '') {
            renderProducts(allProducts.slice(0, productsPerPage));
            updateButtonVisibility();
        }
    });

    // Success Modal Functions
    function showSuccessModal() {
        const modal = document.getElementById('success-modal');
        modal.classList.add('show');
        // Clear cart after successful order
        clearCart();
        // Close cart panel
        closeCartPanel();
    }

    // Clear cart function
    function clearCart() {
        cartItems = [];
        appliedCoupon = null;
        saveCart();
        updateCartUI();
    }

    // Add event listener for continue shopping button in success modal
    document.querySelector('#success-modal button').addEventListener('click', () => {
        closeSuccessModal();
    });
});