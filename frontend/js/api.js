// ========== API MODULE ==========
class API {
    constructor(baseURL, tokenGetter) {
        this.baseURL = baseURL;
        this.tokenGetter = tokenGetter;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.tokenGetter();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.reload();
                }
                const error = await response.json();
                throw new Error(error.error || 'API Error');
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products
    getProducts(page = 1, limit = 20, filters = {}) {
        const params = new URLSearchParams({
            page,
            limit,
            ...filters
        });
        return this.request(`/products?${params}`);
    }

    getProduct(id) {
        return this.request(`/products/${id}`);
    }

    createProduct(data) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    updateProduct(id, data) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Cart
    getCart() {
        return this.request('/cart');
    }

    addToCart(productId, quantity = 1) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    updateCartItem(cartItemId, quantity) {
        return this.request(`/cart/${cartItemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    removeFromCart(cartItemId) {
        return this.request(`/cart/${cartItemId}`, {
            method: 'DELETE'
        });
    }

    clearCart() {
        return this.request('/cart', {
            method: 'DELETE'
        });
    }

    // Orders
    getOrders() {
        return this.request('/orders');
    }

    getOrder(id) {
        return this.request(`/orders/${id}`);
    }

    createOrder(data) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    updateOrder(id, data) {
        return this.request(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Chat
    getChats() {
        return this.request('/chat');
    }

    getChatMessages(chatId) {
        return this.request(`/chat/${chatId}`);
    }

    sendMessage(chatId, message) {
        return this.request(`/chat/${chatId}/message`, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }

    createOrGetChat(otherUserId) {
        return this.request('/chat/or-create', {
            method: 'POST',
            body: JSON.stringify({ otherUserId })
        });
    }

    // Reviews
    getReviews(productId) {
        return this.request(`/reviews?productId=${productId}`);
    }

    createReview(data) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Sellers
    getSeller(id) {
        return this.request(`/sellers/${id}`);
    }

    getSellerProducts(id) {
        return this.request(`/sellers/${id}/products`);
    }

    getSellerRating(id) {
        return this.request(`/sellers/${id}/rating`);
    }
}

// Initialize API
const api = new API(window.app.API_URL, () => window.app.token());

window.api = api;
