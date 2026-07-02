// ========== CATALOG PAGE ==========
async function loadCatalogPage() {
    try {
        const products = await api.getProducts(1, 50);
        const catalogGrid = document.getElementById('catalogGrid');
        
        if (!products || products.length === 0) {
            catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Нет товаров</div>';
            return;
        }
        
        catalogGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Load catalog error:', error);
        window.app.showNotification('Ошибка загрузки каталога', 'error');
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        loadCatalogPage();
        return;
    }
    
    try {
        const products = await api.getProducts(1, 50);
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query)
        );
        
        const catalogGrid = document.getElementById('catalogGrid');
        catalogGrid.innerHTML = '';
        
        if (filtered.length === 0) {
            catalogGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Товары не найдены</div>';
            return;
        }
        
        filtered.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });
    } catch (error) {
        window.app.showNotification('Ошибка при поиске', 'error');
    }
});

// Sort functionality
document.getElementById('sortSelect').addEventListener('change', async (e) => {
    const sort = e.target.value;
    try {
        let products = await api.getProducts(1, 50);
        
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
        }
        
        const catalogGrid = document.getElementById('catalogGrid');
        catalogGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });
    } catch (error) {
        window.app.showNotification('Ошибка при сортировке', 'error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const catalogPage = document.getElementById('catalogPage');
    if (catalogPage) {
        loadCatalogPage();
    }
});
