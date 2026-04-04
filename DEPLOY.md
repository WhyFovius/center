# 🚀 Деплой Zero Day

## Быстрый старт (локально)

```bash
docker compose up --build
```

Откройте: `http://localhost:8000`

---

## Бесплатный деплой

### Фронтенд → Vercel (бесплатно)

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Deploy → Vercel выдаст URL вида `https://zeroday.vercel.app`

### Бэкенд → Railway (бесплатно, $5 кредит/мес)

1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Добавьте сервисы:
   - **PostgreSQL**: Add Database → Railway создаст автоматически
   - **Redis**: Add Redis → Railway создаст автоматически
4. Variables (Settings → Variables):
   ```
   POSTGRES_HOST=<из Railway PostgreSQL>
   POSTGRES_USER=<из Railway PostgreSQL>
   POSTGRES_PASSWORD=<из Railway PostgreSQL>
   POSTGRES_DB=<из Railway PostgreSQL>
   REDIS_HOST=<из Railway Redis>
   REDIS_PORT=6379
   OPENROUTER_API_KEY=<ваш ключ с openrouter.ai>
   ```
5. Deploy → Railway выдаст URL вида `https://zeroday-production.up.railway.app`

### Фронтенд → бэкенд URL

В `frontend/.env.production` (или Vercel Environment Variables):
```
VITE_API_URL=https://zeroday-production.up.railway.app
```

В `frontend/vite.config.ts` обновите proxy:
```ts
server: {
  proxy: {
    '/api/v1': process.env.VITE_API_URL || 'http://localhost:8000',
  },
},
```

---

## Альтернативы

| Сервис | Фронтенд | Бэкенд | DB | Бесплатно |
|--------|----------|--------|----|-----------|
| **Vercel** | ✅ | ❌ | ❌ | ✅ |
| **Netlify** | ✅ | ❌ | ❌ | ✅ |
| **Railway** | ❌ | ✅ | ✅ | $5 кредит |
| **Render** | ✅ | ✅ | ❌ | ✅ (750ч/мес) |
| **Fly.io** | ❌ | ✅ | ❌ | 3 VM бесплатно |
| **Supabase** | ❌ | ❌ | ✅ | ✅ (500MB) |
| **Upstash** | ❌ | ❌ | ✅ Redis | ✅ (10K команд/день) |

### Рекомендуемая бесплатная связка:
- **Фронт**: Vercel (бесплатно, CDN, HTTPS)
- **Бэк**: Render (бесплатно, 750ч/мес)
- **DB**: Supabase (бесплатно, 500MB PostgreSQL)
- **Redis**: Upstash (бесплатно, 10K команд/день)
- **AI**: OpenRouter (бесплатные модели: google/gemma-3-1b-it)

---

## OpenRouter API Key

1. Зарегистрируйтесь на [openrouter.ai](https://openrouter.ai)
2. Получите API key
3. Добавьте в переменные окружения бэкенда: `OPENROUTER_API_KEY=sk-or-...`

Бесплатные модели:
- `google/gemma-3-1b-it` — быстрая, хорошая для генерации сценариев
- `meta-llama/llama-3.2-3b-instruct` — более качественная
- `mistralai/mistral-7b-instruct` — баланс скорости и качества
