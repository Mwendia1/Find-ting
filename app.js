// ============================================
// ECOMMERCE APP - MAIN APPLICATION LOGIC
// ============================================

// ============================================
// DATA MANAGEMENT
// ============================================

// API Configuration
const API_URL = 'https://find-ting.onrender.com';

// Currency Configuration
const currency = {
    symbol: 'KSH. ',
    rate: 1
};

function formatPrice(price) {
    return `${currency.symbol}${(price * currency.rate).toFixed(2)}`;
}

let products = [];

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error('API not available');
        const data = await response.json();
        products = data;
        appState.filteredProducts = [];
    } catch (error) {
        console.error('Error fetching products:', error);
        showNotification('Failed to load products from server', 'error');
    }
}

// Categories
const categories = [
    { id: 1, name: "Electronics", icon: "📱", slug: "electronics" },
    { id: 2, name: "Fashion", icon: "👕", slug: "fashion" },
    { id: 3, name: "Home & Garden", icon: "🏠", slug: "home" },
    { id: 4, name: "Sports", icon: "⚽", slug: "sports" }
];

// App State
let appState = {
    currentUser: null,
    cart: [],
    wishlist: [],
    orders: [],
    messages: {},
    reviews: {},
    addresses: [],
    currentConversation: null,
    filteredProducts: [...products]
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    fetchProducts().then(() => {
        initializeApp();
        setupEventListeners();
    });
});

function initializeApp() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        appState = JSON.parse(savedState);
    }

    if (!appState.currentUser) {
        document.getElementById('authModal').classList.add('active');
    } else {
        showSection('homeSection');
        if (products.length > 0) {
            renderFeaturedProducts();
            renderCategories();
            initializeSlideshow();
        }
        updateUI();
    }
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

    document.getElementById('priceRange').addEventListener('input', function() {
        document.getElementById('priceValue').textContent = this.value;
        filterProducts();
    });

    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);

    document.addEventListener('click', function(e) {
        if (e.target.id === 'authModal' || e.target.id === 'productModal') {
            closeModal();
        }
    });
}

// ============================================
// AUTHENTICATION
// ============================================

function showAuthModal() {
    document.getElementById('authModal').classList.add('active');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active');
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password) {
        appState.currentUser = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            phone: "555-0000",
            avatar: email.charAt(0).toUpperCase()
        };

        saveState();
        document.getElementById('authModal').classList.remove('active');
        
        if (products.length > 0) {
            showHome();
        } else {
            showSection('homeSection');
        }
        
        updateUI();
        showNotification('Welcome back!', 'success');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value;

    if (name && email && password && phone) {
        appState.currentUser = {
            id: 1,
            name: name,
            email: email,
            phone: phone,
            avatar: name.charAt(0).toUpperCase()
        };

        appState.addresses = [{
            id: 1,
            type: 'Home',
            address: '',
            city: '',
            state: '',
            zipcode: ''
        }];

        saveState();
        document.getElementById('authModal').classList.remove('active');
        
        if (products.length > 0) {
            showHome();
        } else {
            showSection('homeSection');
        }
        
        updateUI();
        showNotification('Account created successfully!', 'success');
    }
}

function logout() {
    appState.currentUser = null;
    appState.cart = [];
    appState.wishlist = [];
    saveState();
    showAuthModal();
    showNotification('Logged out successfully', 'info');
}

// ============================================
// NAVIGATION
// ============================================

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

function showHome() {
    showSection('homeSection');
    renderFeaturedProducts();
    renderCategories();
    initializeSlideshow();
}

function showShop() {
    showSection('shopSection');
    appState.filteredProducts = [...products];
    renderProducts();
    renderFilters();
}

function showCart() {
    showSection('cartSection');
    renderCart();
}

function showOrders() {
    showSection('ordersSection');
    renderOrders();
}

function showMessages() {
    showSection('messagesSection');
    renderConversations();
}

function showProfile() {
    showSection('profileSection');
    renderProfile();
}

function toggleMobileMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// ============================================
// PRODUCTS
// ============================================

