// ========== PROFILE PAGE ==========
async function loadProfilePage() {
    try {
        const user = window.app.currentUser();
        
        if (!user) {
            window.app.showNotification('Ошибка загрузки профиля', 'error');
            return;
        }
        
        // Fill profile info
        document.getElementById('profileAvatar').src = user.photo_url || 'https://via.placeholder.com/120';
        document.getElementById('profileName').textContent = user.first_name || user.username;
        document.getElementById('profileUsername').textContent = `@${user.username}`;
        document.getElementById('profileType').textContent = user.user_type === 'seller' ? 'Продавец' : 'Покупатель';
        
        // Load seller specific data if seller
        if (user.user_type === 'seller') {
            document.getElementById('sellerStatsDiv').style.display = 'block';
            
            try {
                const rating = await api.getSellerRating(user.id);
                document.getElementById('sellerRating').textContent = `★★★★★ (${rating.total_reviews} отзывов)`;
                document.getElementById('totalSales').textContent = rating.total_sales || '0';
            } catch (error) {
                console.error('Load seller stats error:', error);
            }
        }
        
    } catch (error) {
        console.error('Load profile error:', error);
        window.app.showNotification('Ошибка загрузки профиля', 'error');
    }
}

// Edit profile
document.getElementById('editProfileBtn').addEventListener('click', () => {
    const modal = document.getElementById('editProfileModal');
    const user = window.app.currentUser();
    
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editFirstName').value = user.first_name || '';
    document.getElementById('editLastName').value = user.last_name || '';
    
    modal.classList.add('active');
});

// Save profile
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const username = document.getElementById('editUsername').value;
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    
    if (!username || !firstName) {
        window.app.showNotification('Заполните все поля', 'error');
        return;
    }
    
    try {
        // API call for profile update would go here
        window.app.showNotification('Профиль обновлен', 'success');
        document.getElementById('editProfileModal').classList.remove('active');
        loadProfilePage();
    } catch (error) {
        window.app.showNotification('Ошибка при обновлении профиля', 'error');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('token');
        window.location.reload();
    }
});

// Settings
document.getElementById('settingsBtn').addEventListener('click', () => {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
});

// Close modals
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('active');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const profilePage = document.getElementById('profilePage');
    if (profilePage) {
        loadProfilePage();
    }
});
