// ========== PRODUCT PAGE ==========
let currentProduct = null;

async function loadProductPage(productId) {
    try {
        currentProduct = await api.getProduct(productId);
        
        if (!currentProduct) {
            window.app.showNotification('Товар не найден', 'error');
            window.app.navigateTo('home');
            return;
        }
        
        // Fill product details
        document.getElementById('productImage').src = currentProduct.image_url || 'https://via.placeholder.com/400';
        document.getElementById('productName').textContent = currentProduct.name;
        document.getElementById('productPrice').textContent = window.app.formatPrice(currentProduct.price);
        document.getElementById('productDescription').textContent = currentProduct.description;
        document.getElementById('reviewsCount').textContent = `(${currentProduct.reviews_count || 0} отзывов)`;
        
        // Load seller info
        const seller = await api.getSeller(currentProduct.seller_id);
        document.getElementById('sellerName').textContent = seller.name;
        document.getElementById('sellerAvatar').src = seller.photo_url || 'https://via.placeholder.com/48';
        
        const rating = await api.getSellerRating(currentProduct.seller_id);
        document.getElementById('sellerRating').textContent = `★★★★★ (${rating.total_reviews})`;
        
        // Reset quantity
        document.getElementById('qtyInput').value = 1;
        
    } catch (error) {
        console.error('Load product error:', error);
        window.app.showNotification('Ошибка загрузки товара', 'error');
        window.app.navigateTo('home');
    }
}

// Quantity controls
document.getElementById('qtyMinus').addEventListener('click', () => {
    const input = document.getElementById('qtyInput');
    const value = parseInt(input.value) || 1;
    if (value > 1) input.value = value - 1;
});

document.getElementById('qtyPlus').addEventListener('click', () => {
    const input = document.getElementById('qtyInput');
    const value = parseInt(input.value) || 1;
    input.value = value + 1;
});

// Add to cart
document.getElementById('addCartBtn').addEventListener('click', async () => {
    if (!currentProduct) return;
    
    const quantity = parseInt(document.getElementById('qtyInput').value) || 1;
    
    try {
        await api.addToCart(currentProduct.id, quantity);
        window.app.showNotification('Товар добавлен в корзину', 'success');
        updateCartBadge();
        document.getElementById('qtyInput').value = 1;
    } catch (error) {
        window.app.showNotification('Ошибка при добавлении в корзину', 'error');
    }
});

// Chat with seller
document.getElementById('chatBtn').addEventListener('click', async () => {
    if (!currentProduct) return;
    
    try {
        const chat = await api.createOrGetChat(currentProduct.seller_id);
        window.app.navigateTo('chatDetail');
        loadChatDetail(chat.id);
    } catch (error) {
        window.app.showNotification('Ошибка при создании чата', 'error');
    }
});