function renderFeaturedProducts() {
    if (products.length === 0) return;
    const featured = products.slice(0, 4);
    const container = document.getElementById('featuredProducts');
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    container.innerHTML = appState.filteredProducts.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const isWishlisted = appState.wishlist.some(p => p.id === product.id);
    const isImageFile = product.image.includes('.');
    return `
        <div class="product-card">
            <div class="product-image" onclick="showProductDetail(${product.id})" ${isImageFile ? `style="background-image: url('${product.image}'); background-size: cover; background-position: center;"` : ''}>
                ${!isImageFile ? product.image : ''}
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id}, event)">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-seller">${product.seller}</p>
                <div class="product-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="view-details-btn" onclick="showProductDetail(${product.id})">Details</button>
                </div>
            </div>
        </div>
    `;
}

function showProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isWishlisted = appState.wishlist.some(p => p.id === product.id);
    const isImageFile = product.image.includes('.');
    const productImages = product.images || [product.image];
    const detailHTML = `
        <div class="product-detail">
            <div class="product-images-section">
                <div class="product-detail-image" id="mainImage" style="background-image: url('${productImages[0]}'); background-size: cover; background-position: center;"></div>
                <div class="product-thumbnails">
                    ${productImages.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', ${index})" style="background-image: url('${img}'); background-size: cover; background-position: center;"></div>
                    `).join('')}
                </div>
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <div class="product-detail-seller" onclick="startChat(${product.sellerId}, '${product.seller}')">
                    <div class="seller-avatar">${product.seller.charAt(0)}</div>
                    <div>
                        <p style="margin: 0; font-weight: 600;">${product.seller}</p>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--gray-color);">Click to chat</p>
                    </div>
                </div>
                <div class="product-detail-rating">
                    <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                    <span>(${product.reviews} reviews)</span>
                </div>
                <div class="product-detail-price">${formatPrice(product.price)}</div>
                <p class="product-detail-description">${product.description}</p>
                
                <div class="product-detail-specs">
                    ${Object.entries(product.specs).map(([key, value]) => `
                        <div class="spec-item">
                            <span>${key}</span>
                            <span>${value}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="product-detail-actions">
                    <div class="quantity-selector">
                        <button onclick="decreaseQuantity()">−</button>
                        <input type="number" id="quantityInput" value="1" min="1">
                        <button onclick="increaseQuantity()">+</button>
                    </div>
                    <button class="btn btn-primary" onclick="addToCartFromDetail(${product.id})">Add to Cart</button>
                    <button class="btn btn-secondary" onclick="toggleWishlist(${product.id})">
                        <i class="fas fa-heart"></i> ${isWishlisted ? 'Remove' : 'Add'} to Wishlist
                    </button>
                </div>

                <div class="reviews-section">
                    <h3>Customer Reviews</h3>
                    <div id="reviewsList"></div>
                    <div class="add-review-form">
                        <h4>Leave a Review</h4>
                        <form onsubmit="submitReview(${product.id}, event)">
                            <div class="rating-input" id="ratingInput">
                                ${[1,2,3,4,5].map(i => `<span class="star" onclick="setRating(${i})" data-rating="${i}">★</span>`).join('')}
                            </div>
                            <div class="form-group">
                                <label>Your Review</label>
                                <textarea id="reviewText" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Submit Review</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    showSection('productDetailSection');
    document.getElementById('productDetail').innerHTML = detailHTML;
    renderProductReviews(productId);
}

function changeMainImage(imageSrc, index) {
    document.getElementById('mainImage').style.backgroundImage = `url('${imageSrc}')`;
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function renderProductReviews(productId) {
    const reviews = appState.reviews[productId] || [];
    const container = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-color);">No reviews yet. Be the first to review!</p>';
        return;
    }

    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-author">${review.author}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        </div>
    `).join('');
}

