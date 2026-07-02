# Telejka - Telegram Shop Platform

## 📦 Проект структура

```
Telejka/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── api.js
│       └── pages/
│           ├── home.js
│           ├── product.js
│           ├── catalog.js
│           ├── cart.js
│           ├── orders.js
│           ├── chats.js
│           ├── profile.js
│           └── seller.js
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── permissions.py
│   ├── manage.py
│   └── requirements.txt
└── README.md
```

## 🚀 Возможности

### Для покупателей
- ✅ Просмотр каталога товаров
- ✅ Поиск и фильтрация товаров
- ✅ Добавление товаров в корзину
- ✅ Оформление заказов
- ✅ История заказов
- ✅ Чат с продавцами
- ✅ Оставление отзывов
- ✅ Управление профилем

### Для продавцов
- ✅ Загрузка товаров
- ✅ Управление ассортиментом
- ✅ Просмотр заказов
- ✅ Рейтинг и отзывы
- ✅ Чат с покупателями
- ✅ Аналитика продаж

## 🛠️ Технологический стек

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla)
- Telegram WebApp API

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Celery (для фоновых задач)
- Redis (для кеширования)

## 📋 Установка

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 2. Environment Variables

Создайте `.env` файл:

```
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_NAME=telejka
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### 3. API Endpoints

#### Аутентификация
- `POST /api/auth/token/` - Получить token
- `POST /api/auth/token/refresh/` - Обновить token
- `POST /api/users/register/` - Регистрация
- `GET /api/users/me/` - Текущий пользователь

#### Товары
- `GET /api/products/` - Список товаров
- `POST /api/products/` - Создать товар (продавец)
- `GET /api/products/{id}/` - Детали товара
- `POST /api/products/{id}/add_review/` - Добавить отзыв

#### Корзина
- `GET /api/cart/get_cart/` - Получить корзину
- `POST /api/cart/add_item/` - Добавить товар
- `POST /api/cart/remove_item/` - Удалить товар

#### Заказы
- `GET /api/orders/` - Мои заказы
- `POST /api/orders/` - Создать заказ
- `GET /api/orders/{id}/` - Детали заказа

#### Продавцы
- `GET /api/sellers/` - Список продавцов
- `GET /api/sellers/{id}/products/` - Товары продавца
- `GET /api/sellers/{id}/rating/` - Рейтинг продавца

#### Чаты
- `GET /api/chats/` - Список чатов
- `POST /api/chats/` - Создать чат
- `POST /api/chats/{id}/send_message/` - Отправить сообщение

#### Отзывы
- `GET /api/reviews/` - Список отзывов
- `POST /api/reviews/` - Создать отзыв

## 🔐 Безопасность

- ✅ JWT аутентификация
- ✅ Permission-based access control
- ✅ CORS защита
- ✅ Валидация данных
- ✅ Rate limiting

## 📝 Лицензия

MIT License

## 👥 Автор

Telejka Development Team
