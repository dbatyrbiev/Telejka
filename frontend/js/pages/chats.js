// ========== CHATS PAGE ==========
async function loadChatsPage() {
    try {
        const chats = await api.getChats();
        const chatsList = document.getElementById('chatsList');
        
        if (!chats || chats.length === 0) {
            chatsList.innerHTML = '<div style="text-align: center; padding: 40px 16px; color: var(--tg-text-secondary);">Нет чатов</div>';
            return;
        }
        
        chatsList.innerHTML = '';
        
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.onclick = () => {
                window.app.navigateTo('chatDetail');
                loadChatDetail(chat.id);
            };
            
            const otherUser = chat.user1.id === window.app.currentUser().id ? chat.user2 : chat.user1;
            const lastMessage = chat.messages?.[chat.messages.length - 1];
            
            chatItem.innerHTML = `
                <img src="${otherUser.photo_url || 'https://via.placeholder.com/48'}" alt="${otherUser.username}" class="chat-avatar">
                <div class="chat-item-content">
                    <div class="chat-item-name">${otherUser.username}</div>
                    <div class="chat-item-preview">${lastMessage?.message || 'Нет сообщений'}</div>
                </div>
                <div class="chat-item-date">${lastMessage ? window.app.formatDate(lastMessage.created_at) : ''}</div>
            `;
            chatsList.appendChild(chatItem);
        });
    } catch (error) {
        console.error('Load chats error:', error);
        window.app.showNotification('Ошибка загрузки чатов', 'error');
    }
}

let currentChatId = null;

async function loadChatDetail(chatId) {
    try {
        currentChatId = chatId;
        const messages = await api.getChatMessages(chatId);
        const messagesContainer = document.getElementById('chatMessages');
        
        messagesContainer.innerHTML = '';
        
        if (messages && messages.length > 0) {
            messages.forEach(msg => {
                const msgEl = document.createElement('div');
                msgEl.className = `chat-message ${msg.sender_id === window.app.currentUser().id ? 'sent' : 'received'}`;
                msgEl.innerHTML = `
                    <div class="chat-message-content">${msg.message}</div>
                    <div class="chat-message-time">${window.app.formatDate(msg.created_at)}</div>
                `;
                messagesContainer.appendChild(msgEl);
            });
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    } catch (error) {
        console.error('Load chat detail error:', error);
        window.app.showNotification('Ошибка загрузки чата', 'error');
    }
}

// Send message
document.getElementById('sendBtn').addEventListener('click', async () => {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || !currentChatId) return;
    
    try {
        await api.sendMessage(currentChatId, message);
        input.value = '';
        loadChatDetail(currentChatId);
    } catch (error) {
        window.app.showNotification('Ошибка при отправке сообщения', 'error');
    }
});

// Auto-refresh chats
setInterval(() => {
    if (window.app && currentPage === 'chats') {
        loadChatsPage();
    }
    if (currentChatId) {
        loadChatDetail(currentChatId);
    }
}, 3000);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const chatsPage = document.getElementById('chatsPage');
    if (chatsPage) {
        loadChatsPage();
    }
});
