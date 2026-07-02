// ========== API CLIENT ==========
class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL || 'https://api.telejka.com';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (window.app && window.app.token) {
            headers['Authorization'] = `Bearer ${window.app.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.app.setToken(null);
                    window.app.navigateTo('login');
                }
                throw new Error(`API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    // Auth
    async login(phone, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ phone, password }),
        });
        if (data.token) {
            window.app.setToken(data.token);
            window.app.user = data.user;
        }
        return data;
    }

    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (data.token) {
            window.app.setToken(data.token);
            window.app.user = data.user;
        }
        return data;
    }

    async getCurrentUser() {
        const data = await this.request('/users/me');
        window.app.user = data;
        return data;
    }

    // Products
    async getProducts(page = 1, limit = 20, filters = {}) {
        let query = `?page=${page}&limit=${limit}`;
        if (filters.category) query += `&category=${filters.category}`;
        if (filters.search) query += `&search=${filters.search}`;
        return this.request(`/products${query}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    // Cart
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(productId, quantity) {
        return this.request('/cart/items', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
    }

    async updateCartItem(cartItemId, quantity) {
        return this.request(`/cart/items/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
    }

    async removeFromCart(cartItemId) {
        return this.request(`/cart/items/${cartItemId}`, {
            method: 'DELETE',
        });
    }

    async clearCart() {
        return this.request('/cart', {
            method: 'DELETE',
        });
    }

    // Orders
    async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    }

    async getOrders() {
        return this.request('/orders');
    }

    async getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    // Sellers
    async getSeller(id) {
        return this.request(`/sellers/${id}`);
    }

    async getSellerProducts(sellerId) {
        return this.request(`/sellers/${sellerId}/products`);
    }

    async getSellerRating(sellerId) {
        return this.request(`/sellers/${sellerId}/rating`);
    }

    // Chats
    async getChats() {
        return this.request('/chats');
    }

    async getChatMessages(chatId) {
        return this.request(`/chats/${chatId}/messages`);
    }

    async sendMessage(chatId, message) {
        return this.request(`/chats/${chatId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        });
    }

    async createOrGetChat(userId) {
        return this.request('/chats', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }
}

// Initialize API client
const api = new APIClient();
