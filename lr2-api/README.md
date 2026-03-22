# Лабораторна робота №2 — Система пропусків REST API

## Варіант №8: Система пропусків у комп'ютерний клас

### Запуск

```bash
npm install
npm run dev      # режим розробки (з автоперезапуском)
npm start        # звичайний запуск
```

Сервер запускається на `http://localhost:3000`

---

## Реалізовані сутності

### Users (Користувачі)
| Поле      | Тип    | Опис                      |
|-----------|--------|---------------------------|
| id        | string | UUID, генерується сервером |
| fullName  | string | ПІБ (мін. 2 символи)       |
| email     | string | Унікальна email-адреса     |
| role      | string | Роль (напр. "Студент")     |
| createdAt | string | ISO дата створення         |

### Passes (Пропуски)
| Поле        | Тип    | Опис                                                                |
|-------------|--------|---------------------------------------------------------------------|
| id          | string | UUID, генерується сервером                                          |
| studentName | string | ПІБ студента (мін. 2 символи)                                       |
| reason      | string | Причина: "Навчання", "Лабораторна робота", "Робота над проектом", "Технічне обслуговування" |
| validUntil  | string | Дата дії YYYY-MM-DD (не в минулому)                                 |
| issuerName  | string | ПІБ викладача (мін. 2 символи)                                      |
| comment     | string | Коментар (до 500 символів, необов'язково)                           |
| createdAt   | string | ISO дата створення                                                  |

---

## Маршрути API

### Users
```
GET    /api/users          — список користувачів
GET    /api/users/:id      — користувач за ID
POST   /api/users          — створити користувача
PUT    /api/users/:id      — оновити користувача
DELETE /api/users/:id      — видалити користувача
```

### Passes
```
GET    /api/passes                        — список пропусків (підтримує ?reason=...&studentName=...)
GET    /api/passes/:id                    — пропуск за ID
POST   /api/passes                        — створити пропуск
PUT    /api/passes/:id                    — оновити пропуск
DELETE /api/passes/:id                    — видалити пропуск
```

---

## Приклади запитів (curl)

### Перевірка сервера
```bash
curl -i http://localhost:3000/health
```

---

### Users

#### Створити користувача (успіх → 201)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Іванов Іван Іванович\",\"email\":\"ivan@example.com\",\"role\":\"Студент\"}"
```

#### Створити з помилкою валідації (→ 400)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"not-an-email\",\"role\":\"Студент\"}"
```

#### Список користувачів (→ 200)
```bash
curl -i http://localhost:3000/api/users
```

#### Отримати за ID (→ 200 або 404)
```bash
curl -i http://localhost:3000/api/users/<ID>
```

#### Оновити (→ 200)
```bash
curl -i -X PUT http://localhost:3000/api/users/<ID> \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Петренко Петро Петрович\"}"
```

#### Видалити (→ 204)
```bash
curl -i -X DELETE http://localhost:3000/api/users/<ID>
```

---

### Passes

#### Створити пропуск (→ 201)
```bash
curl -i -X POST http://localhost:3000/api/passes \
  -H "Content-Type: application/json" \
  -d "{\"studentName\":\"Коваль Олена\",\"reason\":\"Навчання\",\"validUntil\":\"2026-06-30\",\"issuerName\":\"Шевченко Т.Г.\",\"comment\":\"Доступ до ПК №5\"}"
```

#### Створити з невірною причиною (→ 400)
```bash
curl -i -X POST http://localhost:3000/api/passes \
  -H "Content-Type: application/json" \
  -d "{\"studentName\":\"Коваль Олена\",\"reason\":\"Відпочинок\",\"validUntil\":\"2026-06-30\",\"issuerName\":\"Шевченко Т.Г.\"}"
```

#### Список пропусків з фільтром (→ 200)
```bash
curl -i "http://localhost:3000/api/passes?reason=Навчання"
curl -i "http://localhost:3000/api/passes?studentName=Коваль"
```

#### Видалити (→ 204)
```bash
curl -i -X DELETE http://localhost:3000/api/passes/<ID>
```

#### Неіснуючий ID (→ 404)
```bash
curl -i http://localhost:3000/api/passes/non-existent-id
```

---

## Формат помилок

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "email", "message": "email must be a valid email address" }
    ]
  }
}
```