function submitReview(productId, e) {
    e.preventDefault();
    
    const rating = document.querySelector('.star.active')?.dataset.rating || 5;
    const text = document.getElementById('reviewText').value;

    if (!appState.reviews[productId]) {
        appState.reviews[productId] = [];
    }

    appState.reviews[productId].push({
        author: appState.currentUser.name,
        rating: parseInt(rating),
        text: text,
        date: new Date().toISOString()
    });

    saveState();
    renderProductReviews(productId);
    document.getElementById('reviewText').value = '';
    document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
    showNotification('Review submitted successfully!', 'success');
}

function setRating(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function increaseQuantity() {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
}

function decreaseQuantity() {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function addToCartFromDetail(productId) {
    const quantity = parseInt(document.getElementById('quantityInput').value);
    for (let i = 0; i < quantity; i++) {
        addToCart(productId);
    }
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    container.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.slug}')">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
        </div>
    `).join('');
}

// ============================================
// FILTERING & SORTING
// ============================================

function renderFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = `
        <label><input type="checkbox" value="all" onchange="filterProducts()" checked> All Categories</label>
        ${categories.map(cat => `
            <label><input type="checkbox" value="${cat.slug}" onchange="filterProducts()"> ${cat.name}</label>
        `).join('')}
    `;

    const ratingFilter = document.getElementById('ratingFilter');
    ratingFilter.innerHTML = `
        ${[5, 4, 3, 2, 1].map(rating => `
            <label><input type="checkbox" value="${rating}" onchange="filterProducts()"> ${rating}+ Stars</label>
        `).join('')}
    `;
}

function filterProducts() {
    const selectedCategories = Array.from(document.querySelectorAll('#categoryFilter input:checked')).map(c => c.value);
    const selectedRatings = Array.from(document.querySelectorAll('#ratingFilter input:checked')).map(c => parseInt(c.value));
    const maxPrice = parseInt(document.getElementById('priceRange').value);

    appState.filteredProducts = products.filter(product => {
        const categoryMatch = selectedCategories.includes('all') || selectedCategories.includes(product.category);
        const ratingMatch = selectedRatings.length === 0 || selectedRatings.some(r => product.rating >= r);
        const priceMatch = product.price <= maxPrice;

        return categoryMatch && ratingMatch && priceMatch;
    });

    renderProducts();
}

function filterByCategory(category) {
    showShop();
    setTimeout(() => {
        document.querySelector(`#categoryFilter input[value="${category}"]`).checked = true;
        document.querySelector(`#categoryFilter input[value="all"]`).checked = false;
        filterProducts();
    }, 100);
}

function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;

    switch(sortBy) {
        case 'price-low':
            appState.filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            appState.filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            appState.filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
        default:
            appState.filteredProducts.sort((a, b) => b.id - a.id);
    }

    renderProducts();
}

// ============================================
// CART MANAGEMENT
// ============================================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = appState.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        appState.cart.push({
            ...product,
            quantity: 1
        });
    }

    saveState();
    updateCartCount();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.id !== productId);
    saveState();
    updateCartCount();
    renderCart();
    showNotification('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
    const item = appState.cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveState();
        renderCart();
    }
}

function updateCartCount() {
    const count = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cartItems');
    
    if (appState.cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <button class="btn btn-primary" onclick="showShop()">Continue Shopping</button>
            </div>
        `;
        updateCartSummary();
        return;
    }

    container.innerHTML = appState.cart.map(item => {
        const isImageFile = item.image.includes('.');
        return `
        <div class="cart-item">
            <div class="cart-item-image" ${isImageFile ? `style="background-image: url('${item.image}'); background-size: cover; background-position: center;"` : ''}>${!isImageFile ? item.image : ''}</div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.seller}</p>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">−</button>
                <input type="number" value="${item.quantity}" onchange="updateCartQuantity(${item.id}, this.value)" min="1">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart(${item.id})" style="color: var(--danger-color);">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `}).join('');

    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('shipping').textContent = formatPrice(shipping);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);
}

