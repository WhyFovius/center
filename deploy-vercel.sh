#!/bin/bash

# Zero Day - Деплой на Vercel
# Использование: ./deploy-vercel.sh [--prod]

set -e

echo "🛡️  Zero Day Vercel Deploy"
echo "=========================="

# Проверка что мы в корне проекта
if [ ! -f "vercel.json" ]; then
    echo "❌ Ошибка: vercel.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Установка Vercel CLI..."
    npm install -g vercel
fi

# Проверка .env файлов
if [ ! -f ".env" ]; then
    echo "⚠️  .env файл не найден!"
    echo "   Скоируйте .env.example в .env и заполните значения"
    exit 1
fi

if [ ! -f "frontend/.env.production" ]; then
    echo "⚠️  frontend/.env.production не найден!"
    echo "   Создайте файл с VITE_API_URL=/api/v1"
    exit 1
fi

# Деплой
if [[ "$1" == "--prod" ]]; then
    echo "🚀 Деплой в production..."
    vercel --prod
else
    echo "🔧 Деплой в development..."
    vercel
fi

echo ""
echo "✅ Деплой завершен!"
echo "📝 Не забудь настроить переменные окружения в Vercel Dashboard:"
echo "   - DATABASE_URL"
echo "   - SECRET_KEY"
echo "   - REDIS_URL"
echo "   - OPENROUTER_API_KEY (опционально)"
