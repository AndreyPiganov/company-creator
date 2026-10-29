# Company Creator

Локальная панель с раздельными приложениями: интерфейс на Next.js, самостоятельный REST API на NestJS и Nginx как единая точка входа. Backend хранит данные в PostgreSQL через Prisma ORM, выполняет AI- и offline-генерацию, собирает неизменяемые статические сайты и отдаёт JSON/ZIP.

> Все компании, сотрудники, адреса и продукты являются вымышленными проектными данными.

## Возможности

- двуязычная карточка немецкой B2B AI-компании на русском и немецком;
- генерация локально, через OpenAI Responses API или OpenRouter;
- редактирование и утверждение карточки с ревизиями;
- автономный трёхстраничный RU/DE-сайт из утверждённого снимка;
- неизменяемые версии сайтов, preview того же артефакта и ZIP;
- экспорт канонической карточки в JSON;
- два идемпотентных примера и локальные синтетические портреты.

## Архитектура

| Компонент | Адрес | Назначение |
| --- | --- | --- |
| `infra/nginx` | <http://localhost:3000> | Nginx 1.30, единый публичный origin и reverse proxy |
| `apps/frontend` | Docker-сеть, порт `3000` | Next.js App Router, React, русскоязычная панель |
| `apps/backend` | Docker-сеть, порт `4000` | NestJS REST API, задачи, AI, рендер и экспорт |
| `postgres` | только Docker-сеть | PostgreSQL 17, Prisma ORM и миграции |

Nginx направляет `/api/*` и `/sites/*` в NestJS, остальные запросы — в Next.js. Поэтому браузер использует относительные same-origin URL, CORS для штатного Docker-сценария не требуется. Frontend не содержит API-ключей и не обращается к базе; его серверный рендер использует внутренний `BACKEND_INTERNAL_URL`. Подробности находятся в [описании архитектуры](docs/architecture.md), JSON Schema профиля — в [company-profile.schema.json](docs/company-profile.schema.json).

## Запуск через Docker

Требуются Docker Desktop и Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

После запуска:

- панель: <http://localhost:3000>;
- backend healthcheck через Nginx: <http://localhost:3000/api/health>;
- каталог провайдеров через Nginx: <http://localhost:3000/api/providers>;
- healthcheck самого Nginx: <http://localhost:3000/nginx-health>.

Порты frontend и backend наружу не публикуются. Для прямой отладки при host-разработке они по-прежнему запускаются отдельно командами `npm run dev:frontend` и `npm run dev:backend`.

Ключи не обязательны: примеры и offline-генератор работают без сети. PostgreSQL и сайты хранятся в volumes `company_creator_postgres` и `company_creator_sites`. Обычный `docker compose down` их сохраняет; `docker compose down -v` удаляет без возможности восстановления.

При переходе с прежней SQLite-версии существующий SQLite volume автоматически не импортируется. Новая PostgreSQL инициализируется миграцией и двумя примерами.

## Рабочий сценарий

1. В разделе «Новая компания» выберите offline или AI-провайдера.
2. Дождитесь завершения задачи: UI показывает этап, попытку и стоимость.
3. Проверьте и при необходимости измените RU/DE-поля.
4. Утвердите карточку.
5. Выберите язык и цветовую схему, создайте версию сайта.
6. Откройте preview, скачайте ZIP либо экспортируйте JSON.

Изменение утверждённой карточки увеличивает ревизию и возвращает статус `draft`. Ранее созданные сайты не меняются, потому что backend рендерит и сохраняет их из полного снимка профиля.

## Настройка AI