function checkout() {
    if (appState.cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    showSection('checkoutSection');
}

function switchPaymentMethod(method) {
    document.getElementById('cardPayment').style.display = method === 'card' ? 'block' : 'none';
    document.getElementById('paypalPayment').style.display = method === 'paypal' ? 'block' : 'none';
    document.getElementById('bankPayment').style.display = method === 'bank' ? 'block' : 'none';
}

function detectCardType(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, '');
    const cardTypeIcon = document.getElementById('cardType');
    
    if (/^4/.test(cleaned)) {
        cardTypeIcon.innerHTML = '<i class="fab fa-cc-visa"></i> Visa';
        cardTypeIcon.className = 'card-type-icon visa';
    } else if (/^5[1-5]/.test(cleaned)) {
        cardTypeIcon.innerHTML = '<i class="fab fa-cc-mastercard"></i> Mastercard';
        cardTypeIcon.className = 'card-type-icon mastercard';
    } else if (/^3[47]/.test(cleaned)) {
        cardTypeIcon.innerHTML = '<i class="fab fa-cc-amex"></i> Amex';
        cardTypeIcon.className = 'card-type-icon amex';
    } else if (/^6(?:011|5)/.test(cleaned)) {
        cardTypeIcon.innerHTML = '<i class="fab fa-cc-discover"></i> Discover';
        cardTypeIcon.className = 'card-type-icon discover';
    } else {
        cardTypeIcon.innerHTML = '';
        cardTypeIcon.className = 'card-type-icon';
    }
}

function handleCheckout(e) {
    e.preventDefault();

    const order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        items: [...appState.cart],
        total: parseFloat(document.getElementById('total').textContent.replace('$', '')),
        status: 'pending',
        shipping: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipcode: document.getElementById('zipcode').value
        },
        payment: document.querySelector('input[name="payment"]:checked').value
    };

    appState.orders.push(order);
    appState.cart = [];
    saveState();
    updateCartCount();

    showNotification('Order placed successfully!', 'success');
    showOrders();
}

// ============================================
// WISHLIST
// ============================================

