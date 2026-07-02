#!/bin/bash

echo "🚀 Starting Telejka..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit it with your settings!"
    echo ""
    exit 1
fi

# Load environment
set -a
source .env
set +a

echo "✅ Environment loaded"
echo ""

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if database is ready
echo "📊 Initializing database..."
docker-compose exec -T backend python backend/load_data.py

echo ""
echo "✅ Telejka is ready!"
echo ""
echo "📍 Access Points:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔌 API:       http://localhost:8000/api/"
echo "   📚 Docs:      http://localhost:8000/api/docs/"
echo "   🛠️  Admin:      http://localhost:8000/admin/"
echo ""
echo "🔐 Credentials:"
echo "   Admin:      admin / admin123"
echo "   Buyer:      buyer1 / buyer123"
echo "   Seller:     seller1 / seller123"
echo ""
echo "🤖 Next Steps:"
echo "   1. Register bot with @BotFather on Telegram"
echo "   2. Add TELEGRAM_BOT_TOKEN to .env"
echo "   3. Run: python backend/telegram_bot.py"
echo ""
