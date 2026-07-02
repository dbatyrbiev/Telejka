from rest_framework import serializers
from shop.models import User, Product, Cart, CartItem, Order, OrderItem, Chat, Message, Review
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'user_type', 'photo_url', 'description', 'is_verified']
        read_only_fields = ['id']

class UserDetailSerializer(UserSerializer):
    class Meta:
        model = User
        fields = UserSerializer.Meta.fields + ['created_at', 'updated_at']

class ProductSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    reviews_count = serializers.SerializerMethodField()
    
    def get_reviews_count(self, obj):
        return obj.reviews.count()
    
    class Meta:
        model = Product
        fields = ['id', 'seller', 'seller_name', 'name', 'description', 'price', 'image_url', 'category', 'stock', 'is_active', 'reviews_count', 'created_at']
        read_only_fields = ['id', 'created_at']

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'created_at', 'updated_at']

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'buyer', 'buyer_name', 'status', 'total_amount', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'order_number', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'product', 'buyer', 'buyer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'user1', 'user2', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at']
