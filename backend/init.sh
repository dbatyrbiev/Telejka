#!/bin/bash

set -e

echo "🚀 Starting Telejka initialization..."

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running migrations..."
python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@telejka.com', 'admin123', phone='+1234567890')
    print('✅ Superuser created: admin / admin123')
else:
    print('ℹ️ Superuser already exists')
END

# Load sample data
echo "🛍️ Loading sample products..."
python manage.py shell << 'END'
from shop.models import User, Product, Review
from django.contrib.auth import get_user_model
User = get_user_model()

# Create sellers
sellers = []
for i in range(1, 4):
    seller, created = User.objects.get_or_create(
        username=f'seller{i}',
        defaults={
            'email': f'seller{i}@telejka.com',
            'phone': f'+12345678{i}0',
            'user_type': 'seller',
            'first_name': f'Seller {i}',
            'description': f'Professional seller #{i}',
            'is_verified': True
        }
    )
    if created:
        seller.set_password('seller123')
        seller.save()
    sellers.append(seller)

# Create sample products
products_data = [
    {
        'name': 'iPhone 15 Pro',
        'description': 'Latest Apple smartphone with A17 Pro chip',
        'price': 999.99,
        'category': 'electronics',
        'image_url': 'https://via.placeholder.com/400x400?text=iPhone+15',
        'stock': 50
    },
    {
        'name': 'Samsung Galaxy S24',
        'description': 'Flagship Android phone with 200MP camera',
        'price': 899.99,
        'category': 'electronics',
        'image_url': 'https://via.placeholder.com/400x400?text=Galaxy+S24',
        'stock': 45
    },
    {
        'name': 'MacBook Pro 16"',
        'description': 'Powerful laptop for professionals',
        'price': 2499.99,
        'category': 'electronics',
        'image_url': 'https://via.placeholder.com/400x400?text=MacBook+Pro',
        'stock': 20
    },
    {
        'name': 'The Lean Startup',
        'description': 'How Today\'s Entrepreneurs Use Continuous Innovation',
        'price': 25.99,
        'category': 'books',
        'image_url': 'https://via.placeholder.com/400x400?text=Lean+Startup',
        'stock': 100
    },
    {
        'name': 'T-Shirt Blue',
        'description': 'Comfortable cotton t-shirt',
        'price': 19.99,
        'category': 'clothes',
        'image_url': 'https://via.placeholder.com/400x400?text=T-Shirt',
        'stock': 200
    },
    {
        'name': 'Wireless Headphones',
        'description': 'High-quality sound with noise cancellation',
        'price': 149.99,
        'category': 'electronics',
        'image_url': 'https://via.placeholder.com/400x400?text=Headphones',
        'stock': 75
    },
]

for i, product_data in enumerate(products_data):
    product, created = Product.objects.get_or_create(
        name=product_data['name'],
        defaults={
            **product_data,
            'seller': sellers[i % len(sellers)],
            'is_active': True
        }
    )
    if created:
        print(f'✅ Created product: {product.name}')

print(f'\n✅ Created {len(products_data)} sample products')
END

echo ""
echo "✅ Initialization complete!"
echo ""
echo "🔐 Admin credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📍 Access points:"
echo "   API: http://localhost:8000/api/"
echo "   Admin: http://localhost:8000/admin/"
echo "   Docs: http://localhost:8000/api/docs/"
echo "   Frontend: http://localhost:3000/"
echo ""
