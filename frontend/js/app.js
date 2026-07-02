// ========== MAIN APP ==========
let currentPage = 'home';

class AppState {
    constructor() {
        this.user = null;
        this.token = null;
        this.API_URL = 'https://api.telejka.com';
    }

    currentUser() {
        return this.user;
    }

    token() {
        return this.token;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    loadToken() {
        this.token = localStorage.getItem('token');
        return this.token;
    }

    async checkAuth() {
        try {
            if (!this.token) {
                this.loadToken();
            }
            if (!this.token) {
                this.navigateTo('login');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    navigateTo(page) {
        currentPage = page;
        
        // Hide all pages
        document.querySelectorAll('[class*="page"]').forEach(el => {
            if (el.id && el.id.endsWith('Page')) {
                el.style.display = 'none';
            }
        });

        // Show selected page
        const pageEl = document.getElementById(`${page}Page`);
        if (pageEl) {
            pageEl.style.display = 'block';
        }

        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Scroll to top
        window.scrollTo(0, 0);

        // Load page data
        this.loadPageData(page);
    }

    loadPageData(page) {
        switch(page) {
            case 'home':
                if (typeof loadHomePage === 'function') {
                    loadHomePage();
                }
                break;
            case 'catalog':
                if (typeof loadCatalogPage === 'function') {
                    loadCatalogPage();
                }
                break;
            case 'cart':
                if (typeof loadCartPage === 'function') {
                    loadCartPage();
                }
                break;
            case 'orders':
                if (typeof loadOrdersPage === 'function') {
                    loadOrdersPage();
                }
                break;
            case 'chats':
                if (typeof loadChatsPage === 'function') {
                    loadChatsPage();
                }
                break;
            case 'profile':
                if (typeof loadProfilePage === 'function') {
                    loadProfilePage();
                }
                break;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatPrice(price) {
        return `${price.toFixed(2)} ₽`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        // Minutes ago
        if (diff < 60000) {
            return 'только что';
        }

        // Hours ago
        if (diff < 3600000) {
            const hours = Math.floor(diff / 60000);
            return `${hours}m ago`;
        }

        // Today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }

        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'вчера';
        }

        // This week
        if (diff < 604800000) {
            return date.toLocaleDateString('ru-RU', { weekday: 'short' });
        }

        return date.toLocaleDateString('ru-RU');
    }
}

// Initialize app
window.app = new AppState();

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) {
            window.app.navigateTo(page);
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    window.app.loadToken();
    
    if (await window.app.checkAuth()) {
        window.app.navigateTo('home');
    }
});