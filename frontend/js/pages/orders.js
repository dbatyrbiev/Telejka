// ========== ORDERS PAGE ==========
async function loadOrdersPage() {
    try {
        const orders = await api.getOrders();
        const ordersContainer = document.getElementById('ordersList');
        
        if (!orders || orders.length === 0) {
            ordersContainer.innerHTML = '<div style="text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Нет заказов</div>';
            return;
        }
        
        ordersContainer.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            const statusColor = getStatusColor(order.status);
            const statusText = getStatusText(order.status);
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-number">Заказ #${order.order_number}</div>
                    <div class="order-status" style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${statusText}
                    </div>
                </div>
                <div class="order-date">${window.app.formatDate(order.created_at)}</div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 4px 0;">
                            <span>${item.product.name} x${item.quantity}</span>
                            <span>${window.app.formatPrice(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="border-top: 1px solid var(--tg-border); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Итого:</span>
                    <span>${window.app.formatPrice(order.total_amount)}</span>
                </div>
                <button class="btn-secondary" onclick="viewOrder(${order.id})" style="width: 100%; margin-top: 8px;">Подробнее</button>
            `;
            ordersContainer.appendChild(orderCard);
        });
    } catch (error) {
        console.error('Load orders error:', error);
        window.app.showNotification('Ошибка загрузки заказов', 'error');
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'pending': return '#FFA500';
        case 'confirmed': return '#0088cc';
        case 'shipped': return '#4CAF50';
        case 'delivered': return '#8BC34A';
        case 'cancelled': return '#f44336';
        default: return '#999999';
    }
}

function getStatusText(status) {
    const statuses = {
        'pending': 'В ожидании',
        'confirmed': 'Подтвержден',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    return statuses[status] || status;
}

async function viewOrder(orderId) {
    try {
        const order = await api.getOrder(orderId);
        // You can expand this to show detailed order page
        window.app.showNotification(`Заказ #${order.order_number}`, 'info');
    } catch (error) {
        window.app.showNotification('Ошибка загрузки заказа', 'error');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const ordersPage = document.getElementById('ordersPage');
    if (ordersPage) {
        loadOrdersPage();
    }
});