Скопируйте `.env.example` в `.env` и заполните нужный ключ:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna
OPENROUTER_API_KEY=
OPENROUTER_DEFAULT_MODEL=
AI_OPERATION_BUDGET_USD=0.25
AI_MAX_RETRIES=1
AI_REQUEST_TIMEOUT_MS=90000
```

Ключи передаются только контейнеру backend. Они не включаются в frontend bundle, ответы API, логи, PostgreSQL, JSON и ZIP.

### OpenAI

Адаптер использует Responses API и Structured Outputs. Ответ проверяется Zod и доменными валидаторами до записи. Разрешённые модели и цены задаются серверным каталогом; модель по умолчанию — `gpt-6-luna`.

### OpenRouter

Backend загружает каталог OpenRouter, оставляет модели с известной ценой и поддержкой структурированного ответа и кеширует результат на 15 минут. При наличии `usage.cost` именно это значение используется как фактическая стоимость.

### Бюджет и offline-режим

До внешнего запроса backend проверяет максимальную оценку против `AI_OPERATION_BUDGET_USD`. Допускается одна повторная попытка и только в пределах оставшегося бюджета. Seeded offline-генератор не обращается к сети и меняет бренд, город, историю, специализацию, продукт и состав команды.

## Проверки

```bash
docker compose run --rm backend-test npm test --workspace @company-creator/backend
docker compose run --rm backend-test npm run typecheck --workspace @company-creator/backend
docker compose run --rm backend-test npm run lint --workspace @company-creator/backend
docker compose run --rm frontend-test npm run typecheck --workspace @company-creator/frontend
docker compose run --rm frontend-test npm run lint --workspace @company-creator/frontend
docker compose run --rm --no-deps nginx nginx -t
docker compose up --build -d
docker compose ps
```

На машине с Node.js 24+:

```bash
npm ci
npm run dev:backend
npm run dev:frontend
```

Для локального запуска PostgreSQL должен быть доступен по `DATABASE_URL`; перед первым запуском выполните `npm run prisma:deploy --workspace @company-creator/backend`.

## HTTP API

Все API-маршруты обслуживает NestJS на внутреннем порту `4000`; для браузера они доступны через Nginx и тот же адрес `http://localhost:3000`.

| Метод и путь | Назначение |
| --- | --- |
| `GET /api/health` | готовность backend и PostgreSQL |
| `GET /api/providers` | провайдеры, модели и бюджет без ключей |
| `POST /api/generation/companies` | запустить задачу генерации |
| `GET /api/jobs/:id` | этап, попытка, стоимость, результат или безопасная ошибка |
| `GET/POST /api/companies` | список и импорт валидного профиля |
| `GET/PATCH /api/companies/:id` | получить или изменить карточку |
| `POST /api/companies/:id/approve` | утвердить текущую ревизию |
| `GET/POST /api/companies/:id/sites` | список и создание версий сайта |
| `GET /api/companies/:id/export` | скачать канонический JSON |
| `GET /api/sites/:id/download` | скачать автономный ZIP |
| `GET /sites/:id/preview/...` | открыть сохранённый статический артефакт |

Задачи проходят состояния `queued`, `preparing`, `requesting`, `validating`, `retrying`, `saving`/`rendering`, `complete` или `failed`.

## Данные и безопасность

Prisma хранит `CompanyProfile`, вход задачи и снимок сайта в PostgreSQL `JSONB`; индексируемые поля вынесены в обычные колонки. Каждая запись проходит Zod и доменную проверку на границе репозитория. Проверяются RU/DE, ровно пять FAQ, минимум пять сотрудников, немецкий код города, уникальные ID, противоречия и шаблонные переменные.

ZIP содержит только `index.html`, `product.html`, `company.html`, `styles.css`, `favicon.svg` и локальный `assets/team.png`. Внешних URL, форм, скриптов и неподтверждённых возможностей нет.

## Ограничения

- один локальный пользователь, без авторизации и ролей;
- только Германия, размеры `small`/`medium` и B2B AI для инвестиционных исследований и анализа данных;
- один макет сайта с несколькими цветовыми схемами;
- фоновые задачи выполняются внутри процесса NestJS и не рассчитаны на горизонтальное масштабирование;
- без облачного деплоя, загрузок, логотипов клиентов, отзывов и контактных форм;
- доступность внешних моделей зависит от аккаунта провайдера.

## Структура проекта

```text
apps/frontend/src/app/          страницы Next.js
apps/frontend/src/components/   формы, polling и действия UI
apps/backend/src/               NestJS controllers и services
apps/backend/src/database/      Prisma-репозиторий и Zod-граница
apps/backend/src/lib/domain/    каноническая схема и валидаторы
apps/backend/src/lib/ai/        AI-адаптеры, prompt и бюджет
apps/backend/src/lib/site/      статический рендер и артефакты
apps/backend/prisma/            схема и PostgreSQL-миграции
apps/backend/test/              unit, adapter, integration и render-тесты
infra/nginx/                    образ и маршрутизация reverse proxy
docs/                           архитектура и JSON Schema
```
