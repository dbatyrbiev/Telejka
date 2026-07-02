// ========== CART PAGE ==========
async function loadCartPage() {
    try {
        const cart = await api.getCart();
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cart || cart.items.length === 0) {
            cartItemsContainer.innerHTML = '<div style="text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Корзина пуста</div>';
            cartSummary.style.display = 'none';
            return;
        }
        
        cartSummary.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        
        cart.items.forEach(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.product.image_url || 'https://via.placeholder.com/80'}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-content">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">${window.app.formatPrice(item.product.price)}</div>
                    <div class="cart-item-qty">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" style="background: none; border: none; cursor: pointer; color: var(--tg-primary);">−</button>
                        <span style="margin: 0 8px;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" style="background: none; border: none; cursor: pointer; color: var(--tg-primary);">+</button>
                    </div>
                </div>
                <div class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        // Update summary
        const subtotal = total;
        const shipping = 0;
        const tax = Math.round(subtotal * 0.1);
        const grandTotal = subtotal + shipping + tax;
        
        document.getElementById('subtotal').textContent = window.app.formatPrice(subtotal);
        document.getElementById('shipping').textContent = window.app.formatPrice(shipping);
        document.getElementById('tax').textContent = window.app.formatPrice(tax);
        document.getElementById('total').textContent = window.app.formatPrice(grandTotal);
        
    } catch (error) {
        console.error('Load cart error:', error);
        window.app.showNotification('Ошибка загрузки корзины', 'error');
    }
}

async function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(cartItemId);
        return;
    }
    
    try {
        await api.updateCartItem(cartItemId, newQuantity);
        loadCartPage();
    } catch (error) {
        window.app.showNotification('Ошибка при обновлении количества', 'error');
    }
}

async function removeFromCart(cartItemId) {
    try {
        await api.removeFromCart(cartItemId);
        loadCartPage();
        updateCartBadge();
        window.app.showNotification('Товар удален из корзины', 'success');
    } catch (error) {
        window.app.showNotification('Ошибка при удалении товара', 'error');
    }
}

async function updateCartBadge() {
    try {
        const cart = await api.getCart();
        const badge = document.getElementById('cartBadge');
        const count = cart?.items?.length || 0;
        
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Update badge error:', error);
    }
}

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', async () => {
    try {
        const cart = await api.getCart();
        if (!cart || cart.items.length === 0) {
            window.app.showNotification('Корзина пуста', 'error');
            return;
        }
        
        // Create order
        const order = await api.createOrder({
            items: cart.items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }))
        });
        
        // Clear cart
        await api.clearCart();
        
        // Show success modal
        const modal = document.getElementById('successModal');
        document.getElementById('orderNumber').textContent = order.order_number;
        modal.classList.add('active');
        
        // Close modal after 3 seconds
        setTimeout(() => {
            modal.classList.remove('active');
            window.app.navigateTo('orders');
        }, 3000);
        
        updateCartBadge();
    } catch (error) {
        window.app.showNotification('Ошибка при оформлении заказа', 'error');
    }
});

// Close modal
document.querySelectorAll('[onclick*="closeModal"]').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('active');
    });
});

// Initialize cart badge
document.addEventListener('DOMContentLoaded', updateCartBadge);
