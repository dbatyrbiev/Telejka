// ========== MAIN APPLICATION ========== 
const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;
let currentPage = 'home';

// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ========== PAGE NAVIGATION ==========
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(el => el.style.display = 'none');
    
    // Show selected page
    const pageEl = document.getElementById(page + 'Page');
    if (pageEl) {
        pageEl.style.display = 'block';
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
    
    currentPage = page;
    
    // Load page content
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'catalog':
            loadCatalogPage();
            break;
        case 'chats':
            loadChatsPage();
            break;
        case 'profile':
            loadProfilePage();
            break;
    }
}

// ========== EVENT LISTENERS ==========
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        navigateTo(item.dataset.page);
    });
});

// Cart button
document.getElementById('cartBtn').addEventListener('click', () => {
    navigateTo('cart');
});

// ========== AUTHENTICATION ==========
async function checkAuth() {
    if (!token) {
        showLoginModal();
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            return true;
        } else {
            localStorage.removeItem('token');
            token = null;
            showLoginModal();
            return false;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLoginModal();
        return false;
    }
}

function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    
    document.getElementById('buyerBtn').addEventListener('click', () => {
        registerUser('buyer');
    });
    
    document.getElementById('sellerBtn').addEventListener('click', () => {
        registerUser('seller');
    });
}

async function registerUser(userType) {
    const tgUser = tg.initDataUnsafe?.user;
    
    if (!tgUser) {
        alert('Ошибка: не удалось получить данные пользователя Telegram');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                telegramId: tgUser.id,
                username: tgUser.username || `user_${tgUser.id}`,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                userType: userType,
                photoUrl: tgUser.photo_url
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            
            document.getElementById('loginModal').classList.remove('active');
            navigateTo('home');
        } else {
            alert('Ошибка регистрации');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Ошибка регистрации');
    }
}

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        padding: 12px 16px;
        background: ${type === 'success' ? '#31a24c' : type === 'error' ? '#ff3b30' : '#0088cc'};
        color: white;
        border-radius: 8px;
        z-index: 2000;
        animation: slideDown 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
        navigateTo('home');
    }
});

// ========== KEYBOARD ANIMATION ==========
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(-100px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export functions for other modules
window.app = {
    navigateTo,
    showNotification,
    formatPrice,
    formatDate,
    API_URL,
    token: () => token,
    currentUser: () => currentUser
};
