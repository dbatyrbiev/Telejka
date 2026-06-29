# Telejka - Telegram Mini App Marketplace

Полнофункциональный маркетплейс для Telegram в виде Mini App, где продавцы магазинов могут публиковать товары, а покупатели покупать их.

## Функционал

- 🛍️ **Каталог товаров** - Продавцы публикуют свои товары
- 🔍 **Поиск и фильтры** - По названию, цене, продавцу
- 👤 **Профили продавцов** - История, рейтинг, отзывы
- 🛒 **Корзина** - Добавление товаров и оформление заказа
- 💳 **Система оплаты** - Интеграция с платёжными системами
- 💬 **Чаты** - Коммуникация между продавцом и покупателем
- 📦 **Управление заказами** - Отслеживание статуса
- ⭐ **Рейтинги и от��ывы** - Оценка товаров и продавцов

## Технологический стек

### Backend
- **Node.js** + Express.js
- **PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Socket.io** - Чаты в реальном времени

### Frontend
- **HTML5** + CSS3 + Vanilla JavaScript
- **Telegram Web App API** - Интеграция с Telegram
- **LocalStorage** - Кэширование данных

## Структура проекта

```
Telejka/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── pages/
│   │   │   ├── home.js
│   │   │   ├── catalog.js
│   │   │   ├── seller.js
│   │   │   ├── cart.js
│   │   │   ├── checkout.js
│   │   │   ├── orders.js
│   │   │   ├── chat.js
│   │   │   └── profile.js
│   │   └── components/
│   │       ├── modal.js
│   │       ├── notification.js
│   │       └── loader.js
│   └── assets/
└── docker-compose.yml
```

## Установка и запуск

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Отредактируй .env с твоими переменными
npm run dev
```

### Frontend

Открой `frontend/index.html` в браузере или развёрнутый сервер.

## API Endpoints

Документация API доступна в `backend/README.md`

## Telegram Bot Setup

1. Создай бота через @BotFather в Telegram
2. Установи Web App URL в настройках бота
3. Используй Bot Token в .env файле

## Лицензия

MIT

## Автор

Telejka Team
