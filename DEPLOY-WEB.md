# Деплой: Фронтенд на бесплатном хостинге + Бэкенд на ПК

## Архитектура

```
[Браузер] --> [Vercel/Netlify (фронт)] --> [Твой ПК:8000 (бэк)]
```

Фронтенд собирается в статические файлы и хостится бесплатно. Бэкенд работает у тебя на ПК.

---

## 1. Проброс порта (бэкенд должен быть доступен из интернета)

### Вариант A: ngrok (рекомендуется)
```bash
# 1. Скачай ngrok: https://ngrok.com/download
# 2. Запусти бэкенд:
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. В другом терминале пробрось порт:
ngrok http 8000

# 4. Скопируй URL вида: https://xxxx-xx-xx-xxx.ngrok-free.app
```

### Вариант B: Cloudflare Tunnel
```bash
# Установка:
cloudflared tunnel --url http://localhost:8000
```

### Вариант C: LocalTunnel
```bash
npx localtunnel --port 8000
```

---

## 2. Настройка CORS в бэкенде

В `.env` бэкенда добавь домен фронтенда (после деплоя):

```env
CORS_ORIGINS=["https://your-app.vercel.app"]
```

Или в `.env` на ПК для локальной разработки:
```env
CORS_ORIGINS=["http://localhost:5173", "https://your-app.vercel.app"]
```

---

## 3. Деплой фронтенда

### Вариант A: Vercel (рекомендуется)

```bash
# 1. Установи Vercel CLI:
npm i -g vercel

# 2. В папке фронтенда:
cd frontend

# 3. Создай .env.production:
echo "VITE_API_URL=https://xxxx-xx-xx-xxx.ngrok-free.app/api/v1" > .env.production

# 4. Задеплой:
vercel --prod
```

Или через GitHub:
1. Залей код на GitHub
2. Зайди на https://vercel.com
3. Импортируй репозиторий
4. В настройках проекта добавь环境变量:
   - `VITE_API_URL` = `https://xxxx-xx-xx-xxx.ngrok-free.app/api/v1`
5. Vercel сам соберёт и задеплоит

### Вариант B: Netlify

```bash
# 1. Собери фронтенд:
cd frontend && npm run build

# 2. Задеплой:
npx netlify deploy --prod --dir=dist
```

Или через drag-and-drop:
1. Зайди на https://app.netlify.com/drop
2. Перетащи папку `frontend/dist`

### Вариант C: GitHub Pages

```bash
# В frontend/package.json добавь:
"homepage": "https://your-username.github.io/repo-name"

# В vite.config.ts добавь:
base: '/repo-name/'

# Деплой:
npm run build
npx gh-pages -d dist
```

---

## 4. Финальная настройка

### На фронтенде (Vercel/Netlify):
В环境变量 (Environment Variables) добавь:
```
VITE_API_URL = https://твой-ngrok-url.ngrok-free.app/api/v1
```

### На бэкенде (твой ПК):
В `.env`:
```env
CORS_ORIGINS=["https://твой-фронтенд.vercel.app"]
```

---

## 5. Запуск

```bash
# 1. Запусти бэкенд:
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Запусти ngrok:
ngrok http 8000

# 3. Фронтенд уже на Vercel/Netlify — просто открой URL
```

---

## Важные замечания

1. **ngrok бесплатный** меняет URL при каждом перезапуске. Нужно обновлять `VITE_API_URL` на фронтенде
2. **Для стабильного URL** используй:
   - ngrok платный ($5/мес) — фиксированный домен
   - Или арендуй VPS за ~200₽/мес для бэкенда
3. **HTTPS** — ngrok даёт HTTPS автоматически
4. **Бэкенд должен работать** пока фронтенд используется. Если ПК выключен — API недоступен

---

## Быстрый старт (локально)

Для тестирования без деплоя:
```bash
# Терминал 1 - бэкенд:
cd backend && uvicorn app.main:app --reload --port 8000

# Терминал 2 - фронтенд:
cd frontend && npm run dev
```

Vite автоматически проксирует `/api/v1` на `localhost:8000`.
