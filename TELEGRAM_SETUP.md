# Telegram Mini App Integration Guide

## 🤖 Регистрация Telegram Bot

### Шаг 1: Создать бота
1. Напиши @BotFather в Telegram
2. Команда `/newbot`
3. Выбери имя и username для бота
4. Получишь TOKEN

### Шаг 2: Настроить Web App

```python
# backend/telegram_bot.py
import logging
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
WEB_APP_URL = "https://yourdomain.com/frontend/index.html"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send a message with a web app button."""
    web_app_info = WebAppInfo(url=WEB_APP_URL)
    keyboard = [
        [
            InlineKeyboardButton(
                "🛍️ Открыть Telejka",
                web_app=web_app_info
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "Добро пожаловать в Telejka! 🎉\n\nНажмите кнопку ниже чтобы открыть магазин:",
        reply_markup=reply_markup
    )

async def main():
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    await application.run_polling()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
```

### Шаг 3: Интеграция в Mini App

```javascript
// frontend/js/telegram.js

// Получить данные от Telegram
const tg = window.Telegram.WebApp;
tg.ready();

// Инициализировать app
window.app.tg = tg;
window.app.initData = tg.initData;
window.app.userId = tg.initDataUnsafe?.user?.id;
window.app.userName = tg.initDataUnsafe?.user?.username;

// Отправить данные на backend для проверки
fetch('https://api.telejka.com/api/telegram/verify/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        init_data: tg.initData
    })
})
.then(res => res.json())
.then(data => {
    if (data.token) {
        window.app.setToken(data.token);
        window.app.navigateTo('home');
    }
});

// Настроить UI
tg.setHeaderColor('#ffffff');
tg.setBackgroundColor('#ffffff');
tg.MainButton.text = 'Оплатить';
tg.MainButton.show();
```

## 📱 Добавление данных в систему

### Способ 1: Через Admin Panel

```
1. Перейти: http://localhost:8000/admin/
2. Username: admin
3. Password: admin123
4. Добавить товары, категории, продавцов
```

### Способ 2: Через API

#### Авторизация

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seller1",
    "password": "seller123"
  }'
```

Ответ:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Создать товар

```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest Apple smartphone",
    "price": "999.99",
    "category": "electronics",
    "image_url": "https://...",
    "stock": 50
  }'
```

### Способ 3: Скрипт инициализации

```bash
# Загрузить тестовые данные
python backend/load_data.py
```

## 🚀 Запуск системы

### С Docker

```bash
# 1. Скопировать .env
cp .env.example .env

# 2. Установить TELEGRAM_BOT_TOKEN в .env

# 3. Запустить
docker-compose up -d

# 4. Инициализировать БД
docker-compose exec backend python backend/init.sh
```

### Без Docker

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 2. Frontend (в другом терминале)
cd frontend
python -m http.server 3000
```

## 🔗 Endpoints для Mini App

### Аутентификация
```
POST /api/telegram/verify/
  Проверить initData от Telegram и получить JWT token

POST /api/auth/token/
  Получить token для обычной аутентификации
```

### Товары
```
GET /api/products/
  Список товаров

GET /api/products/{id}/
  Детали товара

POST /api/products/
  Создать товар (только продавцы)
```

### Корзина
```
GET /api/cart/get_cart/
  Получить корзину

POST /api/cart/add_item/
  Добавить товар

POST /api/cart/remove_item/
  Удалить товар
```

### Заказы
```
GET /api/orders/
  Мои заказы

POST /api/orders/
  Создать заказ
```

### Чаты
```
GET /api/chats/
  Список чатов

POST /api/chats/
  Создать чат

POST /api/chats/{id}/send_message/
  Отправить сообщение
```

## 📊 Структура данных

### User
```json
{
  "id": "uuid",
  "username": "seller1",
  "email": "seller@example.com",
  "phone": "+1234567890",
  "user_type": "seller",
  "first_name": "John",
  "last_name": "Doe",
  "photo_url": "https://...",
  "description": "Professional seller",
  "is_verified": true,
  "telegram_id": 123456789
}
```

### Product
```json
{
  "id": "uuid",
  "seller": "uuid",
  "name": "iPhone 15",
  "description": "Latest Apple smartphone",
  "price": "999.99",
  "category": "electronics",
  "image_url": "https://...",
  "stock": 50,
  "is_active": true,
  "reviews_count": 5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Order
```json
{
  "id": "uuid",
  "order_number": "ORD-123abc",
  "buyer": "uuid",
  "status": "pending",
  "total_amount": "1500.00",
  "items": [
    {
      "id": "uuid",
      "product": {...},
      "quantity": 2,
      "price": "999.99"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

## ✅ Чек-лист запуска

- [ ] Создан Telegram Bot (@BotFather)
- [ ] Получен TELEGRAM_BOT_TOKEN
- [ ] Установлен .env файл
- [ ] Запущен docker-compose или manual setup
- [ ] Базы данных инициализирована
- [ ] API доступен на http://localhost:8000/api/
- [ ] Frontend доступен на http://localhost:3000/
- [ ] Можно залогиниться (admin/admin123)
- [ ] Mini App добавлена в бота
- [ ] Работают все CRUD операции

## 🐛 Решение проблем

### "Connection refused"
```
# Проверить статус контейнеров
docker-compose ps

# Просмотреть логи
docker-compose logs backend
```

### "Database error"
```
# Пересоздать БД
docker-compose down -v
docker-compose up -d
```

### "Telegram verification failed"
```
# Проверить initData
console.log(window.Telegram.WebApp.initData);

# Убедиться что BOT_TOKEN правильный
echo $TELEGRAM_BOT_TOKEN
```

## 📞 Поддержка

Если есть проблемы - создай Issue на GitHub!