function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();

    const product = products.find(p => p.id === productId);
    const index = appState.wishlist.findIndex(p => p.id === productId);

    if (index > -1) {
        appState.wishlist.splice(index, 1);
        showNotification('Removed from wishlist', 'info');
    } else {
        appState.wishlist.push(product);
        showNotification('Added to wishlist!', 'success');
    }

    saveState();
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.closest('.product-card')?.querySelector('.product-image').onclick.toString().match(/\d+/)[0];
        if (appState.wishlist.some(p => p.id == productId)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ============================================
// ORDERS
// ============================================

function renderOrders() {
    const container = document.getElementById('ordersList');

    if (appState.orders.length === 0) {
        container.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box"></i>
                <p>No orders yet</p>
                <button class="btn btn-primary" onclick="showShop()">Start Shopping</button>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">${order.id}</span>
                <span class="order-status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-details">
                <div class="order-detail-item">
                    <span class="order-detail-label">Order Date</span>
                    <span class="order-detail-value">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Total</span>
                    <span class="order-detail-value">$${order.total.toFixed(2)}</span>
                </div>
                <div class="order-detail-item">
                    <span class="order-detail-label">Items</span>
                    <span class="order-detail-value">${order.items.length}</span>
                </div>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">View Details</button>
                <button class="btn btn-secondary" onclick="trackOrder('${order.id}')">Track Order</button>
            </div>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    const order = appState.orders.find(o => o.id === orderId);
    if (!order) return;

    const details = `
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h4>Shipping Address</h4>
        <p>${order.shipping.firstName} ${order.shipping.lastName}</p>
        <p>${order.shipping.address}</p>
        <p>${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipcode}</p>
        <h4>Items</h4>
        ${order.items.map(item => `<p>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`).join('')}
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
    `;

    showModal(details);
}

function trackOrder(orderId) {
    showNotification('Tracking information will be available soon', 'info');
}

// ============================================
// MESSAGING
// ============================================

function renderConversations() {
    const container = document.getElementById('conversationsList');
    
    const sellers = new Set();
    appState.orders.forEach(order => {
        order.items.forEach(item => {
            sellers.add(JSON.stringify({ id: item.sellerId, name: item.seller }));
        });
    });

    if (sellers.size === 0) {
        container.innerHTML = '<p style="color: var(--gray-color);">No conversations yet</p>';
        return;
    }

    container.innerHTML = Array.from(sellers).map(sellerStr => {
        const seller = JSON.parse(sellerStr);
        const messages = appState.messages[seller.id] || [];
        const lastMessage = messages[messages.length - 1];

        return `
            <div class="conversation-item ${appState.currentConversation?.id === seller.id ? 'active' : ''}" 
                 onclick="selectConversation(${seller.id}, '${seller.name}')">
                <div class="conversation-name">${seller.name}</div>
                <div class="conversation-preview">${lastMessage ? lastMessage.text.substring(0, 30) + '...' : 'No messages yet'}</div>
            </div>
        `;
    }).join('');
}

function selectConversation(sellerId, sellerName) {
    appState.currentConversation = { id: sellerId, name: sellerName };
    document.getElementById('noConversation').style.display = 'none';
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('chatSellerName').textContent = sellerName;
    renderChatMessages(sellerId);
}

function renderChatMessages(sellerId) {
    if (!appState.messages[sellerId]) {
        appState.messages[sellerId] = [];
    }

    const container = document.getElementById('chatMessages');
    const messages = appState.messages[sellerId];

    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender === 'user' ? 'sent' : 'received'}">
            <div class="message-content">${msg.text}</div>
            <div class="message-time">${new Date(msg.time).toLocaleTimeString()}</div>
        </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text || !appState.currentConversation) return;

    if (!appState.messages[appState.currentConversation.id]) {
        appState.messages[appState.currentConversation.id] = [];
    }

    appState.messages[appState.currentConversation.id].push({
        sender: 'user',
        text: text,
        time: new Date().toISOString()
    });

    input.value = '';
    renderChatMessages(appState.currentConversation.id);
    saveState();

    setTimeout(() => {
        appState.messages[appState.currentConversation.id].push({
            sender: 'seller',
            text: 'Thanks for your message! I\'ll get back to you soon.',
            time: new Date().toISOString()
        });
        renderChatMessages(appState.currentConversation.id);
        saveState();
    }, 1000);
}

function startChat(sellerId, sellerName) {
    showMessages();
    setTimeout(() => {
        selectConversation(sellerId, sellerName);
    }, 100);
}

function closeChat() {
    appState.currentConversation = null;
    document.getElementById('noConversation').style.display = 'flex';
    document.getElementById('chatWindow').style.display = 'none';
}

// ============================================
// PROFILE
// ============================================

function renderProfile() {
    document.getElementById('profileName').textContent = appState.currentUser.name;
    document.getElementById('profileEmail').textContent = appState.currentUser.email;

    document.getElementById('profileFullName').value = appState.currentUser.name;
    document.getElementById('profileEmailField').value = appState.currentUser.email;
    document.getElementById('profilePhoneField').value = appState.currentUser.phone;

    renderAddresses();
    renderWishlist();
    renderReviews();
}

function switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab + 'Tab').classList.add('active');
}

function handleProfileUpdate(e) {
    e.preventDefault();

    appState.currentUser.name = document.getElementById('profileFullName').value;
    appState.currentUser.email = document.getElementById('profileEmailField').value;
    appState.currentUser.phone = document.getElementById('profilePhoneField').value;

    saveState();
    renderProfile();
    showNotification('Profile updated successfully!', 'success');
}

