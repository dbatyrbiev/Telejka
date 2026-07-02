from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from shop.models import User, Product, Cart, CartItem, Order, OrderItem, Chat, Message, Review
from shop.serializers import (
    UserSerializer, ProductSerializer, CartSerializer, OrderSerializer,
    ReviewSerializer, ChatSerializer, MessageSerializer
)
from shop.permissions import IsSellerOrReadOnly, IsOwnerOrReadOnly
import uuid

class UserViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(**serializer.validated_data)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def get_users(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_review(self, request, pk=None):
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, buyer=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def get_cart(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('productId')
        quantity = request.data.get('quantity', 1)
        
        product = get_object_or_404(Product, id=product_id)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            item.quantity += quantity
            item.save()
        
        return Response(CartSerializer(cart).data)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('itemId')
        CartItem.objects.filter(id=item_id, cart=cart).delete()
        return Response(CartSerializer(cart).data)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(Q(buyer=self.request.user) | Q(items__seller=self.request.user)).distinct()
    
    def perform_create(self, serializer):
        cart = get_object_or_404(Cart, user=self.request.user)
        order = serializer.save(buyer=self.request.user)
        order.order_number = f"ORD-{order.id}"
        order.save()
        
        total = 0
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                seller=item.product.seller,
                quantity=item.quantity,
                price=item.product.price
            )
            total += item.product.price * item.quantity
        
        order.total_amount = total
        order.save()
        cart.items.all().delete()

class SellerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(user_type='seller')
    serializer_class = UserSerializer
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        seller = self.get_object()
        products = seller.products.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def rating(self, request, pk=None):
        seller = self.get_object()
        reviews = Review.objects.filter(product__seller=seller)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        return Response({
            'total_reviews': reviews.count(),
            'average_rating': avg_rating,
            'total_sales': OrderItem.objects.filter(seller=seller).count()
        })

class ChatViewSet(viewsets.ModelViewSet):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Chat.objects.filter(Q(user1=self.request.user) | Q(user2=self.request.user))
    
    def perform_create(self, serializer):
        user2_id = self.request.data.get('userId')
        user2 = get_object_or_404(User, id=user2_id)
        chat, _ = Chat.objects.get_or_create(
            user1=self.request.user,
            user2=user2
        )
        serializer = ChatSerializer(chat)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        message = request.data.get('message')
        msg = Message.objects.create(chat=chat, sender=request.user, message=message)
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)
