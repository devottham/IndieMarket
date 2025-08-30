document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartItemTemplate = document.getElementById('cart-item-template');
    const cartSummary = document.getElementById('cart-summary');
    const cartTotalPriceEl = document.getElementById('cart-total-price');
    const cartCountEl = document.getElementById('cart-count');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountEl) {
            cartCountEl.textContent = totalItems;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty. <a href="/">Continue Shopping</a></p>';
            cartSummary.classList.add('hidden');
            return;
        }

        cartSummary.classList.remove('hidden');
        let totalPrice = 0;

        cart.forEach((item, index) => {
            const card = cartItemTemplate.content.cloneNode(true);
            
            card.querySelector('.cart-item-image').src = item.image;
            card.querySelector('.cart-item-name').textContent = item.name;
            card.querySelector('.cart-item-price').textContent = `₹${item.price.toLocaleString('en-IN')}`;
            
            const quantityInput = card.querySelector('.cart-item-quantity');
            quantityInput.value = item.quantity;
            quantityInput.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity > 0) {
                    cart[index].quantity = newQuantity;
                    saveCart();
                }
            });

            const removeBtn = card.querySelector('.remove-item-btn');
            removeBtn.addEventListener('click', () => {
                cart.splice(index, 1);
                saveCart();
            });
            
            cartItemsContainer.appendChild(card);
            totalPrice += item.price * item.quantity;
        });

        cartTotalPriceEl.textContent = totalPrice.toLocaleString('en-IN');
    }

    // --- THIS IS THE NEW CODE ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.location.href = '/checkout.html';
        });
    }
    // --- END OF NEW CODE ---

    // Initial render
    renderCartItems();
    updateCartCount();
});