function renderAddresses() {
    const container = document.getElementById('addressesList');

    if (!appState.addresses || appState.addresses.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-color);">No addresses saved yet</p>';
        return;
    }

    container.innerHTML = appState.addresses.map(addr => `
        <div class="address-card">
            <h4>${addr.type}</h4>
            <p>${addr.address}</p>
            <p>${addr.city}, ${addr.state} ${addr.zipcode}</p>
            <div class="address-card-actions">
                <button class="btn btn-secondary" onclick="editAddress(${addr.id})">Edit</button>
                <button class="btn btn-secondary" onclick="deleteAddress(${addr.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function addNewAddress() {
    const address = {
        id: Date.now(),
        type: 'Home',
        address: '',
        city: '',
        state: '',
        zipcode: ''
    };

    appState.addresses.push(address);
    saveState();
    renderAddresses();
    showNotification('New address added', 'success');
}

function editAddress(id) {
    showNotification('Edit functionality coming soon', 'info');
}

function deleteAddress(id) {
    appState.addresses = appState.addresses.filter(a => a.id !== id);
    saveState();
    renderAddresses();
    showNotification('Address deleted', 'info');
}

function renderWishlist() {
    const container = document.getElementById('wishlistGrid');

    if (appState.wishlist.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-color); grid-column: 1/-1;">No items in wishlist</p>';
        return;
    }

    container.innerHTML = appState.wishlist.map(product => createProductCard(product)).join('');
}

function renderReviews() {
    const container = document.getElementById('reviewsList');
    const allReviews = [];

    Object.entries(appState.reviews).forEach(([productId, reviews]) => {
        const product = products.find(p => p.id == productId);
        reviews.forEach(review => {
            allReviews.push({
                ...review,
                productId: productId,
                productName: product?.name
            });
        });
    });

    if (allReviews.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-color);">No reviews yet</p>';
        return;
    }

    container.innerHTML = allReviews.map(review => `
        <div class="review-card">
            <div class="review-card-header">
                <span class="review-card-title">${review.productName}</span>
                <span class="review-card-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p class="review-card-text">${review.text}</p>
            <p style="color: var(--gray-color); font-size: 0.9rem;">${new Date(review.date).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// ============================================
// UTILITIES
// ============================================

function updateUI() {
    updateCartCount();
}

function saveState() {
    localStorage.setItem('appState', JSON.stringify(appState));
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('productModal').classList.add('active');
}

function closeModal() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('productModal').classList.remove('active');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.key === 'Enter' && document.getElementById('messageInput') === document.activeElement) {
        sendMessage();
    }
});

// ============================================
// SLIDESHOW
// ============================================

let currentSlide = 0;
let slideshowInterval;

function initializeSlideshow() {
    if (products.length === 0) return;
    const slidesToShow = products.slice(0, 6);
    renderSlides(slidesToShow);
    startAutoSlideshow();
}

function renderSlides(slidesToShow) {
    const container = document.getElementById('slidesContainer');
    const dotsContainer = document.getElementById('slideDots');

    container.innerHTML = slidesToShow.map((product, index) => {
        const isImageFile = product.image.includes('.');
        return `
            <div class="slide">
                <div class="slide-image">
                    ${isImageFile ? `<img src="${product.image}" alt="${product.name}">` : product.image}
                </div>
                <div class="slide-content">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="slide-price">${formatPrice(product.price)}</div>
                    <div class="slide-rating">
                        <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</span>
                        <span>(${product.reviews} reviews)</span>
                    </div>
                    <div class="slide-actions">
                        <button class="slide-btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                        <button class="slide-btn-secondary" onclick="showProductDetail(${product.id})">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    dotsContainer.innerHTML = slidesToShow.map((_, index) => `
        <span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
    `).join('');

    currentSlide = 0;
    updateSlidePosition(document.querySelectorAll('.slide'));
}

function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide + 1) % slides.length;
    updateSlidePosition(slides);
    resetAutoSlideshow();
}

function prevSlide() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlidePosition(slides);
    resetAutoSlideshow();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    currentSlide = index;
    updateSlidePosition(slides);
    resetAutoSlideshow();
}

function updateSlidePosition(slides) {
    slides.forEach((slide, index) => {
        const offset = (index - currentSlide) * 100;
        slide.style.transform = `translateX(${offset}%)`;
        slide.style.zIndex = index === currentSlide ? 1 : 0;
    });

    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function startAutoSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function resetAutoSlideshow() {
    clearInterval(slideshowInterval);
    startAutoSlideshow();
}
