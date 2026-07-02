// Telegram Mini App
window.addEventListener('load', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    
    // Настройки UI
    tg.setHeaderColor('#ffffff');
    tg.setBackgroundColor('#ffffff');
    
    // Получить данные пользователя
    const initData = tg.initData;
    const user = tg.initDataUnsafe?.user;
    
    console.log('🤖 Telegram WebApp initialized');
    console.log('👤 User:', user);
    
    // Сохранить Telegram данные
    window.telegram = {
        tg: tg,
        initData: initData,
        user: user
    };
    
    // Отправить данные на backend для верификации
    if (initData) {
        verifyTelegramData(initData);
    }
});

async function verifyTelegramData(initData) {
    try {
        const response = await fetch('https://api.telejka.com/api/telegram/verify/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                init_data: initData
            })
        });
        
        const data = await response.json();
        
        if (data.access_token) {
            // Сохранить токен и автоматически залогиниться
            window.app.setToken(data.access_token);
            window.app.user = data.user;
            window.app.navigateTo('home');
        } else if (data.token) {
            window.app.setToken(data.token);
            window.app.navigateTo('home');
        }
    } catch (error) {
        console.error('Telegram verification failed:', error);
        // Fallback to regular login
        window.app.navigateTo('login');
    }
}

// Обработка кнопок Telegram
function setupTelegramButtons() {
    if (!window.telegram) return;
    
    const tg = window.telegram.tg;
    
    // Main Button
    tg.MainButton.textColor = '#FFFFFF';
    tg.MainButton.color = '#2cab37';
    
    // Back Button
    tg.BackButton.onClick(() => {
        window.history.back();
    });
}

// Telegram Payments (опционально)
async function processTelegramPayment(amount, description) {
    // TODO: Интеграция с Telegram Payments
    console.log('Processing payment:', amount, description);
}
