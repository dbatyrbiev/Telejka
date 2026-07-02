// ========== SELLER PAGE ==========
async function loadSellerPage(sellerId) {
    try {
        const seller = await api.getSeller(sellerId);
        const products = await api.getSellerProducts(sellerId);
        const rating = await api.getSellerRating(sellerId);
        
        // Fill seller info
        document.getElementById('sellerPageAvatar').src = seller.photo_url || 'https://via.placeholder.com/120';
        document.getElementById('sellerPageName').textContent = seller.name;
        document.getElementById('sellerPageUsername').textContent = `@${seller.username}`;
        document.getElementById('sellerPageRating').textContent = `★★★★★ (${rating.total_reviews} отзывов)`;
        document.getElementById('sellerPageSales').textContent = `${rating.total_sales || 0} продаж`;
        document.getElementById('sellerPageDescription').textContent = seller.description || 'Нет описания';
        
        // Load products
        const productsGrid = document.getElementById('sellerProducts');
        productsGrid.innerHTML = '';
        
        if (!products || products.length === 0) {
            productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Нет товаров</div>';
            return;
        }
        
        products.forEach(product => {
            const card = createProductCard(product);
            productsGrid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Load seller error:', error);
        window.app.showNotification('Ошибка загрузки продавца', 'error');
    }
}

// Follow seller button
document.getElementById('followBtn').addEventListener('click', async () => {
    try {
        // API call for follow would go here
        const btn = document.getElementById('followBtn');
        btn.textContent = 'Следите';
        btn.classList.add('following');
        window.app.showNotification('Вы подписаны на продавца', 'success');
    } catch (error) {
        window.app.showNotification('Ошибка при подписке', 'error');
    }
});

// Chat with seller
document.getElementById('chatSellerBtn').addEventListener('click', async () => {
    try {
        const seller = window.app.currentUser(); // Get seller ID from page context
        const chat = await api.createOrGetChat(seller.id);
        window.app.navigateTo('chatDetail');
        loadChatDetail(chat.id);
    } catch (error) {
        window.app.showNotification('Ошибка при создании чата', 'error');
    }
});

// Sort products
document.getElementById('sellerSortSelect').addEventListener('change', async (e) => {
    const sort = e.target.value;
    const sellerId = new URLSearchParams(window.location.search).get('seller');
    
    try {
        let products = await api.getSellerProducts(sellerId);
        
        switch(sort) {
            case 'price-asc':
                products.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                products.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                products.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                products.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        
        const productsGrid = document.getElementById('sellerProducts');
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = createProductCard(product);
            productsGrid.appendChild(card);
        });
    } catch (error) {
        window.app.showNotification('Ошибка при сортировке', 'error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const sellerPage = document.getElementById('sellerPage');
    if (sellerPage) {
        const sellerId = new URLSearchParams(window.location.search).get('seller') || 1;
        loadSellerPage(sellerId);
    }
});
