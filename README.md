# ShieldOps

Интерактивный симулятор кибербезопасности

> **Образовательный проект для изучения основ кибербезопасности**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://typescriptlang.org)

---

## Описание

Интерактивный симулятор кибербезопасности для обучения основам защиты в цифровом мире:
- Авторизации и регистрации пользователей
- Прохождения сюжетных сценариев с выбором действий
- Анализа последствий решений и объяснения опасностей
- Системы подсказок с прогрессивным раскрытием
- Лидерборда и сертификатов
- Адаптивной сложности на основе паттернов поведения

---

## Функционал по ТЗ

### Модуль 1: Авторизация
- [x] Вход по логину/паролю
- [x] Регистрация пользователей
- [x] Хеширование паролей (bcrypt)
- [x] JWT токены

### Модуль 2: Симулятор
- [x] 3 сюжетные линии (Офис, Дом, Общественный Wi-Fi)
- [x] 6 интерактивных кейсов
- [x] 6 типов атак
- [x] Симуляция окружения (Email, Chat, Browser, Phone, Workspace)
- [x] Система подсказок (3 уровня)
- [x] Объяснение опасности после каждого шага

### Модуль 3: Прогресс и аналитика
- [x] Отслеживание прогресса обучения
- [x] Лидерборд (Redis кэш)
- [x] Сертификаты
- [x] WebSocket для live-обновлений

### Модуль 4: Адаптивная сложность
- [x] Уровни: novice → intermediate → advanced
- [x] Анализ паттернов поведения
- [x] Масштабируемая система сценариев

---

## Быстрый старт

### 1. Запуск

```bash
docker compose up --build
```

### 2. Доступ

- **Приложение:** http://localhost:8000
- **Swagger API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Структура проекта

```
ShieldOps/
├── frontend/
│   ├── src/
│   │   ├── components/     # UI компоненты (Auth, HUD, ScenarioView, etc.)
│   │   ├── store/          # Zustand state management
│   │   ├── lib/            # API client, utils
│   │   └── types/          # TypeScript типы
│   └── package.json
├── backend/
│   └── app/
│       ├── routers/        # API эндпоинты
│       ├── services/       # Бизнес-логика
│       ├── data/           # Seed-данные сценариев
│       └── ws/             # WebSocket менеджер
├── docs/
│   ├── ERD.mmd             # ER-диаграмма
│   └── API.md              # API документация
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Auth
| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/v1/auth/register` | Регистрация |
| POST | `/api/v1/auth/login` | Вход |

### Simulator
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/simulator/state` | Состояние симулятора |
| POST | `/api/v1/simulator/attempt` | Попытка действия |

### Leaderboard & Certificate
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/leaderboard` | Лидерборд |
| GET | `/api/v1/certificate/me` | Сертификат пользователя |

### System
| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/health` | Проверка здоровья |
| WS | `/ws/progress?token=...` | WebSocket прогресса |

---

## Docker

```bash
# Запуск
docker compose up --build

# Логи
docker compose logs -f

# Остановка
docker compose down
```

---

## Безопасность

- Хеширование паролей (bcrypt)
- JWT аутентификация
- Все атаки симулированы на уровне UI/текста
- Для production требуется reverse proxy с TLS 1.2+
- PostgreSQL для хранения данных
- Redis для кэширования лидерборда

---

## Дизайн

- Тёмная тема с glassmorphism-эффектами
- Framer Motion анимации
- Tailwind CSS v4
- Полная адаптивность (мобильные, планшеты, десктоп)
- Плавные переходы между экранами
- Анимация последствий взлома (breach-pulse, shake, slide-up)

---

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

---

## Технологии

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- Framer Motion (анимации)

**Backend:**
- FastAPI
- PostgreSQL
- Redis
- WebSocket
- SQLAlchemy
- bcrypt

---

## Документация

- [ER-диаграмма](./docs/ERD.mmd)
- [API документация](./docs/API.md)

---

## Лицензия

Образовательный проект
