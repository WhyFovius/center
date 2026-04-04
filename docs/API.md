# API Description

Интерактивная документация автоматически доступна после запуска:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

Основные endpoint'ы:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/simulator/state`
- `POST /api/v1/simulator/attempt`
- `GET /api/v1/leaderboard`
- `GET /api/v1/certificate/me`
- `GET /api/v1/health`
- `WS /ws/progress?token=...`
