# ShieldOps: Fullstack Educational Cybersecurity Simulator

Senior-level интерактивный симулятор кибербезопасности: **React 18 + TypeScript + Vite** (frontend) и **FastAPI + PostgreSQL + Redis** (backend).

## Что реализовано

### Фронтенд (React + TypeScript)
- **Компонентная архитектура**: Auth, HUD, MissionSidebar, ScenarioView, EnvironmentStage, ActionCard, FeedbackPanel, ProfileView
- **Zustand state management**: единый store с типизированным состоянием, без redux boilerplate
- **Framer Motion анимации**: плавные переходы между экранами, анимация последствий взлома (breach-pulse, shake, slide-up)
- **Tailwind CSS v4**: дизайн-система с тёмной темой, glassmorphism-эффекты, полная адаптивность
- **Масштабируемая система сценариев**: новые атаки добавляются через seed-данные без изменения ядра
- **Система подсказок**: 3 уровня с прогрессивным раскрытием и штрафами
- **Объяснение опасности**: после каждого шага — эмоциональный outcome, разбор missed signals, индуктивное правило
- **Симуляция окружения**: Email, Chat, Browser, Phone, Workspace — каждый с уникальным UI
- **Адаптивная сложность**: novice → intermediate → advanced на основе паттернов поведения

### Бэкенд (FastAPI)
- 3 сюжетные линии: `Офис`, `Дом`, `Общественный Wi-Fi`
- 6 интерактивных кейсов и 6 типов атак
- JWT-аутентификация, пароли хэшированы (bcrypt)
- WebSocket для live-обновления прогресса
- Redis кэш для лидерборда
- PostgreSQL: пользователи, сценарии, попытки, прогресс

## Архитектура

```
frontend/          React 18 + TypeScript + Vite + Tailwind
  src/
    components/    UI-компоненты (Auth, HUD, ScenarioView, etc.)
    store/         Zustand state management
    lib/           API client, utils
    types/         TypeScript типы
backend/           FastAPI API, SQLAlchemy модели
  app/
    routers/       API эндпоинты
    services/      Бизнес-логика
    data/          Seed-данные сценариев
    ws/            WebSocket менеджер
```

## Быстрый старт

```bash
docker compose up --build
```

Откройте:
- Приложение: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Основные API endpoint'ы

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/simulator/state`
- `POST /api/v1/simulator/attempt`
- `GET /api/v1/leaderboard`
- `GET /api/v1/certificate/me`
- `GET /api/v1/health`
- `WS /ws/progress?token=...`

## Данные и безопасность

- PostgreSQL хранит пользователей, сценарии, попытки и прогресс
- Redis используется для кэша лидерборда
- Все атаки симулированы на уровне UI/текста
- Для production требуется reverse proxy с TLS 1.2+

## Как добавить новый сценарий

Добавьте новый шаг в `backend/app/data/scenarios_seed.py` — ядро не требует изменений:

```python
{
    "code": "new-scenario",
    "title": "Название сценария",
    "attack_type": "Тип атаки",
    "location": "Локация",
    "brief": "Краткое описание",
    "payload": "Данные сценария (строки с ключ:значение)",
    "explanation": "Объяснение правильного ответа",
    "why_dangerous": "Почему неправильные действия опасны",
    "reference_items": ["OWASP A01", "CWE-XXX"],
    "options": [
        {
            "option_key": "A",
            "label": "Текст действия",
            "details": "Описание",
            "is_correct": True/False,
            "hint": "Подсказка",
            "impact_text": "Текст последствия",
            "points": 20,
            "security_delta": 5,
        },
        # ... ещё 3 варианта
    ],
}
```

## Документация по ТЗ

- ER-диаграмма: [docs/ERD.mmd](./docs/ERD.mmd)
- API описание: [docs/API.md](./docs/API.md)
