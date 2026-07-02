import os
import sys
import django
from pathlib import Path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from shop.models import User, Product, Cart, Order, Chat, Message
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
import random

User = get_user_model()

print("🗑️ Clearing old data...")
Product.objects.all().delete()
Order.objects.all().delete()
Chat.objects.all().delete()
Message.objects.all().delete()

print("👥 Creating users...")

# Admin
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@telejka.com',
        'phone': '+1234567890',
        'user_type': 'buyer',
        'first_name': 'Admin',
        'is_staff': True,
        'is_superuser': True
    }
)
admin_user.set_password('admin123')
admin_user.save()

# Test buyers
buyers = []
for i in range(1, 4):
    buyer, _ = User.objects.get_or_create(
        username=f'buyer{i}',
        defaults={
            'email': f'buyer{i}@telejka.com',
            'phone': f'+123456789{i}',
            'user_type': 'buyer',
            'first_name': f'Buyer {i}',
        }
    )
    buyer.set_password('buyer123')
    buyer.save()
    buyers.append(buyer)

# Test sellers
sellers = []
for i in range(1, 4):
    seller, _ = User.objects.get_or_create(
        username=f'seller{i}',
        defaults={
            'email': f'seller{i}@telejka.com',
            'phone': f'+987654321{i}',
            'user_type': 'seller',
            'first_name': f'Seller {i}',
            'description': f'Professional seller #{i}',
            'is_verified': True
        }
    )
    seller.set_password('seller123')
    seller.save()
    sellers.append(seller)

print(f"✅ Created {len(buyers)} buyers and {len(sellers)} sellers")

print("🛍️ Creating sample products...")

products_data = [
    ('iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 999.99, 'electronics'),
    ('Samsung Galaxy S24', 'Flagship Android phone with 200MP camera', 899.99, 'electronics'),
    ('MacBook Pro 16"', 'Powerful laptop for professionals', 2499.99, 'electronics'),
    ('The Lean Startup', 'How Today\'s Entrepreneurs Use Continuous Innovation', 25.99, 'books'),
    ('T-Shirt Blue', 'Comfortable cotton t-shirt', 19.99, 'clothes'),
    ('Wireless Headphones', 'High-quality sound with noise cancellation', 149.99, 'electronics'),
    ('Java Programming', 'Complete guide to Java programming', 45.99, 'books'),
    ('Running Shoes', 'Professional athletic running shoes', 129.99, 'clothes'),
    ('USB-C Cable', 'Fast charging USB-C cable 2m', 12.99, 'electronics'),
    ('Winter Jacket', 'Warm waterproof jacket for winter', 199.99, 'clothes'),
]

products = []
for name, description, price, category in products_data:
    product = Product.objects.create(
        seller=random.choice(sellers),
        name=name,
        description=description,
        price=price,
        category=category,
        image_url=f'https://via.placeholder.com/400x400?text={name.replace(" ", "+")}',
        stock=random.randint(10, 100),
        is_active=True
    )
    products.append(product)

print(f"✅ Created {len(products)} sample products")

print("📦 Creating sample orders...")

for buyer in buyers:
    for _ in range(random.randint(1, 3)):
        order = Order.objects.create(
            buyer=buyer,
            status=random.choice(['pending', 'confirmed', 'shipped', 'delivered']),
            total_amount=random.randint(50, 500)
        )
        order.order_number = f"ORD-{order.id}"
        order.save()
        
        # Add items to order
        for _ in range(random.randint(1, 3)):
            product = random.choice(products)
            from shop.models import OrderItem
            OrderItem.objects.create(
                order=order,
                product=product,
                seller=product.seller,
                quantity=random.randint(1, 5),
                price=product.price
            )

print(f"✅ Created sample orders")

print("💬 Creating sample chats...")

for buyer in buyers[:2]:
    for seller in sellers[:2]:
        chat = Chat.objects.create(user1=buyer, user2=seller)
        for i in range(random.randint(2, 5)):
            Message.objects.create(
                chat=chat,
                sender=buyer if i % 2 == 0 else seller,
                message=f"Sample message {i}"
            )

print(f"✅ Created sample chats with messages")

print("\n" + "="*50)
print("✅ DATABASE SUCCESSFULLY INITIALIZED!")
print("="*50)
print("\n📋 Test Credentials:\n")
print("Admin:")
print("  Username: admin")
print("  Password: admin123\n")
print("Buyers:")
for i in range(1, 4):
    print(f"  Username: buyer{i}")
    print(f"  Password: buyer123")
print()
print("Sellers:")
for i in range(1, 4):
    print(f"  Username: seller{i}")
    print(f"  Password: seller123")
print()
print("🔗 API Endpoints:\n")
print("  http://localhost:8000/api/")
print("  http://localhost:8000/admin/")
print("  http://localhost:8000/api/docs/\n")
