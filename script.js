// Product data
const products = [
    {
        id: 1,
        name: "Wireless Noise-Cancelling Headphones",
        price: 249.99,
        oldPrice: 299.99,
        image: "https://images.pexels.com/photos/12123393/pexels-photo-12123393.jpeg?auto=compress&cs=tinysrgb&w=600",
        description: "Experience premium sound quality with our next-generation noise-cancelling technology.",
        onSale: true
    },
    {
        id: 2,
        name: "Ultra-Slim Laptop",
        price: 1299.99,
        image: "https://images.pexels.com/photos/6053284/pexels-photo-6053284.jpeg?auto=compress&cs=tinysrgb&w=600",
        description: "Powerful performance in a lightweight design. Perfect for professionals on the go.",
        onSale: false
    },
    {
        id: 3,
        name: "Smart Fitness Watch",
        price: 179.99,
        oldPrice: 229.99,
        image: "https://images.pexels.com/photos/5081914/pexels-photo-5081914.jpeg?auto=compress&cs=tinysrgb&w=600",
        description: "Track your fitness goals, monitor your health, and stay connected throughout the day.",
        onSale: true
    },
    {
        id: 4,
        name: "4K Ultra HD Smart TV",
        price: 899.99,
        image: "https://images.pexels.com/photos/5202925/pexels-photo-5202925.jpeg?auto=compress&cs=tinysrgb&w=600",
        description: "Immersive viewing experience with vibrant colors and crystal-clear resolution.",
        onSale: false
    }
];

// DOM Elements
const productsContainer = document.querySelector('.products');
const cartIcon = document.querySelector('.cart-container');
const cartCount = document.querySelector('.cart-count');
const cartModal = document.querySelector('.cart-modal');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const checkoutBtn = document.querySelector('.checkout-btn');
const clearCartBtn = document.querySelector('.clear-cart-btn');
const themeToggleBtn = document.querySelector('.theme-toggle');
const overlay = document.querySelector('.overlay');
const toast = document.querySelector('.toast');

// State
let cart = [];
let isCartOpen = false;

// Initialize the app
function init() {
    renderProducts();
    loadCartFromLocalStorage();
    updateCartCount();
    applyUserPreferences();
    
    // Event listeners
    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    overlay.addEventListener('click', toggleCart);
    checkoutBtn.addEventListener('click', handleCheckout);
    clearCartBtn.addEventListener('click', clearCart);
    themeToggleBtn.addEventListener('click', toggleTheme);
}

// Render products
function renderProducts() {
    productsContainer.innerHTML = products.map(product => `
        <div class="product" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            ${product.onSale ? `<div class="sale-badge">SALE</div>` : ''}
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">
                    ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ''}
                    $${product.price.toFixed(2)}
                </p>
                <p class="product-description">${product.description}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// Handle adding product to cart
function handleAddToCart(e) {
    const productId = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const existingCartItem = cart.find(item => item.id === productId);
        
        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        // Show animation for cart count
        cartCount.classList.add('bump');
        setTimeout(() => {
            cartCount.classList.remove('bump');
        }, 300);
        
        // Update UI
        updateCartCount();
        saveCartToLocalStorage();
        renderCartItems();
        
        // Show toast notification
        showToast('Item added to cart!');
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Toggle cart modal
function toggleCart() {
    isCartOpen = !isCartOpen;
    
    if (isCartOpen) {
        cartModal.classList.add('open');
        overlay.classList.add('show');
        renderCartItems();
    } else {
        cartModal.classList.remove('open');
        overlay.classList.remove('show');
    }
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        cartTotal.textContent = 'Total: $0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-id="${item.id}">✕</button>
        </div>
    `).join('');
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', decreaseQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', increaseQuantity);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', removeItem);
    });
    
    // Update total
    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Decrease quantity
function decreaseQuantity(e) {
    const productId = parseInt(e.target.dataset.id);
    const cartItemIndex = cart.findIndex(item => item.id === productId);
    
    if (cartItemIndex !== -1) {
        cart[cartItemIndex].quantity -= 1;
        
        if (cart[cartItemIndex].quantity <= 0) {
            cart.splice(cartItemIndex, 1);
        }
        
        updateCartCount();
        saveCartToLocalStorage();
        renderCartItems();
    }
}

// Increase quantity
function increaseQuantity(e) {
    const productId = parseInt(e.target.dataset.id);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem) {
        cartItem.quantity += 1;
        
        updateCartCount();
        saveCartToLocalStorage();
        renderCartItems();
    }
}

// Remove item from cart
function removeItem(e) {
    const productId = parseInt(e.target.dataset.id);
    const cartItemIndex = cart.findIndex(item => item.id === productId);
    
    if (cartItemIndex !== -1) {
        const removedItem = cart[cartItemIndex];
        
        // Add fade out animation
        const cartItem = e.target.closest('.cart-item');
        cartItem.style.animation = 'fadeOut 0.3s ease forwards';
        
        setTimeout(() => {
            cart.splice(cartItemIndex, 1);
            updateCartCount();
            saveCartToLocalStorage();
            renderCartItems();
            showToast(`${removedItem.name} removed from cart`);
        }, 300);
    }
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showToast('Your cart is already empty!');
        return;
    }
    
    // Add animation to cart items
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'fadeOut 0.3s ease forwards';
        }, index * 100);
    });
    
    setTimeout(() => {
        cart = [];
        updateCartCount();
        saveCartToLocalStorage();
        renderCartItems();
        showToast('Cart cleared successfully!');
    }, cartItems.length * 100 + 200);
}

// Handle checkout
function handleCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    showToast('Order placed successfully!');
    cart = [];
    updateCartCount();
    saveCartToLocalStorage();
    renderCartItems();
    
    // Close cart after checkout
    setTimeout(() => {
        toggleCart();
    }, 1500);
}

// Toggle theme
function toggleTheme() {
    const body = document.body;
    const isDarkMode = body.classList.toggle('dark-mode');
    
    // Save user preference to localStorage
    saveUserPreference('darkMode', isDarkMode);
    
    // Show toast notification
    showToast(isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
}

// Save user preference to localStorage
function saveUserPreference(key, value) {
    const preferences = getUserPreferences();
    preferences[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Get user preferences from localStorage
function getUserPreferences() {
    const preferences = localStorage.getItem('userPreferences');
    return preferences ? JSON.parse(preferences) : {};
}

// Apply user preferences
function applyUserPreferences() {
    const preferences = getUserPreferences();
    
    // Apply dark mode if previously set
    if (preferences.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            toast.classList.remove('hide');
        }, 500);
    }, 3000);
}

// Add fadeOut animation
document.styleSheets[0].insertRule(`
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
}`, document.styleSheets[0].cssRules.length);

// Initialize the app
init();
