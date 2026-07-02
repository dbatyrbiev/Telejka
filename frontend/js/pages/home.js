// ========== HOME PAGE ==========
async function loadHomePage() {
    try {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        // Load featured products
        const products = await api.getProducts(1, 10);
        
        if (!products || products.length === 0) {
            productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Нет товаров</div>';
            return;
        }
        
        products.forEach(product => {
            const card = createProductCard(product);
            productsGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Load home page error:', error);
        window.app.showNotification('Ошибка загрузки товаров', 'error');
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-wrapper">
            <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}">
        </div>
        <div class="product-card-content">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">${window.app.formatPrice(product.price)}</div>
            <div class="product-rating">
                <span class="stars">★★★★★</span>
            </div>
            <div class="product-card-actions">
                <button class="btn-small btn-view" onclick="viewProduct(${product.id})">Просмотр</button>
                <button class="btn-small btn-add" onclick="quickAddToCart(${product.id})">Добавить</button>
            </div>
        </div>
    `;
    return card;
}

function viewProduct(productId) {
    window.app.navigateTo('product');
    loadProductPage(productId);
}

async function quickAddToCart(productId) {
    try {
        await api.addToCart(productId, 1);
        window.app.showNotification('Товар добавлен в корзину', 'success');
        updateCartBadge();
    } catch (error) {
        window.app.showNotification('Ошибка при добавлении в корзину', 'error');
    }
}

// Category filtering
document.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', async () => {
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        
        const category = item.dataset.category;
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        try {
            let products;
            if (category === 'all') {
                products = await api.getProducts(1, 20);
            } else {
                products = await api.getProducts(1, 20, { category });
            }
            
            products.forEach(product => {
                const card = createProductCard(product);
                productsGrid.appendChild(card);
            });
        } catch (error) {
            window.app.showNotification('Ошибка загрузки категории', 'error');
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category-item')[0].classList.add('active');
});
