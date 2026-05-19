# Лабораторна робота №3 — Система пропусків REST API + SQLite

## Варіант №8: Система пропусків у комп'ютерний клас

---

## Запуск

```bash
npm install
npm run dev      # режим розробки (nodemon)
npm start        # звичайний запуск
```

База даних створюється автоматично при першому запуску за шляхом `./data/app.db`.  
Файл `.db` **не зберігається в репозиторії** (`.gitignore`).
`
### Ініціалізація тестових даних (seed)

```bash
node src/db/seed.js
```

---

## Схема бази даних

### Таблиці та зв'язки

**Users** — користувачі системи
| Поле      | Тип     | Обмеження                                  |
|-----------|---------|--------------------------------------------|
| id        | INTEGER | PRIMARY KEY                                |
| fullName  | TEXT    | NOT NULL                                   |
| email     | TEXT    | NOT NULL, UNIQUE                           |
| role      | TEXT    | NOT NULL, CHECK IN ('Студент','Викладач','Адмін') |
| createdAt | TEXT    | NOT NULL (ISO формат)                      |

**Rooms** — аудиторії
| Поле     | Тип     | Обмеження              |
|----------|---------|------------------------|
| id       | INTEGER | PRIMARY KEY            |
| number   | TEXT    | NOT NULL, UNIQUE       |
| capacity | INTEGER | NOT NULL, CHECK (> 0)  |

**Passes** — пропуски
| Поле       | Тип     | Обмеження                                                                 |
|------------|---------|---------------------------------------------------------------------------|
| id         | INTEGER | PRIMARY KEY                                                               |
| userId     | INTEGER | NOT NULL, FK → Users(id) ON DELETE CASCADE                               |
| roomId     | INTEGER | NOT NULL, FK → Rooms(id) ON DELETE CASCADE                               |
| reason     | TEXT    | NOT NULL, CHECK IN ('Навчання','Лабораторна робота','Робота над проектом','Технічне обслуговування') |
| validUntil | TEXT    | NOT NULL                                                                  |
| issuerName | TEXT    | NOT NULL                                                                  |
| comment    | TEXT    | nullable                                                                  |
| createdAt  | TEXT    | NOT NULL (ISO формат)                                                     |

### Зв'язки
- `Users` 1:N `Passes` — один користувач може мати багато пропусків
- `Rooms` 1:N `Passes` — одна аудиторія може мати багато пропусків
- При видаленні User або Room — всі пов'язані Passes видаляються (CASCADE)

### Міграції
Схема керується через папку `src/db/migrations/`. При старті застосунок застосовує лише нові міграції (фіксація в таблиці `schema_migrations`).

---

## Маршрути API

### Users
GET    /api/users          — список користувачів
GET    /api/users/:id      — користувач за ID
POST   /api/users          — створити користувача
PUT    /api/users/:id      — оновити користувача
DELETE /api/users/:id      — видалити користувача

### Passes
GET    /api/passes                   — список пропусків (?reason=...&limit=...)
GET    /api/passes/:id               — пропуск за ID
POST   /api/passes                   — створити пропуск
PUT    /api/passes/:id               — оновити пропуск
DELETE /api/passes/:id               — видалити пропуск

---

## Приклади запитів (curl)

### Перевірка сервера
```bash
curl -i http://localhost:3000/health
```

### Створити користувача (201)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Іванов Іван Іванович\",\"email\":\"ivan@example.com\",\"role\":\"Студент\"}"
```

### Помилка валідації (400)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"not-an-email\",\"role\":\"Студент\"}"
```

### Список пропусків з фільтром і лімітом (WHERE + ORDER BY + LIMIT)
```bash
curl -i "http://localhost:3000/api/passes?reason=Навчання&limit=5"
```

### Дублікат email (409)
```bash
curl -i -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Інший\",\"email\":\"ivan@example.com\",\"role\":\"Студент\"}"
```

### Неіснуючий ID (404)
```bash
curl -i http://localhost:3000/api/passes/99999
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